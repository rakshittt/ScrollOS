import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordResets } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { EmailService } from '@/lib/services/email-service';

// You should create a password_resets table in your DB for this to work
// Fields: id, userId, token, expiresAt, createdAt

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    // Find user
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (user) {
      // Generate token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
      // Store token in password_resets table
      await db.insert(passwordResets).values({
        userId: user.id,
        token,
        expiresAt,
        createdAt: new Date(),
      });
      // Send email with reset link
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const resetLink = `${baseUrl}/auth/reset?token=${token}`;
      await EmailService.sendPasswordResetEmail(user.email, resetLink);
    }
    // Always return success for security
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 