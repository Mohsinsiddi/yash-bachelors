import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { VoteModel } from '@/lib/models';

// GET - Check which questions a player has voted on
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const voterId = searchParams.get('voterId');
    
    if (!voterId) {
      return NextResponse.json({ error: 'voterId required' }, { status: 400 });
    }
    
    // Get all votes by this voter (player)
    const votes = await VoteModel.find({ voterId: parseInt(voterId) });
    
    // Build a map of questionId -> votedForId
    const votedQuestions: Record<number, number> = {};
    votes.forEach(vote => {
      votedQuestions[vote.questionId] = vote.votedForId;
    });
    
    return NextResponse.json({
      voterId: parseInt(voterId),
      votedQuestions,
      totalVotes: votes.length,
    });
  } catch (error) {
    console.error('Vote status error:', error);
    return NextResponse.json({ error: 'Failed to fetch vote status' }, { status: 500 });
  }
}
