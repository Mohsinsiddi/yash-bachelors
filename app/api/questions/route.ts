import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { QuestionModel } from '@/lib/models';

// GET - Fetch all questions
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';
    
    const query = includeInactive ? {} : { isActive: true };
    const questions = await QuestionModel.find(query).sort({ order: 1 });
    
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Questions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

// POST - Create new question
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const lastQuestion = await QuestionModel.findOne().sort({ id: -1 });
    const nextId = lastQuestion ? lastQuestion.id + 1 : 1;
    
    const question = await QuestionModel.create({
      ...body,
      id: nextId,
      order: body.order || nextId,
      isActive: true,
    });
    
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('Questions POST error:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}

// PUT - Update question
export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
    }
    
    const question = await QuestionModel.findOneAndUpdate(
      { id },
      updateData,
      { new: true }
    );
    
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }
    
    return NextResponse.json(question);
  } catch (error) {
    console.error('Questions PUT error:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

// DELETE - Delete question (soft delete or hard delete)
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const hard = searchParams.get('hard') === 'true';
    
    if (!id) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
    }
    
    if (hard) {
      // Hard delete - permanently remove
      await QuestionModel.findOneAndDelete({ id: parseInt(id) });
    } else {
      // Soft delete - mark as inactive
      await QuestionModel.findOneAndUpdate(
        { id: parseInt(id) },
        { isActive: false }
      );
    }
    
    return NextResponse.json({ success: true, message: `Question ${id} deleted` });
  } catch (error) {
    console.error('Questions DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
