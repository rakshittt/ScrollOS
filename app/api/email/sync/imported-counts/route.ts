import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { emailAccounts, newsletters } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('accountId');
  if (!accountId) {
    return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
  }
  // Validate account ownership
  const account = await db.query.emailAccounts.findFirst({
    where: eq(emailAccounts.id, parseInt(accountId)),
  });
  if (!account || account.userId !== session.user.id) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }
  // Fetch all newsletters for this account
  const allNewsletters = await db.query.newsletters.findMany({
    where: eq(newsletters.emailAccountId, account.id),
    columns: { senderEmail: true },
  });
  // Count by email address
  const emailCounts: Record<string, number> = {};
  for (const n of allNewsletters) {
    const email = n.senderEmail;
    if (!email) continue;
    emailCounts[email] = (emailCounts[email] || 0) + 1;
  }
  const counts = Object.entries(emailCounts).map(([email, count]) => ({ email, count }));
  return NextResponse.json({ counts });
} 