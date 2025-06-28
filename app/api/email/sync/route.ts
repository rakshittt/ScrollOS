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
      const syncResults: Array<{
        email: string;
        newslettersFound: number;
        status: 'success' | 'error' | 'skipped';
        error?: string;
      }> = [];
      let totalEmailsProcessed = 0;
      
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
          
          // Add results for each email processed
          if (result.emailResults) {
            syncResults.push(...result.emailResults);
            totalEmailsProcessed += result.emailResults.length;
          }
          
          console.log(`✅ Synced ${result.syncedCount || 0} newsletters from ${account.email}`);
        } catch (error) {
          console.error(`❌ Error syncing account ${account.email}:`, error);
          // Add error result for this account
          syncResults.push({
            email: account.email,
            newslettersFound: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          totalEmailsProcessed++;
        }
      }
      
      const accountName = body.accountId 
        ? accountsToSync[0]?.email || 'selected account'
        : 'all accounts';
      
      return NextResponse.json({
        success: true,
        message: `Sync completed for ${accountName}. ${totalSynced} newsletters imported from whitelisted emails.`,
        syncedCount: totalSynced,
        syncResults,
        totalEmailsProcessed,
      });
    }

    // Accept emails and store in whitelist
    const { accountId, acceptedEmails, previewData } = body;
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

    // If preview data is provided, use it directly instead of fetching again
    if (previewData && Array.isArray(previewData)) {
      console.log(`📥 Using provided preview data for ${acceptedEmails.length} emails`);
      
      // Filter preview data to only include accepted emails
      const acceptedPreviewData = previewData.filter((newsletter: any) => {
        const senderEmail = newsletter.from?.value?.[0]?.address || '';
        return acceptedEmails.includes(senderEmail);
      });

      // Import newsletters directly from preview data
      let importedCount = 0;

      for (const newsletter of acceptedPreviewData) {
        try {
          // Check if newsletter already exists
          const existingNewsletter = await db.query.newsletters.findFirst({
            where: eq(newsletters.messageId, newsletter.id),
          });

          if (!existingNewsletter) {
            // Insert newsletter
            await db.insert(newsletters).values({
              userId: session.user.id,
              emailAccountId: account.id,
              messageId: newsletter.id,
              title: newsletter.subject,
              subject: newsletter.subject,
              sender: newsletter.from?.text || '',
              senderEmail: newsletter.from?.value?.[0]?.address || '',
              content: newsletter.text || '',
              htmlContent: newsletter.html || '',
              receivedAt: new Date(newsletter.date),
              isRead: false,
              isStarred: false,
              isArchived: false,
              importedAt: new Date(),
            });
            importedCount++;
          }
        } catch (error) {
          console.error(`Error importing newsletter ${newsletter.id}:`, error);
        }
      }

      console.log(`✅ Imported ${importedCount} newsletters from preview data`);
      return NextResponse.json({ 
        success: true, 
        message: `Emails whitelisted. ${importedCount} newsletters imported.`,
        importedCount 
      });
    } else {
      // Fallback: Import newsletters using the existing method
      await importNewsletters({
        userId: session.user.id,
        accountId: account.id,
        acceptedEmails,
      });

      return NextResponse.json({ success: true, message: 'Emails whitelisted. Newsletters have been imported.' });
    }
  } catch (error) {
    console.error('❌ Error whitelisting emails:', error);
    return NextResponse.json(
      { error: 'Failed to whitelist emails' },
      { status: 500 }
    );
  }
} 