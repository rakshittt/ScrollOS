import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EmailService } from '@/lib/services/email-service';
import { db } from '@/lib/db';
import { emailAccounts, newsletters } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { syncNewsletters } from '@/lib/jobs/sync-newsletters';

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
      // Only sync accounts for this user
      const accounts = await db.query.emailAccounts.findMany({
        where: eq(emailAccounts.userId, session.user.id),
      });
      let totalAdded = 0;
      let totalSkipped = 0;
      let syncedCount = 0;
      const emailService = EmailService.getInstance();
      for (const account of accounts) {
        try {
          const result = await emailService.syncNewsletters(account.id);
          // Optionally, result could return added/skipped counts
          syncedCount++;
        } catch (error) {
          console.error(`Error syncing account ${account.email}:`, error);
        }
      }
      return NextResponse.json({
        success: true,
        message: `Sync completed for ${syncedCount} accounts`,
        syncedCount,
      });
    }

    // Existing per-account sync logic
    const { accountId, selectedNewsletters } = body;
    if (!accountId || !selectedNewsletters || !Array.isArray(selectedNewsletters)) {
      console.error('❌ Invalid request data:', { accountId, selectedNewsletters });
      return NextResponse.json(
        { error: 'Account ID and selected newsletters are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Looking up account ${accountId}`);
    const account = await db.query.emailAccounts.findFirst({
      where: eq(emailAccounts.id, accountId),
    });

    if (!account || account.userId !== session.user.id) {
      console.error('❌ Account not found:', accountId);
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    console.log(`📦 Processing ${selectedNewsletters.length} newsletters for account ${account.email}`);
    let addedCount = 0;
    let skippedCount = 0;

    // Initialize email service
    const emailService = EmailService.getInstance();

    // Store selected newsletters in the database
    for (const newsletter of selectedNewsletters) {
      console.log(`🔍 Checking if newsletter exists: ${newsletter.id}`);
      const existing = await db.query.newsletters.findFirst({
        where: eq(newsletters.messageId, newsletter.id),
      });

      if (!existing) {
        console.log(`➕ Adding new newsletter: ${newsletter.subject}`);
        // Fetch full content based on provider
        let content = '';
        let htmlContent = '';
        try {
          if (account.provider === 'gmail') {
            const gmail = await emailService.getGmailClient(account);
            const message = await gmail.users.messages.get({
              userId: 'me',
              id: newsletter.id,
              format: 'full',
            });
            const emailData = emailService.extractGmailData(message.data);
            if (emailData) {
              content = emailData.text || '';
              htmlContent = emailData.html || '';
            }
          } else if (account.provider === 'outlook') {
            const outlook = await emailService.getOutlookClient(account);
            const message = await outlook
              .api(`/me/messages/${newsletter.id}`)
              .get();
            content = message.body.content || '';
            htmlContent = message.body.content || '';
          }
        } catch (error) {
          console.error(`⚠️ Failed to fetch full content for newsletter ${newsletter.id}:`, error);
        }
        await db.insert(newsletters).values({
          userId: account.userId,
          emailAccountId: account.id,
          messageId: newsletter.id,
          title: newsletter.subject,
          sender: newsletter.from.text,
          senderEmail: newsletter.from.value[0].address,
          subject: newsletter.subject,
          content: content,
          htmlContent: htmlContent,
          receivedAt: new Date(newsletter.date)
        });
        addedCount++;
      } else {
        console.log(`⏭️ Skipping existing newsletter: ${newsletter.subject}`);
        skippedCount++;
      }
    }

    console.log(`🔄 Updating last synced timestamp for account ${account.email}`);
    await db
      .update(emailAccounts)
      .set({ lastSyncedAt: new Date() })
      .where(eq(emailAccounts.id, accountId));

    console.log(`✅ Successfully processed newsletters: ${addedCount} added, ${skippedCount} skipped`);
    return NextResponse.json({ 
      success: true, 
      message: `Successfully added ${addedCount} newsletters to inbox (${skippedCount} already existed)` 
    });
  } catch (error) {
    console.error('❌ Error adding newsletters:', error);
    return NextResponse.json(
      { error: 'Failed to add newsletters' },
      { status: 500 }
    );
  }
} 