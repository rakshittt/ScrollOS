import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsletterRules } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

// GET /api/newsletters/rules - List all rules
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rules = await db.query.newsletterRules.findMany({
      where: eq(newsletterRules.userId, session.user.id),
      orderBy: (rules, { desc }) => [desc(rules.createdAt)],
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/newsletters/rules - Create a new rule
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const rule = {
      ...body,
      userId: session.user.id,
      isActive: true,
    };

    const [created] = await db
      .insert(newsletterRules)
      .values(rule)
      .returning();

    revalidatePath('/inbox');
    return NextResponse.json(created);
  } catch (error) {
    console.error('Error creating rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/newsletters/rules - Update a rule
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    // Verify ownership
    const existing = await db.query.newsletterRules.findFirst({
      where: and(
        eq(newsletterRules.id, id),
        eq(newsletterRules.userId, session.user.id)
      ),
    });

    if (!existing) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    const [updated] = await db
      .update(newsletterRules)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(
        eq(newsletterRules.id, id),
        eq(newsletterRules.userId, session.user.id)
      ))
      .returning();

    revalidatePath('/inbox');
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/newsletters/rules - Delete a rule
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = parseInt(searchParams.get('id') || '');

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid rule ID' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.query.newsletterRules.findFirst({
      where: and(
        eq(newsletterRules.id, id),
        eq(newsletterRules.userId, session.user.id)
      ),
    });

    if (!existing) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    await db
      .delete(newsletterRules)
      .where(and(
        eq(newsletterRules.id, id),
        eq(newsletterRules.userId, session.user.id)
      ));

    revalidatePath('/inbox');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 