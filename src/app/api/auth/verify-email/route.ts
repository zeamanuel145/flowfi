import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';

async function verifyToken(token: string) {
  await connectDB();

  if (!/^[0-9]{6}$/.test(token)) {
    return NextResponse.json(
      { error: 'Invalid or expired verification code' },
      { status: 400 }
    );
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired verification code' },
      { status: 400 }
    );
  }

  user.emailVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiresAt = null;
  await user.save();

  return NextResponse.json(
    { message: 'Email verified successfully' },
    { status: 200 }
  );
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim();

  if (!token) {
    return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
  }

  return verifyToken(token);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body?.token?.trim();

    if (!token) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    return verifyToken(token);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An invalid request was made' },
      { status: 400 }
    );
  }
}
