import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { GameConfigModel } from '@/lib/models';

export async function GET() {
  try {
    await dbConnect();
    let config = await GameConfigModel.findOne();
    
    if (!config) {
      config = await GameConfigModel.create({});
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Config GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const config = await GameConfigModel.findOneAndUpdate(
      {},
      { ...body, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Config PUT error:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
