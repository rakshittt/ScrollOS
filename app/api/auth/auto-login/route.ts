import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { sessions } from '@/lib/schema';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  try {
    const { token, userId } = await req.json();
    if (!token || !userId) {
      return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
    }
    // Find user and verify token
    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(userId)),
    });
    if (!user || user.twoFactorSecret !== token) {
      return NextResponse.json({ message: 'Invalid or expired login link.' }, { status: 401 });
    }
    // Invalidate token
    await db.update(users)
      .set({ twoFactorSecret: null, updatedAt: new Date() })
      .where(eq(users.id, user.id));
    // Create a session (manual, since we're in API route)
    const sessionToken = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await db.insert(sessions).values({
      userId: user.id,
      sessionToken,
      expires,
    });
    // Set session cookie using Set-Cookie header
    const cookie = serialize('next-auth.session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires,
    });
    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Set-Cookie': cookie,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Auto-login error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
} 