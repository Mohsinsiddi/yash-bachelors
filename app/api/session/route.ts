import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { GameSessionModel, QuestionModel } from '@/lib/models';

// GET - Get current game session
export async function GET() {
  try {
    await dbConnect();
    
    let session = await GameSessionModel.findOne({ sessionId: 'main' });
    
    if (!session) {
      // Create default session
      const firstQuestion = await QuestionModel.findOne({ isActive: true }).sort({ order: 1 });
      session = await GameSessionModel.create({
        sessionId: 'main',
        currentQuestionId: firstQuestion?.id || 1,
        currentQuestionIndex: 0,
        questionStartedAt: new Date(),
        votingDurationSeconds: 180, // 3 minutes default
        status: 'voting',
      });
    }
    
    // Calculate time remaining
    const now = new Date();
    const startedAt = new Date(session.questionStartedAt);
    const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
    const remainingSeconds = Math.max(0, session.votingDurationSeconds - elapsedSeconds);
    const isVotingOpen = remainingSeconds > 0 && session.status === 'voting';
    const canRevealTwist = remainingSeconds === 0 || session.status === 'revealing' || session.status === 'results';
    
    return NextResponse.json({
      ...session.toObject(),
      elapsedSeconds,
      remainingSeconds,
      isVotingOpen,
      canRevealTwist,
      serverTime: now.toISOString(),
    });
  } catch (error) {
    console.error('Session GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

// PUT - Update game session (admin actions)
export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { action, ...data } = body;
    
    let session = await GameSessionModel.findOne({ sessionId: 'main' });
    
    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 404 });
    }
    
    switch (action) {
      case 'next_question':
        // Move to next question
        const questions = await QuestionModel.find({ isActive: true }).sort({ order: 1 });
        const nextIndex = session.currentQuestionIndex + 1;
        
        if (nextIndex >= questions.length) {
          session.status = 'completed';
        } else {
          session.currentQuestionIndex = nextIndex;
          session.currentQuestionId = questions[nextIndex].id;
          session.questionStartedAt = new Date();
          session.status = 'voting';
          session.twistRevealedAt = undefined;
        }
        break;
        
      case 'previous_question':
        // Go back to previous question
        const prevIndex = Math.max(0, session.currentQuestionIndex - 1);
        const allQuestions = await QuestionModel.find({ isActive: true }).sort({ order: 1 });
        session.currentQuestionIndex = prevIndex;
        session.currentQuestionId = allQuestions[prevIndex].id;
        session.questionStartedAt = new Date();
        session.status = 'voting';
        session.twistRevealedAt = undefined;
        break;
        
      case 'go_to_question':
        // Jump to specific question
        const targetIndex = data.questionIndex || 0;
        const qs = await QuestionModel.find({ isActive: true }).sort({ order: 1 });
        if (targetIndex >= 0 && targetIndex < qs.length) {
          session.currentQuestionIndex = targetIndex;
          session.currentQuestionId = qs[targetIndex].id;
          session.questionStartedAt = new Date();
          session.status = 'voting';
          session.twistRevealedAt = undefined;
        }
        break;
        
      case 'reveal_twist':
        // Mark twist as revealed
        session.status = 'results';
        session.twistRevealedAt = new Date();
        break;
        
      case 'start_revealing':
        // Transition to revealing state
        session.status = 'revealing';
        break;
        
      case 'extend_time':
        // Add more voting time
        const extraSeconds = data.seconds || 60;
        session.votingDurationSeconds += extraSeconds;
        break;
        
      case 'set_duration':
        // Set voting duration
        session.votingDurationSeconds = data.seconds || 180;
        break;
        
      case 'restart_timer':
        // Restart the timer for current question
        session.questionStartedAt = new Date();
        session.status = 'voting';
        session.twistRevealedAt = undefined;
        break;
        
      case 'reset_game':
        // Reset entire game
        const firstQ = await QuestionModel.findOne({ isActive: true }).sort({ order: 1 });
        session.currentQuestionIndex = 0;
        session.currentQuestionId = firstQ?.id || 1;
        session.questionStartedAt = new Date();
        session.status = 'voting';
        session.twistRevealedAt = undefined;
        break;
        
      default:
        // Direct update
        Object.assign(session, data);
    }
    
    session.updatedAt = new Date();
    await session.save();
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Session PUT error:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

// POST - Create new session (reset)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Delete existing session
    await GameSessionModel.deleteMany({ sessionId: 'main' });
    
    const firstQuestion = await QuestionModel.findOne({ isActive: true }).sort({ order: 1 });
    
    const session = await GameSessionModel.create({
      sessionId: 'main',
      currentQuestionId: firstQuestion?.id || 1,
      currentQuestionIndex: 0,
      questionStartedAt: new Date(),
      votingDurationSeconds: body.votingDurationSeconds || 180,
      status: 'voting',
    });
    
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Session POST error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
