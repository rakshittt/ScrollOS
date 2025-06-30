import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { newsletters } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { redis } from '@/lib/redis';

const STORAGE_LIMIT_BYTES =  200 * 1024 * 1024; // 200 MB

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const redisKey = `storage:usage:${userId}`;
  const cached = await redis.get(redisKey);
  if (cached) return NextResponse.json(JSON.parse(cached));

  // Sum the byte length of content and htmlContent for all newsletters
  const result = await db
    .select({
      total: sql<number>`SUM(LENGTH(content) + COALESCE(LENGTH(html_content),0))`
    })
    .from(newsletters)
    .where(eq(newsletters.userId, userId));

  const usedBytes = result[0]?.total || 0;
  const data = { usedBytes, limitBytes: STORAGE_LIMIT_BYTES };
  await redis.set(redisKey, JSON.stringify(data), 'EX', 300); // cache 5 min
  return NextResponse.json(data);
} 