import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/connect';
import Budget from '@/models/Budget';
import { BudgetSchema } from '@/lib/validations';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const url = new URL(request.url);
  const filter: Record<string, any> = { userId: session.user.id };
  const month = url.searchParams.get('month');
  const year = url.searchParams.get('year');

  if (month) filter.month = Number(month);
  if (year) filter.year = Number(year);

  const budgets = await Budget.find(filter).sort({ category: 1 }).lean();
  return NextResponse.json({ budgets });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();
  const data = BudgetSchema.parse(body);
  const budget = await Budget.create({
    ...data,
    userId: session.user.id,
    spent: 0,
  });

  return NextResponse.json(budget, { status: 201 });
}
