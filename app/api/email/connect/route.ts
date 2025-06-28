import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { emailAccounts } from '@/lib/schema';
import { EmailService } from '@/lib/services/email-service';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await req.json();
    if (!provider || !['gmail', 'outlook'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }

    const emailService = EmailService.getInstance();
    const authUrl = provider === 'gmail'
      ? await emailService.getGmailAuthUrl()
      : await emailService.getOutlookAuthUrl();

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error connecting email account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 