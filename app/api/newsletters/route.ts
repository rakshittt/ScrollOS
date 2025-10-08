import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
<<<<<<< HEAD
import { newsletters, newsletterRules, categories, userNewsletterEmailWhitelist, users } from '@/lib/schema';
import { eq, desc, like, and, or, sql, inArray } from 'drizzle-orm';
=======
import { newsletters, newsletterRules, categories } from '@/lib/schema';
import { eq, desc, like, and, or, sql } from 'drizzle-orm';
>>>>>>> main
import { requireAuth } from '@/lib/auth';
import { redis } from '@/lib/redis';

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
    const userId = await requireAuth();
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'inbox';
    const categoryId = searchParams.get('categoryId');
    const query = searchParams.get('query');
    const emailAccountId = searchParams.get('emailAccountId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    const readStatus = searchParams.get('readStatus');
    const starredStatus = searchParams.get('starredStatus');
    const dateRange = searchParams.get('dateRange');
    const categories = searchParams.get('categories');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const lastSeenDate = searchParams.get('lastSeenDate');

<<<<<<< HEAD
    // Redis cache key (user, folder, filters, page)
    const cacheKey = `inbox:${userId}:${folder}:${categoryId || ''}:${query || ''}:${emailAccountId || ''}:${page}:${limit}:${search || ''}:${readStatus || ''}:${starredStatus || ''}:${dateRange || ''}:${categories || ''}:${sortBy}:${sortOrder}:${lastSeenDate || ''}`;
    const isCacheable = !search && !readStatus && !starredStatus && !dateRange && !categories && !emailAccountId && sortBy === 'date' && sortOrder === 'desc' && !lastSeenDate && (!categoryId || folder !== 'inbox');
    let cacheHit = false;
    if (isCacheable) {
      const cached = await redis.get(cacheKey);
      if (typeof cached === 'string') {
        cacheHit = true;
        console.log(`[CACHE] Inbox cache hit for user ${userId}`);
        return NextResponse.json(JSON.parse(cached));
      }
    }

    const startTime = Date.now();
    // Build query conditions - show all newsletters for the user
    const conditions = [
      eq(newsletters.userId, userId)
    ];
=======
    // Build query conditions
    const conditions = [eq(newsletters.userId, userId)];
>>>>>>> main
    
    // Only allow one filter: if folder is not 'inbox', ignore categoryId
    // If folder is 'inbox', allow categoryId
    if (folder === 'inbox') {
      // No additional filters: show all newsletters (inbox + starred + archived)
      conditions.push(eq(newsletters.isArchived, false));
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
    
    // Apply search filter (from query parameter or search parameter)
    const searchQuery = search || query;
    if (searchQuery) {
      conditions.push(
        sql`(${newsletters.subject} ILIKE ${`%${searchQuery}%`} OR ${newsletters.content} ILIKE ${`%${searchQuery}%`} OR ${newsletters.sender} ILIKE ${`%${searchQuery}%`})`
      );
    }

    // Apply read status filter
    if (readStatus && readStatus !== 'all') {
      if (readStatus === 'read') {
        conditions.push(eq(newsletters.isRead, true));
      } else if (readStatus === 'unread') {
        conditions.push(eq(newsletters.isRead, false));
      }
    }

    // Apply starred status filter
    if (starredStatus && starredStatus !== 'all') {
      if (starredStatus === 'starred') {
        conditions.push(eq(newsletters.isStarred, true));
      } else if (starredStatus === 'unstarred') {
        conditions.push(eq(newsletters.isStarred, false));
      }
    }

    // Apply date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }
      
      conditions.push(sql`${newsletters.receivedAt} >= ${startDate}`);
    }

    // Apply categories filter
    if (categories) {
      const categoryIds = categories.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (categoryIds.length > 0) {
        conditions.push(inArray(newsletters.categoryId, categoryIds));
      }
    }
    
    // For keyset pagination, add the keyset condition to the conditions array before building the query
    if (lastSeenDate) {
      conditions.push(sql`${newsletters.receivedAt} < ${new Date(lastSeenDate)}`);
    }
    
    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(newsletters)
      .where(and(...conditions));

<<<<<<< HEAD
    const totalCount = totalCountResult[0]?.count || 0;

    // Build order by clause
    let orderByClause;
    if (sortBy === 'sender') {
      orderByClause = sortOrder === 'asc' 
        ? [newsletters.sender, desc(newsletters.receivedAt)]
        : [desc(newsletters.sender), desc(newsletters.receivedAt)];
    } else if (sortBy === 'subject') {
      orderByClause = sortOrder === 'asc'
        ? [newsletters.subject, desc(newsletters.receivedAt)]
        : [desc(newsletters.subject), desc(newsletters.receivedAt)];
    } else {
      // Default: sort by date
      orderByClause = sortOrder === 'asc'
        ? [newsletters.receivedAt, desc(newsletters.priority)]
        : [desc(newsletters.receivedAt), desc(newsletters.priority)];
    }

    let newslettersQuery;
    if (!lastSeenDate) {
      newslettersQuery = db
        .select({
          id: newsletters.id,
          userId: newsletters.userId,
          emailAccountId: newsletters.emailAccountId,
          messageId: newsletters.messageId,
          title: newsletters.title,
          sender: newsletters.sender,
          senderEmail: newsletters.senderEmail,
          subject: newsletters.subject,
          content: sql<string>`LEFT(${newsletters.content}, 200)`,
          isRead: newsletters.isRead,
          isStarred: newsletters.isStarred,
          isArchived: newsletters.isArchived,
          categoryId: newsletters.categoryId,
          priority: newsletters.priority,
          folder: newsletters.folder,
          receivedAt: newsletters.receivedAt,
        })
        .from(newsletters)
        .where(and(...conditions))
        .orderBy(...orderByClause)
        .limit(limit)
        .offset((page - 1) * limit);
    } else {
      newslettersQuery = db
        .select({
          id: newsletters.id,
          userId: newsletters.userId,
          emailAccountId: newsletters.emailAccountId,
          messageId: newsletters.messageId,
          title: newsletters.title,
          sender: newsletters.sender,
          senderEmail: newsletters.senderEmail,
          subject: newsletters.subject,
          content: sql<string>`LEFT(${newsletters.content}, 200)`,
          isRead: newsletters.isRead,
          isStarred: newsletters.isStarred,
          isArchived: newsletters.isArchived,
          categoryId: newsletters.categoryId,
          priority: newsletters.priority,
          folder: newsletters.folder,
          receivedAt: newsletters.receivedAt,
        })
        .from(newsletters)
        .where(and(...conditions))
        .orderBy(...orderByClause)
        .limit(limit);
    }
    const result = await newslettersQuery;

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    // For keyset pagination, set nextLastSeenDate
    let nextLastSeenDate = null;
    if (result && result.length === limit) {
      nextLastSeenDate = result[result.length - 1].receivedAt;
    }

    const response = {
      newsletters: result,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext,
        hasPrevious,
        limit,
        nextLastSeenDate,
      }
    };

    // Log query execution time
    const elapsed = Date.now() - startTime;
    if (elapsed > 500) {
      console.warn(`⚠️ Slow inbox query for user ${userId}: ${elapsed}ms`);
    }
    if (isCacheable) {
      await redis.set(cacheKey, JSON.stringify(response), { ex: 30 });
      console.log(`[CACHE] Inbox cache set for user ${userId}`);
    }
    return NextResponse.json(response);
=======
    return NextResponse.json(result);
>>>>>>> main
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
    // Fetch user plan info
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const now = new Date();
    // Check trial/plan expiry
    if (user.planTrialEndsAt && now > user.planTrialEndsAt && !user.planExpiresAt) {
      return NextResponse.json({ error: 'Your free trial has ended. Please upgrade to continue.' }, { status: 403 });
    }
    // Count newsletters
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(newsletters)
      .where(eq(newsletters.userId, userId));
    let maxNewsletters = 1000;
    if (user.plan === 'pro_plus') maxNewsletters = 5000;
    if (count >= maxNewsletters) {
      return NextResponse.json({ error: `You have reached your plan's newsletter limit (${maxNewsletters}). Upgrade to add more.` }, { status: 403 });
    }
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

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('❌ Error creating newsletter:', error);
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

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to update newsletter' },
      { status: 500 }
    );
  }
}
