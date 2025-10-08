import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';
import { signIn } from 'next-auth/react';

// This endpoint is called by Dodo Payments after payment
export async function GET(request: NextRequest) {
  try {
    // Parse query params (Dodo should redirect with userId and payment status)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const plan = searchParams.get('plan');
    const paymentStatus = searchParams.get('status'); // e.g. 'paid'

    if (!userId || !plan || paymentStatus !== 'paid') {
      return NextResponse.redirect(new URL('/auth/signin?error=payment', request.url));
    }

    // Activate the user's plan
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month from now
    await db.update(users)
      .set({
        plan: plan,
        planExpiresAt: expires,
        planTrialEndsAt: null,
        updatedAt: now,
      })
      .where(eq(users.id, Number(userId)));

    // Log the user in by setting a session (simulate by redirecting to sign-in with a flag)
    // In production, you may want to issue a JWT or magic link
    return NextResponse.redirect(new URL(`/auth/signin?paid=true&email_login_user_id=${userId}`, request.url));
  } catch (error) {
    console.error('Dodo callback error:', error);
    return NextResponse.redirect(new URL('/auth/signin?error=payment', request.url));
  }
} 