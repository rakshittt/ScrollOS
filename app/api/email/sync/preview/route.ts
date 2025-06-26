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

    return NextResponse.json({ newsletters });
  } catch (error) {
    console.error('Error previewing newsletters:', error);
    return NextResponse.json(
      { error: 'Failed to preview newsletters' },
      { status: 500 }
    );
  }
} 