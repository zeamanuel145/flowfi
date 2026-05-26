import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';
import { AuthSignupSchema } from '@/lib/validations';

const VERIFICATION_TOKEN_EXPIRY_MS = 1000 * 60 * 60 * 24; // 24 hours

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = AuthSignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid signup data' },
        { status: 422 }
      );
    }

    await connectDB();

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const verificationToken = crypto.randomInt(100000, 1000000).toString();
    const verificationTokenExpiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS);
    const verificationUrl = new URL('/verify-email', request.url);
    verificationUrl.searchParams.set('token', verificationToken);

    const user = new User({
      name,
      email: normalizedEmail,
      password,
      profileColor: '#10b981',
      profileIcon: '👤',
      emailVerified: false,
      verificationToken,
      verificationTokenExpiresAt,
    });

    await user.save();

    try {
      await sendVerificationEmail(
        normalizedEmail,
        verificationUrl.toString(),
        verificationToken
      );
    } catch (emailError) {
      console.error('Verification email send failed:', emailError);
      await User.deleteOne({ _id: user._id });
      return NextResponse.json(
        { error: 'Unable to send verification email. Please check SMTP settings and try again later.' },
        { status: 500 }
      );
    }

    const responseBody: any = { message: 'Verification email sent' };
    // For development testing, include the code in the response (do not enable in production)
    if (process.env.NODE_ENV !== 'production') {
      responseBody.debugCode = verificationToken;
      responseBody.verifyUrl = verificationUrl.toString();
    }

    return NextResponse.json(responseBody, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    if ((error as any)?.code === 11000) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
