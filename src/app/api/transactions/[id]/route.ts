import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/connect';
import Transaction from '@/models/Transaction';
import Wallet from '@/models/Wallet';
import { TransactionSchema } from '@/lib/validations';

export async function GET(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const transaction = await Transaction.findOne({ _id: context.params.id, userId: session.user.id }).lean();
    if (!transaction) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(transaction);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const validated = TransactionSchema.parse(body);

    const old = await Transaction.findOne({ _id: context.params.id, userId: session.user.id });
    if (!old) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Reverse only previous effects that changed the wallet total (e.g. income)
    const AFFECTS_WALLET = new Set(['income']);
    const oldWallet = await Wallet.findOne({ _id: old.walletId, userId: session.user.id });
    if (oldWallet && AFFECTS_WALLET.has(old.type)) {
      if (old.type === 'income') oldWallet.balance -= old.amount;
      await oldWallet.save();
    }

    const updated = await Transaction.findOneAndUpdate(
      { _id: context.params.id, userId: session.user.id },
      { ...validated, date: new Date(validated.date) },
      { new: true }
    );

    const AFFECTS_WALLET_AFTER = new Set(['income']);
    const newWallet = await Wallet.findOne({ _id: validated.walletId, userId: session.user.id });
    if (newWallet && AFFECTS_WALLET_AFTER.has(validated.type)) {
      if (validated.type === 'income') newWallet.balance += validated.amount;
      await newWallet.save();
    }

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const transaction = await Transaction.findOne({ _id: context.params.id, userId: session.user.id });
    if (!transaction) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Only reverse wallet effects for transactions that affect wallets
    const AFFECTS_WALLET_DEL = new Set(['income']);
    const wallet = await Wallet.findOne({ _id: transaction.walletId, userId: session.user.id });
    if (wallet && AFFECTS_WALLET_DEL.has(transaction.type)) {
      if (transaction.type === 'income') wallet.balance -= transaction.amount;
      await wallet.save();
    }

    await Transaction.findOneAndDelete({ _id: context.params.id, userId: session.user.id });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
