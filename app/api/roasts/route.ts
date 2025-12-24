import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { PlayerModel, GameConfigModel } from '@/lib/models';

// GET - Get roast status (without revealing content)
export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const reveal = searchParams.get('reveal') === 'true';
    const playerId = searchParams.get('playerId');
    
    const config = await GameConfigModel.findOne();
    const isGlobalReveal = config?.roastsRevealed || false;
    
    const players = await PlayerModel.find({ isActive: true }).sort({ id: 1 });
    
    const roastData = players.map(p => ({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      // Only reveal if global reveal OR specific player requested with reveal=true
      roast: (isGlobalReveal || (reveal && playerId === String(p.id))) ? p.roast : null,
      dirtySecret: (isGlobalReveal || (reveal && playerId === String(p.id))) ? p.dirtySecret : null,
      prediction: (isGlobalReveal || (reveal && playerId === String(p.id))) ? p.prediction : null,
      isRevealed: isGlobalReveal,
    }));
    
    return NextResponse.json({
      players: roastData,
      globalReveal: isGlobalReveal,
    });
  } catch (error) {
    console.error('Roasts fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch roasts' }, { status: 500 });
  }
}

// POST - Reveal roasts (admin only)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { password, action, playerId } = body;
    
    const adminPassword = process.env.ADMIN_PASSWORD || 'yash2025';
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    if (action === 'reveal_all') {
      await GameConfigModel.updateOne({}, { $set: { roastsRevealed: true } });
      return NextResponse.json({ success: true, message: '🔥 All roasts revealed!' });
    }
    
    if (action === 'hide_all') {
      await GameConfigModel.updateOne({}, { $set: { roastsRevealed: false } });
      return NextResponse.json({ success: true, message: '🙈 All roasts hidden!' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Roasts action error:', error);
    return NextResponse.json({ error: 'Failed to update roasts' }, { status: 500 });
  }
}
