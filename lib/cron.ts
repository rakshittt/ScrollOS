import { syncNewsletters } from '@/lib/jobs/sync-newsletters';
import { db } from '@/lib/db';
import { newsletters } from '@/lib/schema';
import { lt, eq, and } from 'drizzle-orm';

async function deleteOldBinnedNewsletters() {
  const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  await db.delete(newsletters).where(
    and(
      eq(newsletters.isArchived, true),
      lt(newsletters.deletedAt, fifteenDaysAgo)
    )
  );
}

// Run every hour
export const cronJobs = [
  {
    name: 'sync-newsletters',
    schedule: '0 * * * *', // Every hour at minute 0
    job: syncNewsletters,
  },
  {
    name: 'delete-old-binned-newsletters',
    schedule: '0 3 * * *', // Every day at 3am
    job: deleteOldBinnedNewsletters,
  },
]; 