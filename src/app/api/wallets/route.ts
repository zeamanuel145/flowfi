import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/connect';
import Wallet from '@/models/Wallet';
import { WalletSchema } from '@/lib/validations';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const wallets = await Wallet.find({ userId: session.user.id }).sort({ name: 1 }).lean();
  return NextResponse.json({ wallets });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();
  const data = WalletSchema.parse(body);
  const wallet = await Wallet.create({
    ...data,
    userId: session.user.id,
  });

  return NextResponse.json(wallet, { status: 201 });
}
