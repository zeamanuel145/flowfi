import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/connect';
import SavingsGoal from '@/models/SavingsGoal';
import { SavingsGoalSchema } from '@/lib/validations';

export async function PUT(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const validated = SavingsGoalSchema.parse(body);
    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: context.params.id, userId: session.user.id },
      {
        ...validated,
        deadline: validated.deadline ? new Date(validated.deadline) : undefined,
      },
      { new: true }
    );
    if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(goal);
  } catch {
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const deleted = await SavingsGoal.findOneAndDelete({ _id: context.params.id, userId: session.user.id });
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
