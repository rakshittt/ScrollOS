import { db } from '@/lib/db';
import { emailAccounts } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { EmailService } from '@/lib/services/email-service';

export async function syncNewsletters() {
  try {
    // Get all active email accounts
    const accounts = await db.query.emailAccounts.findMany({
      where: eq(emailAccounts.syncEnabled, true),
    });

    const emailService = EmailService.getInstance();

    // Sync each account
    for (const account of accounts) {
      try {
        await emailService.syncNewsletters(account.id);
        console.log(`Successfully synced newsletters for account ${account.email}`);
      } catch (error) {
        console.error(`Error syncing newsletters for account ${account.email}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in syncNewsletters job:', error);
  }
} 