import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsletters, newsletterRules, categories } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { NewsletterCache } from '@/lib/redis';

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

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { newsletterId } = body;

    // Get the newsletter
    const newsletter = await db.query.newsletters.findFirst({
      where: and(
        eq(newsletters.id, newsletterId),
        eq(newsletters.userId, userId)
      ),
    });

    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // Apply rules
    await applyRules(newsletter, userId);

    // Invalidate cache
    await NewsletterCache.invalidatePattern(`newsletters:${userId}:*`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error categorizing newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to categorize newsletter' },
      { status: 500 }
    );
  }
}

// Get all rules for the user
export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const rules = await db.query.newsletterRules.findMany({
      where: eq(newsletterRules.userId, userId),
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rules' },
      { status: 500 }
    );
  }
}

// Create a new rule
export async function PUT(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { name, condition, action } = body;

    const result = await db
      .insert(newsletterRules)
      .values({
        userId,
        name,
        condition,
        action,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating rule:', error);
    return NextResponse.json(
      { error: 'Failed to create rule' },
      { status: 500 }
    );
  }
} 