import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, newsletters, categories, newsletterRules, userPreferences, emailAccounts, userNewsletterEmailWhitelist, userNewsletterDomainWhitelist } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// DELETE /api/user/account - Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete all user data in the correct order (respecting foreign key constraints)
    await db.delete(newsletters).where(eq(newsletters.userId, userId));
    await db.delete(categories).where(eq(categories.userId, userId));
    await db.delete(newsletterRules).where(eq(newsletterRules.userId, userId));
    await db.delete(userPreferences).where(eq(userPreferences.userId, userId));
    await db.delete(emailAccounts).where(eq(emailAccounts.userId, userId));
    await db.delete(userNewsletterEmailWhitelist).where(eq(userNewsletterEmailWhitelist.userId, userId));
    await db.delete(userNewsletterDomainWhitelist).where(eq(userNewsletterDomainWhitelist.userId, userId));

    // Finally delete the user
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
} 