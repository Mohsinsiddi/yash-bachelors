import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { VoteModel, QuestionModel, PlayerModel, GameConfigModel } from '@/lib/models';

// GET - Get game statistics
export async function GET() {
  try {
    await dbConnect();
    
    const [
      totalVotes,
      totalQuestions,
      activeQuestions,
      totalPlayers,
      activePlayers,
      config,
      votes
    ] = await Promise.all([
      VoteModel.countDocuments(),
      QuestionModel.countDocuments(),
      QuestionModel.countDocuments({ isActive: true }),
      PlayerModel.countDocuments(),
      PlayerModel.countDocuments({ isActive: true }),
      GameConfigModel.findOne(),
      VoteModel.find()
    ]);
    
    // Calculate votes per question
    const votesPerQuestion: Record<number, number> = {};
    const uniqueVoters = new Set<string>();
    const uniqueSessions = new Set<string>();
    
    votes.forEach(vote => {
      votesPerQuestion[vote.questionId] = (votesPerQuestion[vote.questionId] || 0) + 1;
      uniqueVoters.add(vote.voterId);
      uniqueSessions.add(vote.odcId);
    });
    
    // Get vote counts per player
    const votesReceived: Record<number, number> = {};
    votes.forEach(vote => {
      votesReceived[vote.votedForId] = (votesReceived[vote.votedForId] || 0) + 1;
    });
    
    return NextResponse.json({
      game: {
        title: config?.title,
        isActive: config?.isGameActive,
        currentQuestion: config?.currentQuestion
      },
      counts: {
        totalVotes,
        totalQuestions,
        activeQuestions,
        totalPlayers,
        activePlayers,
        uniqueVoters: uniqueVoters.size,
        uniqueSessions: uniqueSessions.size
      },
      votesPerQuestion,
      votesReceived
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
