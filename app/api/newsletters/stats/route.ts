import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsletters } from '@/lib/schema';
import { eq, and, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const { searchParams } = new URL(request.url);
    const emailAccountId = searchParams.get('emailAccountId');

    // Redis key for stats
    const redisKey = emailAccountId
      ? `stats:${userId}:${emailAccountId}`
      : `stats:${userId}`;
    const cached = await redis.get(redisKey);
    if (typeof cached === 'string') {
      return NextResponse.json(JSON.parse(cached));
    }

    // Build base condition
    const baseCondition = [eq(newsletters.userId, userId)];
    if (emailAccountId) {
      baseCondition.push(eq(newsletters.emailAccountId, parseInt(emailAccountId)));
    }

    // Get counts for each folder
    const [allCount, starredCount, binCount] = await Promise.all([
      // Inbox: ALL newsletters (not filtered)
      db
        .select({ count: sql<number>`count(*)` })
        .from(newsletters)
        .where(and(...baseCondition)),
      
      // Starred: is starred
      db
        .select({ count: sql<number>`count(*)` })
        .from(newsletters)
        .where(and(...baseCondition, eq(newsletters.isStarred, true))),
      
      // Bin: is archived
      db
        .select({ count: sql<number>`count(*)` })
        .from(newsletters)
        .where(and(...baseCondition, eq(newsletters.isArchived, true)))
    ]);

    const stats = {
      inbox: allCount[0].count,
      starred: starredCount[0].count,
      bin: binCount[0].count
    };
    await redis.set(redisKey, JSON.stringify(stats), { ex: 300 }); // 5 min TTL
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching folder counts:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch folder counts' },
      { status: 500 }
    );
  }
} 