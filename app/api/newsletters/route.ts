import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsletters, newsletterRules, categories } from '@/lib/schema';
import { NewsletterCache } from '@/lib/redis';
import { eq, desc, like, and, or, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

type RuleCondition = {
  type: 'sender' | 'subject' | 'content';
  value: string;
};

type RuleAction = {
  type: 'category' | 'priority' | 'folder';
  value: string | number;
};

type NewsletterRule = {
  id: number;
  userId: number;
  name: string;
  condition: RuleCondition;
  action: RuleAction;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Helper function to apply rules to a newsletter
async function applyRules(newsletter: any, userId: number) {
  const rules = await db.query.newsletterRules.findMany({
    where: and(
      eq(newsletterRules.userId, userId),
      eq(newsletterRules.isActive, true)
    ),
  }) as NewsletterRule[];

  for (const rule of rules) {
    const condition = rule.condition;
    const action = rule.action;

    // Check if newsletter matches condition
    let matches = false;
    if (condition.type === 'sender') {
      matches = newsletter.senderEmail === condition.value;
    } else if (condition.type === 'subject') {
      matches = newsletter.subject.toLowerCase().includes(condition.value.toLowerCase());
    } else if (condition.type === 'content') {
      matches = newsletter.content.toLowerCase().includes(condition.value.toLowerCase());
    }

    if (matches) {
      // Apply action
      if (action.type === 'category') {
        await db
          .update(newsletters)
          .set({ category: action.value as string })
          .where(eq(newsletters.id, newsletter.id));
      } else if (action.type === 'priority') {
        await db
          .update(newsletters)
          .set({ priority: action.value as number })
          .where(eq(newsletters.id, newsletter.id));
      } else if (action.type === 'folder') {
        await db
          .update(newsletters)
          .set({ folder: action.value as string })
          .where(eq(newsletters.id, newsletter.id));
      }
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📥 Fetching newsletters list');
    const userId = await requireAuth();
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'inbox';
    const query = searchParams.get('query');
    const isRead = searchParams.get('isRead');
    const isStarred = searchParams.get('isStarred');
    const categoryId = searchParams.get('categoryId');
    const emailAccountId = searchParams.get('emailAccountId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    console.log(`🔍 Filtering newsletters by folder: ${folder}`);

    // Check cache first
    const cacheKey = `newsletters:${userId}:${folder}:${query || 'all'}:${page}:${limit}:${categoryId || 'all'}:${emailAccountId || 'all'}`;
    const cached = await NewsletterCache.get(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached);
    }

    // Build query conditions
    const conditions = [eq(newsletters.userId, userId)];
    
    // Only allow one filter: if folder is not 'inbox', ignore categoryId
    // If folder is 'inbox', allow categoryId
    if (folder === 'inbox') {
      // No additional filters: show all newsletters (inbox + starred + archived)
      if (categoryId) {
        conditions.push(eq(newsletters.categoryId, parseInt(categoryId)));
      }
    } else if (folder === 'starred') {
      conditions.push(eq(newsletters.isStarred, true));
    } else if (folder === 'bin') {
      conditions.push(eq(newsletters.isArchived, true));
    }

    // Filter by email account if provided
    if (emailAccountId) {
      conditions.push(eq(newsletters.emailAccountId, parseInt(emailAccountId)));
    }
    
    if (query) {
      conditions.push(
        sql`(${newsletters.subject} ILIKE ${`%${query}%`} OR ${newsletters.content} ILIKE ${`%${query}%`} OR ${newsletters.sender} ILIKE ${`%${query}%`})`
      );
    }
    
    if (isRead !== null) {
      conditions.push(eq(newsletters.isRead, isRead === 'true'));
    }
    
    if (isStarred !== null) {
      conditions.push(eq(newsletters.isStarred, isStarred === 'true'));
    }

    // Execute query
    const result = await db
      .select()
      .from(newsletters)
      .where(and(...conditions))
      .orderBy(desc(newsletters.priority), desc(newsletters.receivedAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // Cache the results
    await NewsletterCache.set(cacheKey, result, 300); // 5 minutes cache

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error fetching newsletters:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch newsletters' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    
    const result = await db
      .insert(newsletters)
      .values({
        userId,
        title: body.title,
        sender: body.sender,
        senderEmail: body.senderEmail,
        subject: body.subject,
        content: body.content,
        htmlContent: body.htmlContent,
        folder: body.folder || 'inbox',
        tags: body.tags || [],
      })
      .returning();

    // Apply rules to the new newsletter
    await applyRules(result[0], userId);

    // Invalidate cache
    await NewsletterCache.invalidatePattern(`newsletters:${userId}:*`);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to create newsletter' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { id, ...updates } = body;
    
    let updateData = { ...updates, updatedAt: new Date() };
    if (typeof updates.isArchived === 'boolean') {
      if (updates.isArchived) {
        updateData.deletedAt = new Date();
      } else {
        updateData.deletedAt = null;
      }
    }
    const result = await db
      .update(newsletters)
      .set(updateData)
      .where(and(
        eq(newsletters.id, id),
        eq(newsletters.userId, userId)
      ))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Newsletter not found or unauthorized' },
        { status: 404 }
      );
    }

    // Invalidate cache
    await NewsletterCache.invalidatePattern(`newsletters:${userId}:*`);

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to update newsletter' },
      { status: 500 }
    );
  }
}
