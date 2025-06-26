import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EmailService } from '@/lib/services/email-service';
import { db } from '@/lib/db';
import { emailAccounts } from '@/lib/schema';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const provider = searchParams.get('provider') || 'gmail';

    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }

    const emailService = EmailService.getInstance();
    let tokens;

    try {
      if (provider === 'gmail') {
        tokens = await emailService.handleGmailCallback(code);
      } else if (provider === 'outlook') {
        tokens = await emailService.handleOutlookCallback(code);
      } else {
        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
      }
    } catch (error) {
      console.error('Error getting tokens:', error);
      return NextResponse.redirect(new URL('/settings/email?error=token_error', request.url));
    }

    try {
      // Get user info from the provider
      const userInfo = await emailService.getUserInfo(provider, tokens.accessToken);

      // Save the account
      await db.insert(emailAccounts).values({
        userId: session.user.id,
        provider,
        email: userInfo.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
      });

      // Redirect to success page
      return NextResponse.redirect(new URL('/settings/email?success=true', request.url));
    } catch (error) {
      console.error('Error saving account:', error);
      return NextResponse.redirect(new URL('/settings/email?error=save_error', request.url));
    }
  } catch (error) {
    console.error('Error in email callback:', error);
    return NextResponse.redirect(new URL('/settings/email?error=unknown', request.url));
  }
} 