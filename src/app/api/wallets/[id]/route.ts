import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/connect';
import Wallet from '@/models/Wallet';
import { WalletSchema } from '@/lib/validations';

export async function PUT(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const validated = WalletSchema.parse(body);
    const wallet = await Wallet.findOneAndUpdate(
      { _id: context.params.id, userId: session.user.id },
      validated,
      { new: true }
    );
    if (!wallet) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(wallet);
  } catch {
    return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const deleted = await Wallet.findOneAndDelete({ _id: context.params.id, userId: session.user.id });
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete wallet' }, { status: 500 });
  }
}
