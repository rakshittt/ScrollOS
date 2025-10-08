import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { emailAccounts, users } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

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

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Fetch user plan info
  const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const now = new Date();
  // Check trial/plan expiry
  if (user.planTrialEndsAt && now > user.planTrialEndsAt && !user.planExpiresAt) {
    return NextResponse.json({ error: 'Your free trial has ended. Please upgrade to continue.' }, { status: 403 });
  }
  // Count email accounts
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(emailAccounts)
    .where(eq(emailAccounts.userId, session.user.id));
  let maxAccounts = 3;
  if (user.plan === 'pro_plus') maxAccounts = 10;
  if (count >= maxAccounts) {
    return NextResponse.json({ error: `You have reached your plan's Gmail account limit (${maxAccounts}). Upgrade to add more.` }, { status: 403 });
  }
  // ...existing insert logic...
} 