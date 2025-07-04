import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Optionally: import and use a webhook signature verification library if Dodo provides one

export async function POST(req: NextRequest) {
  try {
    // Read raw body for signature verification if needed
    const body = await req.json();
    // Optionally: verify webhook signature here

    const eventType = body.event_type || body.type;
    const subscription = body.data?.subscription || body.subscription;
    const customer = subscription?.customer || body.data?.customer;
    const email = customer?.email || body.data?.email;
    const plan = subscription?.product_id || subscription?.plan_id;
    const userId = body.data?.metadata?.userId || null; // If you pass userId as metadata

    // Find user by email (or userId if available)
    let user = null;
    if (userId) {
      user = await db.query.users.findFirst({ where: eq(users.id, Number(userId)) });
    } else if (email) {
      user = await db.query.users.findFirst({ where: eq(users.email, email) });
    }
    if (!user) {
      console.warn('Dodo webhook: user not found', { email, userId });
      return NextResponse.json({ received: true, warning: 'User not found' });
    }

    // Handle subscription events
    if (eventType === 'subscription_activated' || eventType === 'subscription_renewed') {
      // Set plan and expiry (assuming 1 month from now)
      const now = new Date();
      const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      await db.update(users)
        .set({
          plan: plan === process.env.DODO_PRODUCT_ID_PRO_PLUS ? 'pro_plus' : 'pro',
          planExpiresAt: expires,
          planTrialEndsAt: null,
          updatedAt: now,
        })
        .where(eq(users.id, user.id));
    } else if (eventType === 'subscription_cancelled' || eventType === 'payment_failed') {
      // Downgrade or expire plan
      await db.update(users)
        .set({
          plan: 'pro', // or 'free' if you have a free tier
          planExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    } else {
      // Log unhandled events
      console.log('Dodo webhook: unhandled event', eventType, body);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Dodo webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
} 