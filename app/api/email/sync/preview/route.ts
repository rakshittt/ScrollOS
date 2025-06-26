import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/email-service';
import { db } from '@/lib/db';
import { emailAccounts } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const account = await db.query.emailAccounts.findFirst({
      where: eq(emailAccounts.id, parseInt(accountId)),
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Email account not found' },
        { status: 404 }
      );
    }

    const emailService = EmailService.getInstance();
    const newsletters = await emailService.previewNewsletters(account);

    // Extract unique domains with a sample newsletter for each
    const domainMap = new Map();
    for (const n of newsletters) {
      const senderEmail = n.from?.value?.[0]?.address || '';
      const domain = emailService.extractDomain(senderEmail);
      if (domain && !domainMap.has(domain)) {
        domainMap.set(domain, {
          domain,
          sample: {
            subject: n.subject,
            from: n.from?.text,
            senderEmail,
            date: n.date,
            confidence: n.confidence,
            score: n.score,
          },
        });
      }
    }
    const domains = Array.from(domainMap.values());

    return NextResponse.json({ domains });
  } catch (error) {
    console.error('Error previewing newsletter domains:', error);
    return NextResponse.json(
      { error: 'Failed to preview newsletter domains' },
      { status: 500 }
    );
  }
} 