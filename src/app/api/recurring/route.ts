import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/connect';
import Recurring from '@/models/Recurring';

const RecurringSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().min(1),
  interval: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  nextDue: z.string().min(1),
  walletId: z.string().min(1),
  isActive: z.boolean().default(true),
  currency: z.string().default('USD'),
  description: z.string().max(300).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const recurring = await Recurring.find({ userId: session.user.id }).sort({ nextDue: 1 }).lean();
  return NextResponse.json({ payments: recurring });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();
  const data = RecurringSchema.parse(body);
  const item = await Recurring.create({
    ...data,
    userId: session.user.id,
    nextDue: new Date(data.nextDue),
  });

  return NextResponse.json(item, { status: 201 });
}
