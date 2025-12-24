import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { VoteModel, GameConfigModel, QuestionModel, PlayerModel } from '@/lib/models';

// POST - Reset game with various options
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { action, password } = body;
    
    // Simple password protection (change in .env for production)
    const adminPassword = process.env.ADMIN_PASSWORD || 'yash2025';
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }
    
    let result: any = {};
    
    switch (action) {
      case 'reset_votes':
        // Reset all votes only
        const votesDeleted = await VoteModel.deleteMany({});
        result = { 
          message: 'All votes reset',
          votesDeleted: votesDeleted.deletedCount
        };
        break;
        
      case 'reset_game':
        // Reset votes and game progress
        const votes = await VoteModel.deleteMany({});
        await GameConfigModel.updateOne({}, { currentQuestion: 0 });
        result = { 
          message: 'Game reset - votes cleared, progress reset',
          votesDeleted: votes.deletedCount
        };
        break;
        
      case 'reset_all':
        // Full reset - votes, restore questions, reset config
        const allVotes = await VoteModel.deleteMany({});
        await QuestionModel.updateMany({}, { isActive: true });
        await PlayerModel.updateMany({}, { isActive: true });
        await GameConfigModel.updateOne({}, { 
          currentQuestion: 0,
          isGameActive: true 
        });
        result = { 
          message: 'Full reset complete',
          votesDeleted: allVotes.deletedCount,
          questionsRestored: true,
          playersRestored: true
        };
        break;
        
      case 'flush_questions':
        // Delete all questions permanently
        const questionsDeleted = await QuestionModel.deleteMany({});
        result = {
          message: 'All questions deleted permanently',
          questionsDeleted: questionsDeleted.deletedCount
        };
        break;
        
      case 'flush_players':
        // Delete all players permanently
        const playersDeleted = await PlayerModel.deleteMany({});
        result = {
          message: 'All players deleted permanently',
          playersDeleted: playersDeleted.deletedCount
        };
        break;
        
      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: reset_votes, reset_game, reset_all, flush_questions, flush_players' 
        }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Admin reset error:', error);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
