import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EmailService } from '@/lib/services/email-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'outlook';

    if (provider !== 'outlook') {
      return NextResponse.json({ error: 'Only Outlook provider is supported for testing' }, { status: 400 });
    }

    // Check environment variables
    const config = {
      OUTLOOK_CLIENT_ID: !!process.env.OUTLOOK_CLIENT_ID,
      OUTLOOK_CLIENT_SECRET: !!process.env.OUTLOOK_CLIENT_SECRET,
      OUTLOOK_REDIRECT_URI: !!process.env.OUTLOOK_REDIRECT_URI,
    };

    const missingVars = Object.entries(config)
      .filter(([_, exists]) => !exists)
      .map(([key, _]) => key);

    if (missingVars.length > 0) {
      return NextResponse.json({
        error: 'Missing environment variables',
        missing: missingVars,
        config: {
          ...config,
          OUTLOOK_CLIENT_ID: process.env.OUTLOOK_CLIENT_ID ? '***configured***' : 'missing',
          OUTLOOK_REDIRECT_URI: process.env.OUTLOOK_REDIRECT_URI || 'missing',
        }
      }, { status: 400 });
    }

    // Test auth URL generation
    const emailService = new EmailService();
    let authUrl;
    
    try {
      authUrl = await emailService.getOutlookAuthUrl();
    } catch (error) {
      return NextResponse.json({
        error: 'Failed to generate auth URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        OUTLOOK_CLIENT_ID: '***configured***',
        OUTLOOK_REDIRECT_URI: process.env.OUTLOOK_REDIRECT_URI,
      },
      authUrl: authUrl.substring(0, 100) + '...',
      scopes: ['offline_access', 'Mail.Read', 'User.Read'],
      redirectUri: process.env.OUTLOOK_REDIRECT_URI,
    });

  } catch (error) {
    console.error('Error testing Outlook config:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 