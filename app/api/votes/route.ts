import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { VoteModel, PlayerModel } from '@/lib/models';

// GET votes
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');
    const voterId = searchParams.get('voterId');
    const detailed = searchParams.get('detailed') === 'true';
    
    const query: any = {};
    if (questionId) query.questionId = parseInt(questionId);
    if (voterId) query.voterId = parseInt(voterId);
    
    const votes = await VoteModel.find(query).sort({ createdAt: -1 });
    
    // Calculate vote counts per player
    const voteCount: Record<number, number> = {};
    votes.forEach(vote => {
      voteCount[vote.votedForId] = (voteCount[vote.votedForId] || 0) + 1;
    });
    
    // If detailed, include who voted for whom
    let voteDetails: any[] = [];
    if (detailed) {
      voteDetails = votes.map(v => ({
        voter: { id: v.voterId, name: v.voterName },
        votedFor: { id: v.votedForId, name: v.votedForName },
        questionId: v.questionId,
        time: v.createdAt,
      }));
    }
    
    return NextResponse.json({ 
      votes: detailed ? voteDetails : votes,
      voteCount,
      total: votes.length 
    });
  } catch (error) {
    console.error('Failed to fetch votes:', error);
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
  }
}

// POST - Create or update vote
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { questionId, voterId, voterName, votedForId } = body;
    
    if (!questionId || !voterId || !voterName || !votedForId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get voted-for player name
    const votedForPlayer = await PlayerModel.findOne({ id: votedForId });
    const votedForName = votedForPlayer?.name || '';
    
    // Upsert - update if exists, create if not
    const vote = await VoteModel.findOneAndUpdate(
      { voterId, questionId },
      { 
        questionId, 
        voterId, 
        voterName,
        votedForId, 
        votedForName,
        odcId: `vote_${voterId}_${questionId}_${Date.now()}`
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true, vote });
  } catch (error) {
    console.error('Failed to save vote:', error);
    return NextResponse.json({ error: 'Failed to save vote' }, { status: 500 });
  }
}

// DELETE - Remove vote(s)
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    const questionId = searchParams.get('questionId');
    const voterId = searchParams.get('voterId');
    const all = searchParams.get('all');
    
    let result;
    
    // Delete specific vote by voter + question
    if (voterId && questionId) {
      result = await VoteModel.deleteOne({ 
        voterId: parseInt(voterId), 
        questionId: parseInt(questionId) 
      });
      return NextResponse.json({ 
        success: true, 
        deleted: result.deletedCount,
        message: 'Your vote has been removed'
      });
    }
    
    // Delete all votes for a question (admin)
    if (questionId && !voterId) {
      result = await VoteModel.deleteMany({ questionId: parseInt(questionId) });
      return NextResponse.json({ success: true, deleted: result.deletedCount });
    }
    
    // Delete all votes (admin)
    if (all === 'true') {
      result = await VoteModel.deleteMany({});
      return NextResponse.json({ success: true, deleted: result.deletedCount });
    }
    
    return NextResponse.json({ error: 'No delete criteria provided' }, { status: 400 });
  } catch (error) {
    console.error('Failed to delete vote:', error);
    return NextResponse.json({ error: 'Failed to delete vote' }, { status: 500 });
  }
}
