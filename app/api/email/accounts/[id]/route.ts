import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { emailAccounts, newsletters } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accountId = parseInt(params.id);
    if (isNaN(accountId)) {
      return NextResponse.json(
        { error: 'Invalid account ID' },
        { status: 400 }
      );
    }

    const { syncEnabled, syncFrequency } = await req.json();

    // Verify account ownership
    const account = await db.query.emailAccounts.findFirst({
      where: and(
        eq(emailAccounts.id, accountId),
        eq(emailAccounts.userId, session.user.id)
      ),
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Update account settings
    await db
      .update(emailAccounts)
      .set({
        syncEnabled: syncEnabled !== undefined ? syncEnabled : account.syncEnabled,
        syncFrequency: syncFrequency !== undefined ? syncFrequency : account.syncFrequency,
        updatedAt: new Date(),
      })
      .where(eq(emailAccounts.id, accountId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating email account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accountId = parseInt(params.id);
    if (isNaN(accountId)) {
      return NextResponse.json(
        { error: 'Invalid account ID' },
        { status: 400 }
      );
    }

    // Verify account ownership
    const account = await db.query.emailAccounts.findFirst({
      where: and(
        eq(emailAccounts.id, accountId),
        eq(emailAccounts.userId, session.user.id)
      ),
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Delete all newsletters for this account first
    await db.delete(newsletters).where(eq(newsletters.emailAccountId, accountId));

    // Delete account
    await db
      .delete(emailAccounts)
      .where(eq(emailAccounts.id, accountId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting email account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 