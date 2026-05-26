import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/connect';
import Transaction from '@/models/Transaction';
import Wallet from '@/models/Wallet';
import { TransactionSchema } from '@/lib/validations';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const limit = Math.max(1, Number(url.searchParams.get('limit') || '20'));
  const search = url.searchParams.get('search')?.trim();
  const type = url.searchParams.get('type');
  const category = url.searchParams.get('category');

  const filter: Record<string, any> = { userId: session.user.id };
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { note: { $regex: search, $options: 'i' } },
    ];
  }
  if (type) filter.type = type;
  if (category) filter.category = category;

  const total = await Transaction.countDocuments(filter);
  const transactions = await Transaction.find(filter)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({
    transactions,
    pagination: {
      total,
      page,
      limit,
    },
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();
  const data = TransactionSchema.parse(body);
  const transaction = await Transaction.create({
    ...data,
    userId: session.user.id,
    date: new Date(data.date),
  });

  // Only adjust wallet balances for transactions that represent actual
  // wallet balance changes. Expenses and budgets are tracked separately
  // and should not modify the wallet total here.
  const AFFECTS_WALLET = new Set(['income']);
  const wallet = await Wallet.findOne({ _id: data.walletId, userId: session.user.id });
  if (wallet && AFFECTS_WALLET.has(data.type)) {
    if (data.type === 'income') wallet.balance += data.amount;
    await wallet.save();
  }

  return NextResponse.json(transaction, { status: 201 });
}
