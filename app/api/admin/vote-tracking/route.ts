import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { VoteModel, QuestionModel, PlayerModel } from '@/lib/models';

// GET - Get detailed vote tracking (who voted for whom)
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');
    
    const query: any = {};
    if (questionId) query.questionId = parseInt(questionId);
    
    const [votes, questions, players] = await Promise.all([
      VoteModel.find(query).sort({ questionId: 1, createdAt: 1 }),
      QuestionModel.find({ isActive: true }).sort({ order: 1 }),
      PlayerModel.find({ isActive: true }).sort({ id: 1 }),
    ]);
    
    // Group votes by question
    const votesByQuestion: Record<number, any[]> = {};
    
    votes.forEach(vote => {
      if (!votesByQuestion[vote.questionId]) {
        votesByQuestion[vote.questionId] = [];
      }
      votesByQuestion[vote.questionId].push({
        voter: {
          id: vote.voterId,
          name: vote.voterName,
        },
        votedFor: {
          id: vote.votedForId,
          name: vote.votedForName,
        },
        time: vote.createdAt,
      });
    });
    
    // Build response with question details
    const result = questions.map(q => ({
      questionId: q.id,
      question: q.question,
      type: q.type,
      order: q.order,
      totalVotes: votesByQuestion[q.id]?.length || 0,
      votes: votesByQuestion[q.id] || [],
    }));
    
    return NextResponse.json({
      questions: result,
      players: players.map(p => ({ id: p.id, name: p.name, emoji: p.emoji })),
      totalVotes: votes.length,
    });
  } catch (error) {
    console.error('Vote tracking error:', error);
    return NextResponse.json({ error: 'Failed to fetch vote tracking' }, { status: 500 });
  }
}
