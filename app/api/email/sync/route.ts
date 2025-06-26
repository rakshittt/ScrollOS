import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EmailService } from '@/lib/services/email-service';
import { db } from '@/lib/db';
import { emailAccounts, newsletters, userNewsletterDomainWhitelist } from '@/lib/schema';
import { eq } from 'drizzle-orm';
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

    // Accept domains and store in whitelist
    const { accountId, acceptedDomains } = body;
    if (!accountId || !acceptedDomains || !Array.isArray(acceptedDomains)) {
      return NextResponse.json(
        { error: 'Account ID and accepted domains are required' },
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

    // Insert accepted domains into whitelist (ignore duplicates)
    for (const domain of acceptedDomains) {
      const exists = await db.query.userNewsletterDomainWhitelist.findFirst({
        where: eq(userNewsletterDomainWhitelist.domain, domain),
      });
      if (!exists) {
        await db.insert(userNewsletterDomainWhitelist).values({
          userId: session.user.id,
          domain,
        });
      }
    }

    // Import newsletters synchronously (no background job)
    await importNewsletters({
      userId: session.user.id,
      accountId: account.id,
      acceptedDomains,
    });

    return NextResponse.json({ success: true, message: 'Domains whitelisted. Newsletters have been imported.' });
  } catch (error) {
    console.error('❌ Error whitelisting domains:', error);
    return NextResponse.json(
      { error: 'Failed to whitelist domains' },
      { status: 500 }
    );
  }
} 