import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { 
  PlayerModel, 
  QuestionModel, 
  VoteModel, 
  GameConfigModel, 
  GameSessionModel 
} from '@/lib/models';

// GET - Get collection stats
export async function GET() {
  try {
    await dbConnect();
    
    const [players, questions, votes, configs, sessions] = await Promise.all([
      PlayerModel.countDocuments(),
      QuestionModel.countDocuments(),
      VoteModel.countDocuments(),
      GameConfigModel.countDocuments(),
      GameSessionModel.countDocuments(),
    ]);
    
    return NextResponse.json({
      collections: {
        players: { count: players, name: 'Players' },
        questions: { count: questions, name: 'Questions' },
        votes: { count: votes, name: 'Votes' },
        gameconfigs: { count: configs, name: 'Game Config' },
        gamesessions: { count: sessions, name: 'Game Sessions' },
      },
      total: players + questions + votes + configs + sessions
    });
  } catch (error) {
    console.error('Collections GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

// DELETE - Delete specific collection or all
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    const password = searchParams.get('password');
    
    // Simple password protection
    const adminPassword = process.env.ADMIN_PASSWORD || 'yash2025';
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }
    
    let result: any = {};
    
    switch (collection) {
      case 'players':
        const p = await PlayerModel.deleteMany({});
        result = { collection: 'players', deleted: p.deletedCount };
        break;
        
      case 'questions':
        const q = await QuestionModel.deleteMany({});
        result = { collection: 'questions', deleted: q.deletedCount };
        break;
        
      case 'votes':
        const v = await VoteModel.deleteMany({});
        result = { collection: 'votes', deleted: v.deletedCount };
        break;
        
      case 'gameconfigs':
        const c = await GameConfigModel.deleteMany({});
        result = { collection: 'gameconfigs', deleted: c.deletedCount };
        break;
        
      case 'gamesessions':
        const s = await GameSessionModel.deleteMany({});
        result = { collection: 'gamesessions', deleted: s.deletedCount };
        break;
        
      case 'all':
        const [pAll, qAll, vAll, cAll, sAll] = await Promise.all([
          PlayerModel.deleteMany({}),
          QuestionModel.deleteMany({}),
          VoteModel.deleteMany({}),
          GameConfigModel.deleteMany({}),
          GameSessionModel.deleteMany({}),
        ]);
        result = {
          collection: 'all',
          deleted: {
            players: pAll.deletedCount,
            questions: qAll.deletedCount,
            votes: vAll.deletedCount,
            gameconfigs: cAll.deletedCount,
            gamesessions: sAll.deletedCount,
          },
          total: pAll.deletedCount + qAll.deletedCount + vAll.deletedCount + cAll.deletedCount + sAll.deletedCount
        };
        break;
        
      default:
        return NextResponse.json({ 
          error: 'Invalid collection. Use: players, questions, votes, gameconfigs, gamesessions, or all' 
        }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Collection "${collection}" deleted`,
      ...result 
    });
  } catch (error) {
    console.error('Collections DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}

// POST - Reseed database
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { password, seedType } = body;
    
    // Simple password protection
    const adminPassword = process.env.ADMIN_PASSWORD || 'yash2025';
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }
    
    // Default seed data
    const players = [
      { id: 1, name: "Mohsin", emoji: "😎", isActive: true },
      { id: 2, name: "Ganesh", emoji: "🔥", isActive: true },
      { id: 3, name: "Amit", emoji: "💪", isActive: true },
      { id: 4, name: "JP", emoji: "🎯", isActive: true },
      { id: 5, name: "Akash", emoji: "⚡", isActive: true },
      { id: 6, name: "Toran", emoji: "🌟", isActive: true },
      { id: 7, name: "Anup", emoji: "🎭", isActive: true },
      { id: 8, name: "Sambit", emoji: "🚀", isActive: true },
      { id: 9, name: "Yash", emoji: "👑", isActive: true },
      { id: 10, name: "Bhalu", emoji: "🐻", isActive: true },
      { id: 11, name: "Vishal", emoji: "💎", isActive: true },
    ];
    
    const gameConfig = {
      title: "YASH'S BACHELOR",
      subtitle: "Brutal Awards 2025",
      tagline: "Where friendships are tested & legends are made",
      date: "25th - 28th December 2025",
      groomName: "Yash",
      welcomeMessage: "Welcome to the most brutal game of the bachelor party! 🎉",
      isGameActive: true,
      currentQuestion: 0,
    };
    
    const gameSession = {
      sessionId: 'main',
      currentQuestionId: 1,
      currentQuestionIndex: 0,
      questionStartedAt: new Date(),
      votingDurationSeconds: 180,
      status: 'voting',
    };
    
    let result: any = {};
    
    switch (seedType) {
      case 'players':
        await PlayerModel.deleteMany({});
        await PlayerModel.insertMany(players);
        result = { seeded: 'players', count: players.length };
        break;
        
      case 'config':
        await GameConfigModel.deleteMany({});
        await GameConfigModel.create(gameConfig);
        result = { seeded: 'config', count: 1 };
        break;
        
      case 'session':
        await GameSessionModel.deleteMany({});
        await GameSessionModel.create(gameSession);
        result = { seeded: 'session', count: 1 };
        break;
        
      case 'fresh_start':
        // Clear votes and session, keep players and questions
        await VoteModel.deleteMany({});
        await GameSessionModel.deleteMany({});
        await GameSessionModel.create(gameSession);
        result = { 
          seeded: 'fresh_start', 
          cleared: ['votes', 'sessions'],
          created: ['new session']
        };
        break;
        
      default:
        return NextResponse.json({ 
          error: 'Invalid seedType. Use: players, config, session, or fresh_start' 
        }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Seeded "${seedType}"`,
      ...result 
    });
  } catch (error) {
    console.error('Collections POST error:', error);
    return NextResponse.json({ error: 'Failed to seed' }, { status: 500 });
  }
}
