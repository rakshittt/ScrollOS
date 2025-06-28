import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { emailAccounts, userNewsletterEmailWhitelist } from '@/lib/schema';
import { EmailService } from '@/lib/services/email-service';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Verify account ownership
    if (account.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const emailService = EmailService.getInstance();
    const newsletters = await emailService.previewNewsletters(account);

    // Get user's whitelisted emails to check domain status
    const whitelistedEmails = await db.query.userNewsletterEmailWhitelist.findMany({
      where: eq(userNewsletterEmailWhitelist.userId, session.user.id),
    });
    const whitelistedEmailSet = new Set(whitelistedEmails.map(e => e.email));
    
    console.log(`[Preview] Found ${whitelistedEmails.length} whitelisted emails for user ${session.user.id}:`, whitelistedEmails.map(e => e.email));

    // Extract unique email addresses with counts and whitelist status
    const emailMap = new Map();
    for (const n of newsletters) {
      const senderEmail = n.from?.value?.[0]?.address || '';
      const senderName = n.from?.text || '';
      const domain = emailService.extractDomain(senderEmail);
      
      if (senderEmail) {
        if (emailMap.has(senderEmail)) {
          // Increment count for existing email
          emailMap.get(senderEmail).count++;
          // Add newsletter to the array
          emailMap.get(senderEmail).newsletters.push(n);
        } else {
          // Add new email entry
          const isWhitelisted = whitelistedEmailSet.has(senderEmail);
          if (isWhitelisted) {
            console.log(`[Preview] Email ${senderEmail} is already whitelisted`);
          }
          
          emailMap.set(senderEmail, {
            email: senderEmail,
            name: senderName,
            domain,
            count: 1,
            isWhitelisted,
            sample: {
              subject: n.subject,
              from: n.from?.text,
              senderEmail,
              date: n.date,
              confidence: n.confidence,
              score: n.score,
            },
            newsletters: [n], // Store the raw newsletter data
          });
        }
      }
    }
    
    // Convert to array and sort by confidence and count
    const emails = Array.from(emailMap.values()).sort((a, b) => {
      // First sort by confidence level (high > medium > low)
      const confidenceOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const aConfidence = confidenceOrder[a.sample.confidence as string] || 0;
      const bConfidence = confidenceOrder[b.sample.confidence as string] || 0;
      
      if (aConfidence !== bConfidence) {
        return bConfidence - aConfidence; // Higher confidence first
      }
      
      // Then sort by count (higher count first)
      if (a.count !== b.count) {
        return b.count - a.count;
      }
      
      // Finally sort by score (higher score first)
      return (b.sample.score || 0) - (a.sample.score || 0);
    });

    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Error previewing newsletter emails:', error);
    return NextResponse.json(
      { error: 'Failed to preview newsletter emails' },
      { status: 500 }
    );
  }
} 