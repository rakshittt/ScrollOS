import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EmailService } from '@/lib/services/email-service';
import { db } from '@/lib/db';
import { emailAccounts } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Email callback initiated');
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.error('❌ No session found in callback');
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const state = searchParams.get('state');
    const provider = state || searchParams.get('provider') || 'gmail';

    console.log('📋 Callback parameters:', {
      hasCode: !!code,
      error,
      errorDescription,
      provider,
      userId: session.user.id
    });

    // Check for OAuth errors
    if (error) {
      console.error('❌ OAuth error received:', { error, errorDescription });
      return NextResponse.redirect(
        new URL(`/settings/email?error=oauth_error&message=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    if (!code) {
      console.error('❌ No authorization code received');
      return NextResponse.redirect(
        new URL('/settings/email?error=no_code', request.url)
      );
    }

    const emailService = new EmailService();
    let tokens;

    try {
      console.log(`🔐 Processing ${provider} callback...`);
      
      if (provider === 'gmail') {
        tokens = await emailService.handleGmailCallback(code);
      } else if (provider === 'outlook') {
        tokens = await emailService.handleOutlookCallback(code);
      } else {
        console.error('❌ Invalid provider:', provider);
        return NextResponse.redirect(
          new URL('/settings/email?error=invalid_provider', request.url)
        );
      }
      
      console.log('✅ Tokens obtained successfully');
    } catch (error) {
      console.error('❌ Error getting tokens:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown token error';
      return NextResponse.redirect(
        new URL(`/settings/email?error=token_error&message=${encodeURIComponent(errorMessage)}`, request.url)
      );
    }

    try {
      console.log('👤 Getting user info...');
      console.log('Session in callback:', session);
      // Get user info from the provider
      const userInfo = await emailService.getUserInfo(provider, tokens.accessToken);
      console.log('User info from provider:', userInfo);
      if (!userInfo.email) {
        throw new Error('No email address found in user info');
      }

      console.log('🔍 Checking for existing account:', {
        userId: session.user.id,
        provider,
        email: userInfo.email
      });
      const existingAccount = await db.query.emailAccounts.findFirst({
        where: and(
          eq(emailAccounts.userId, session.user.id),
          eq(emailAccounts.email, userInfo.email),
          eq(emailAccounts.provider, provider)
        ),
      });
      console.log('🔎 Query result for existing account:', existingAccount);

      console.log('💾 Saving account to database...');
      if (existingAccount) {
        console.log('🔄 Updating existing account for this user...');
        const updateResult = await db.update(emailAccounts)
          .set({
            provider,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenExpiresAt: tokens.expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(emailAccounts.id, existingAccount.id))
          .returning();
        console.log('Update result:', updateResult);
      } else {
        // Always create a new account for this user if not found
        console.log('➕ Creating new account for this user...');
        const insertResult = await db.insert(emailAccounts).values({
          userId: session.user.id,
          provider,
          email: userInfo.email,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiresAt: tokens.expiresAt,
        }).returning();
        console.log('Insert result:', insertResult);
      }

      console.log('✅ Account saved successfully');
      
      // Redirect to success page with return URL
      const returnUrl = '/settings/email?success=true&email=' + encodeURIComponent(userInfo.email);
      return NextResponse.redirect(
        new URL(returnUrl, request.url)
      );
    } catch (error) {
      console.error('❌ Error saving account:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown save error';
      return NextResponse.redirect(
        new URL(`/settings/email?error=save_error&message=${encodeURIComponent(errorMessage)}`, request.url)
      );
    }
  } catch (error) {
    console.error('❌ Unexpected error in email callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.redirect(
      new URL(`/settings/email?error=unknown&message=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
} 