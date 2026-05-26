import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Budget from '@/models/Budget';

export async function DELETE(request: Request, context: any) {
  try {
    const { params } = context;
    await connectDB();
    await Budget.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: any) {
  try {
    const { params } = context;
    await connectDB();
    const body = await request.json();
    const budget = await Budget.findByIdAndUpdate(params.id, body, { new: true });
    if (!budget) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ budget: { ...budget.toObject(), _id: budget._id.toString() } });
  } catch {
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}
