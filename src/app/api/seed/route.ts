import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import { seedDatabase } from '@/lib/seed';

export async function POST() {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id?.toString();

  let seedUserId: string | undefined;
  if (currentUserId) {
    const userExists = await User.exists({ _id: currentUserId });
    seedUserId = userExists ? currentUserId : undefined;
  }

  await seedDatabase(seedUserId);
  return NextResponse.json({ success: true, message: 'Seed data created' });
}
