import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { VoteModel } from '@/lib/models';

// GET - Fetch votes with filtering
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const odcId = searchParams.get('odcId');
    const questionId = searchParams.get('questionId');
    const all = searchParams.get('all') === 'true';
    
    const query: any = {};
    
    // Only filter by odcId if specifically requested
    if (odcId) query.odcId = odcId;
    
    // Filter by questionId
    if (questionId) query.questionId = parseInt(questionId);
    
    const votes = await VoteModel.find(query).sort({ createdAt: -1 });
    
    // Aggregate votes by player (count how many votes each player received)
    const voteCount: Record<number, number> = {};
    votes.forEach(vote => {
      voteCount[vote.votedForId] = (voteCount[vote.votedForId] || 0) + 1;
    });
    
    // If all=true, return detailed info for admin
    if (all) {
      const totalVotes = votes.length;
      const uniqueVoters = new Set(votes.map(v => v.voterId)).size;
      const questionIds = [...new Set(votes.map(v => v.questionId))];
      
      return NextResponse.json({
        votes,
        voteCount,
        stats: {
          totalVotes,
          uniqueVoters,
          questionsWithVotes: questionIds.length,
          questionIds
        }
      });
    }
    
    return NextResponse.json({ 
      votes, 
      voteCount,
      totalVotes: votes.length,
      uniqueVoters: new Set(votes.map(v => v.voterId)).size
    });
  } catch (error) {
    console.error('Votes GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
  }
}

// POST - Submit a vote
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { odcId, questionId, voterId, votedForId } = body;
    
    if (!odcId || !questionId || !voterId || !votedForId) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['odcId', 'questionId', 'voterId', 'votedForId']
      }, { status: 400 });
    }
    
    // Check if this voter already voted for this question
    const existingVote = await VoteModel.findOne({ 
      questionId, 
      voterId 
    });
    
    if (existingVote) {
      // Update existing vote (allow changing vote)
      existingVote.votedForId = votedForId;
      existingVote.odcId = odcId; // Update session if changed
      await existingVote.save();
      
      return NextResponse.json({ 
        ...existingVote.toObject(), 
        updated: true,
        message: 'Vote updated'
      });
    }
    
    // Create new vote
    const vote = await VoteModel.create({
      odcId,
      questionId,
      voterId,
      votedForId,
    });
    
    return NextResponse.json({ 
      ...vote.toObject(),
      created: true,
      message: 'Vote submitted'
    }, { status: 201 });
  } catch (error) {
    console.error('Votes POST error:', error);
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
}

// DELETE - Delete votes (various options)
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const odcId = searchParams.get('odcId');
    const questionId = searchParams.get('questionId');
    const voteId = searchParams.get('voteId');
    const voterId = searchParams.get('voterId');
    const all = searchParams.get('all') === 'true';
    
    let result;
    let message = '';
    
    if (voteId) {
      // Delete specific vote by _id
      result = await VoteModel.findByIdAndDelete(voteId);
      message = `Vote ${voteId} deleted`;
    } else if (voterId && questionId) {
      // Delete specific voter's vote for a question
      result = await VoteModel.deleteOne({ 
        voterId, 
        questionId: parseInt(questionId) 
      });
      message = `Deleted vote by ${voterId} for question ${questionId}`;
    } else if (questionId && odcId) {
      // Delete all votes for specific question in specific session
      result = await VoteModel.deleteMany({ 
        odcId, 
        questionId: parseInt(questionId) 
      });
      message = `Deleted ${result.deletedCount} votes for question ${questionId} in session ${odcId}`;
    } else if (questionId) {
      // Delete all votes for specific question (all sessions)
      result = await VoteModel.deleteMany({ questionId: parseInt(questionId) });
      message = `Deleted ${result.deletedCount} votes for question ${questionId}`;
    } else if (odcId) {
      // Delete all votes for specific session
      result = await VoteModel.deleteMany({ odcId });
      message = `Deleted all votes for session ${odcId}`;
    } else if (all) {
      // Delete ALL votes (reset entire game)
      result = await VoteModel.deleteMany({});
      message = `Deleted ALL ${result.deletedCount} votes - Game reset!`;
    } else {
      return NextResponse.json({ 
        error: 'Specify: voteId, questionId, odcId, voterId+questionId, or all=true' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, message, result });
  } catch (error) {
    console.error('Votes DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete votes' }, { status: 500 });
  }
}
