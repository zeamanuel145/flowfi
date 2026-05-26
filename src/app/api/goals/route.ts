import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/connect';
import SavingsGoal from '@/models/SavingsGoal';
import { SavingsGoalSchema } from '@/lib/validations';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const goals = await SavingsGoal.find({ userId: session.user.id }).sort({ deadline: 1 }).lean();
  return NextResponse.json({ goals });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();
  const data = SavingsGoalSchema.parse(body);
  const goal = await SavingsGoal.create({
    ...data,
    userId: session.user.id,
    deadline: data.deadline ? new Date(data.deadline) : undefined,
    isCompleted: data.currentAmount >= data.targetAmount,
  });

  return NextResponse.json(goal, { status: 201 });
}
