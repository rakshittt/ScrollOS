import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET: Generate Dodo Payments subscription checkout link for this user
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const DODO_API_KEY = process.env.DODO_API_KEY;
  const DODO_PRODUCT_ID = process.env.DODO_PRODUCT_ID;
  const DODO_PRODUCT_ID_PRO = process.env.DODO_PRODUCT_ID_PRO;
  const DODO_PRODUCT_ID_PRO_PLUS = process.env.DODO_PRODUCT_ID_PRO_PLUS;
  const DODO_RETURN_URL = process.env.DODO_RETURN_URL;
  if (!DODO_API_KEY || !DODO_RETURN_URL) {
    return NextResponse.json({ error: 'Dodo Payments environment variables missing' }, { status: 500 });
  }
  // Use the correct product id for the upgrade (assume upgrade is always to pro_plus)
  let productId = DODO_PRODUCT_ID_PRO_PLUS || DODO_PRODUCT_ID;
  // Call Dodo Subscription API
  const response = await fetch('https://api.dodopayments.com/v1/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DODO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer: { email: session.user.email, name: session.user.name },
      product_id: productId,
      return_url: DODO_RETURN_URL,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.checkout_url) {
    return NextResponse.json({ error: 'Failed to create Dodo subscription', details: data }, { status: 500 });
  }
  return NextResponse.json({ checkout_url: data.checkout_url });
}

// POST: Upgrade user plan after payment confirmation (as before)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month from now
  const [updated] = await db
    .update(users)
    .set({
      plan: 'pro_plus',
      planExpiresAt: expires,
      planTrialEndsAt: null,
      updatedAt: now,
    })
    .where(eq(users.id, userId))
    .returning();
  return NextResponse.json({ plan: updated.plan, planExpiresAt: updated.planExpiresAt, planTrialEndsAt: updated.planTrialEndsAt });
} 