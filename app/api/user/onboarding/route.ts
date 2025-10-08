import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { redis } from '@/lib/redis';

const REDIS_TTL = 60 * 60 * 24; // 24 hours

// GET /api/user/onboarding
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const redisKey = `onboarding:${userId}`;

  // Try Redis first
  const cached = await redis.get(redisKey);
  if (typeof cached === 'string') {
    return NextResponse.json(JSON.parse(cached));
  }

  // Fallback to DB
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      onboardingCompleted: true,
      onboardingStep: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  // completedSteps is only in Redis (or frontend), default to []
  const onboarding = {
    onboardingCompleted: user.onboardingCompleted ?? false,
    onboardingStep: user.onboardingStep ?? 0,
    completedSteps: [],
  };
  await redis.set(redisKey, JSON.stringify(onboarding), { ex: REDIS_TTL });
  return NextResponse.json(onboarding);
}

// PUT /api/user/onboarding
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const redisKey = `onboarding:${userId}`;
  const body = await request.json();
  const { onboardingCompleted, onboardingStep, completedSteps } = body;

  // Update DB
  await db.update(users)
    .set({
      onboardingCompleted: onboardingCompleted ?? false,
      onboardingStep: onboardingStep ?? 0,
    })
    .where(eq(users.id, userId));

  // Update Redis
  const onboarding = {
    onboardingCompleted: onboardingCompleted ?? false,
    onboardingStep: onboardingStep ?? 0,
    completedSteps: completedSteps ?? [],
  };
  await redis.set(redisKey, JSON.stringify(onboarding), { ex: REDIS_TTL });

  return NextResponse.json({ success: true });
} 