import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { emailAccounts } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json([], { status: 200 });
    }
    const accounts = await db.query.emailAccounts.findMany({
      where: eq(emailAccounts.userId, session.user.id),
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching email accounts:', error);
    return NextResponse.json([], { status: 200 });
  }
} 