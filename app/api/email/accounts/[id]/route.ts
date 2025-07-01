import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { emailAccounts, newsletters } from '@/lib/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const accountId = parseInt(id);
    if (isNaN(accountId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    const account = await db.query.emailAccounts.findFirst({
      where: eq(emailAccounts.id, accountId),
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching email account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email account' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const accountId = parseInt(id);
    if (isNaN(accountId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    const body = await request.json();
    const { syncEnabled, syncFrequency } = body;

    const account = await db.query.emailAccounts.findFirst({
      where: eq(emailAccounts.id, accountId),
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedAccount = await db
      .update(emailAccounts)
      .set({
        syncEnabled,
        syncFrequency,
        updatedAt: new Date(),
      })
      .where(eq(emailAccounts.id, accountId))
      .returning();

    return NextResponse.json(updatedAccount[0]);
  } catch (error) {
    console.error('Error updating email account:', error);
    return NextResponse.json(
      { error: 'Failed to update email account' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const accountId = parseInt(id);
  if (isNaN(accountId)) {
    return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
  }

  const account = await db.query.emailAccounts.findFirst({
    where: eq(emailAccounts.id, accountId),
  });

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  if (account.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.delete(emailAccounts).where(eq(emailAccounts.id, accountId));
    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    // Check for foreign key constraint error (direct or nested in cause)
    const err = error.cause || error;
    if (err.code === '23503' && err.detail && err.detail.includes('is still referenced from table "newsletters"')) {
      return NextResponse.json({
        error: 'NEWSLETTERS_EXIST',
        message: 'This email account is still referenced by newsletters. Choose to delete or reassign newsletters.'
      }, { status: 409 });
    }
    console.error('Error deleting email account:', error);
    return NextResponse.json(
      { error: 'Failed to delete email account' },
      { status: 500 }
    );
  }
}

// POST /api/email/accounts/[id]?action=delete-newsletters
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const { id } = await params;
  const accountId = parseInt(id);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (isNaN(accountId)) {
    return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
  }
  const account = await db.query.emailAccounts.findFirst({
    where: eq(emailAccounts.id, accountId),
  });
  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }
  if (account.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (action === 'delete-newsletters') {
    // Delete all newsletters for this account
    await db.delete(newsletters).where(eq(newsletters.emailAccountId, accountId));
    return NextResponse.json({ message: 'All newsletters deleted for this account.' });
  } else if (action === 'reassign-newsletters') {
    // Find or create the store@scrollos.com account for this user
    let storeAccount = await db.query.emailAccounts.findFirst({
      where: and(eq(emailAccounts.userId, session.user.id), eq(emailAccounts.email, 'store@scrollos.com')),
    });
    if (!storeAccount) {
      // Create a dummy account (provider: 'store', tokens: empty, etc.)
      const [newAccount] = await db.insert(emailAccounts).values({
        userId: session.user.id,
        provider: 'store',
        email: 'store@scrollos.com',
        accessToken: '',
        refreshToken: '',
        tokenExpiresAt: new Date(),
      }).returning();
      storeAccount = newAccount;
    }
    // Reassign all newsletters
    await db.update(newsletters)
      .set({ emailAccountId: storeAccount.id })
      .where(eq(newsletters.emailAccountId, accountId));
    return NextResponse.json({ message: 'All newsletters reassigned to store@scrollos.com.' });
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
} 