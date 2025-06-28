import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EmailService } from '@/lib/services/email-service';
import { db } from '@/lib/db';
import { emailAccounts, newsletters, userNewsletterEmailWhitelist } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { syncNewsletters } from '@/lib/jobs/sync-newsletters';
import { importNewsletters } from '@/lib/jobs/import-newsletters';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received request to add newsletters to inbox');
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // Handle global/manual sync
    if (body.manualSync) {
      // Get whitelisted emails for this user
      const whitelistedEmails = await db.query.userNewsletterEmailWhitelist.findMany({
        where: eq(userNewsletterEmailWhitelist.userId, session.user.id),
      });
      
      if (whitelistedEmails.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No whitelisted emails found. Please add email addresses to your whitelist first.',
          syncedCount: 0,
        });
      }

      // Determine which accounts to sync
      let accountsToSync;
      if (body.accountId) {
        // Sync specific account
        const account = await db.query.emailAccounts.findFirst({
          where: and(
            eq(emailAccounts.id, body.accountId),
            eq(emailAccounts.userId, session.user.id)
          ),
      });
        if (!account) {
          return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }
        accountsToSync = [account];
      } else {
        // Sync all accounts for this user
        accountsToSync = await db.query.emailAccounts.findMany({
          where: eq(emailAccounts.userId, session.user.id),
        });
      }

      let totalSynced = 0;
      let syncedCount = 0;
      const emailService = EmailService.getInstance();
      
      for (const account of accountsToSync) {
        try {
          console.log(`🔄 Syncing account: ${account.email}`);
          
          // Sync newsletters from whitelisted emails only
          const result = await emailService.syncNewslettersFromWhitelistedEmails(
            account.id, 
            whitelistedEmails.map(e => e.email)
          );
          
          totalSynced += result.syncedCount || 0;
          syncedCount++;
          
          console.log(`✅ Synced ${result.syncedCount || 0} newsletters from ${account.email}`);
        } catch (error) {
          console.error(`❌ Error syncing account ${account.email}:`, error);
        }
      }
      
      const accountName = body.accountId 
        ? accountsToSync[0]?.email || 'selected account'
        : 'all accounts';
      
      return NextResponse.json({
        success: true,
        message: `Sync completed for ${accountName}. ${totalSynced} newsletters imported from whitelisted emails.`,
        syncedCount: totalSynced,
      });
    }

    // Accept emails and store in whitelist
    const { accountId, acceptedEmails } = body;
    if (!accountId || !acceptedEmails || !Array.isArray(acceptedEmails)) {
      return NextResponse.json(
        { error: 'Account ID and accepted emails are required' },
        { status: 400 }
      );
    }

    // Validate account ownership
    const account = await db.query.emailAccounts.findFirst({
      where: eq(emailAccounts.id, accountId),
    });
    if (!account || account.userId !== session.user.id) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Insert accepted emails into whitelist (ignore duplicates)
    for (const email of acceptedEmails) {
      const exists = await db.query.userNewsletterEmailWhitelist.findFirst({
        where: eq(userNewsletterEmailWhitelist.email, email),
      });
      if (!exists) {
        await db.insert(userNewsletterEmailWhitelist).values({
          userId: session.user.id,
          email,
            });
      }
    }

    // Import newsletters synchronously (no background job)
    await importNewsletters({
      userId: session.user.id,
      accountId: account.id,
      acceptedEmails,
    });

    return NextResponse.json({ success: true, message: 'Emails whitelisted. Newsletters have been imported.' });
  } catch (error) {
    console.error('❌ Error whitelisting emails:', error);
    return NextResponse.json(
      { error: 'Failed to whitelist emails' },
      { status: 500 }
    );
  }
} 