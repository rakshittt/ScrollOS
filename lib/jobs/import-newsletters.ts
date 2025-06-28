import { db } from '@/lib/db';
import { emailAccounts, newsletters } from '@/lib/schema';
import { EmailService } from '@/lib/services/email-service';
import { eq } from 'drizzle-orm';

// Synchronous import function (no background job)
export async function importNewsletters({ userId, accountId, acceptedEmails }: { userId: number, accountId: number, acceptedEmails: string[] }) {
  const emailService = EmailService.getInstance();
  // Fetch account
  const account = await db.query.emailAccounts.findFirst({
    where: eq(emailAccounts.id, accountId),
  });
  if (!account) throw new Error('Account not found');
  // Fetch all potential newsletters for this account
  const accountNewsletters = await emailService.previewNewsletters(account);
  // Batch fetch all existing messageIds for this account
  const existing = await db.query.newsletters.findMany({
    where: eq(newsletters.emailAccountId, accountId),
    columns: { messageId: true },
  });
  const existingIds = new Set(existing.map(n => n.messageId));
  // Prepare new newsletters to insert
  const toInsert = [];
  for (const n of accountNewsletters) {
    const senderEmail = n.from?.value?.[0]?.address || '';
    if (acceptedEmails.includes(senderEmail) && !existingIds.has(n.id)) {
      let content = '';
      let htmlContent = '';
      // Fetch full message for content
      try {
        if (account.provider === 'gmail') {
          const gmail = await emailService.getGmailClient(account);
          const email = await gmail.users.messages.get({ userId: 'me', id: n.id, format: 'full' });
          const emailData = emailService.extractGmailData(email.data);
          content = emailData?.text || '';
          htmlContent = emailData?.html || '';
        } else if (account.provider === 'outlook') {
          const client = await emailService.getOutlookClient(account);
          const fullMessage = await client.api(`/me/messages/${n.id}`).get();
          content = fullMessage.body?.content || '';
          htmlContent = fullMessage.body?.contentType === 'html' ? fullMessage.body.content : '';
        }
      } catch (err) {
        console.error(`[importNewsletters] Failed to fetch full content for message ${n.id}:`, err);
      }
      toInsert.push({
        userId,
        emailAccountId: accountId,
        messageId: n.id,
        title: n.subject || '',
        sender: n.from?.text || '',
        senderEmail,
        subject: n.subject || '',
        content,
        htmlContent,
        receivedAt: n.date || new Date(),
        importedAt: new Date(),
      });
    }
  }
  if (toInsert.length > 0) {
    await db.insert(newsletters).values(toInsert);
  }
  return { inserted: toInsert.length };
}
 