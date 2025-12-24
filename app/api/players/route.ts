import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { PlayerModel } from '@/lib/models';

// GET - Fetch players
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';
    
    const query = includeInactive ? {} : { isActive: true };
    const players = await PlayerModel.find(query).sort({ id: 1 });
    
    return NextResponse.json(players);
  } catch (error) {
    console.error('Players GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}

// POST - Create new player
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    if (!body.name || !body.emoji) {
      return NextResponse.json({ error: 'Name and emoji required' }, { status: 400 });
    }
    
    const lastPlayer = await PlayerModel.findOne().sort({ id: -1 });
    const nextId = lastPlayer ? lastPlayer.id + 1 : 1;
    
    const player = await PlayerModel.create({
      id: nextId,
      name: body.name,
      emoji: body.emoji,
      isActive: true,
    });
    
    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error('Players POST error:', error);
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }
}

// PUT - Update player
export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
    }
    
    const player = await PlayerModel.findOneAndUpdate(
      { id },
      updateData,
      { new: true }
    );
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    return NextResponse.json(player);
  } catch (error) {
    console.error('Players PUT error:', error);
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

// DELETE - Delete player
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const hard = searchParams.get('hard') === 'true';
    
    if (!id) {
      return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
    }
    
    if (hard) {
      await PlayerModel.findOneAndDelete({ id: parseInt(id) });
    } else {
      await PlayerModel.findOneAndUpdate(
        { id: parseInt(id) },
        { isActive: false }
      );
    }
    
    return NextResponse.json({ success: true, message: `Player ${id} deleted` });
  } catch (error) {
    console.error('Players DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
  }
}
