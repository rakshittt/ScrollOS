import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// POST /api/user/2fa/setup - Setup two-factor authentication
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a new secret
    const secret = authenticator.generateSecret();
    
    // Generate QR code
    const otpauth = authenticator.keyuri(session.user.email || 'user', 'Newsletter Reader', secret);
    const qrCode = await QRCode.toDataURL(otpauth);
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Store the secret temporarily (in a real app, you'd store this securely)
    await db
      .update(users)
      .set({
        twoFactorSecret: secret,
        twoFactorBackupCodes: backupCodes,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      secret,
      qrCode,
      backupCodes,
    });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return NextResponse.json(
      { error: 'Failed to setup two-factor authentication' },
      { status: 500 }
    );
  }
} 