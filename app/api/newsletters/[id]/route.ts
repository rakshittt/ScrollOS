import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { categories, newsletters } from '@/lib/schema';
import { and, eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🔍 Fetching newsletter with ID: ${id}`);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: 'Invalid newsletter ID' }, { status: 400 });
    }

    const newsletter = await db.query.newsletters.findFirst({
      where: and(
        eq(newsletters.id, parsedId),
        eq(newsletters.userId, session.user.id)
      ),
    });

    if (!newsletter) {
      console.error(`❌ Newsletter not found with ID: ${id}`);
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    console.log(`✅ Found newsletter: ${newsletter.subject}`);
    return NextResponse.json(newsletter);
  } catch (error) {
    const { id } = await params;
    console.error(`❌ Error fetching newsletter ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const newsletterId = parseInt(id);
    if (isNaN(newsletterId)) {
      return NextResponse.json(
        { error: 'Invalid newsletter ID' },
        { status: 400 }
      );
    }

    const { categoryId } = await request.json();
    console.log('PATCH /api/newsletters/[id]: incoming categoryId:', categoryId);

    // Check if newsletter exists and belongs to user
    const newsletter = await db.query.newsletters.findFirst({
      where: and(
        eq(newsletters.id, newsletterId),
        eq(newsletters.userId, session.user.id)
      ),
    });

    if (!newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // Validate categoryId if provided
    let validCategoryId = null;
    let foundCategory = null;
    let categoryName = 'uncategorized';
    if (categoryId) {
      foundCategory = await db.query.categories.findFirst({
        where: eq(categories.id, categoryId),
      });
      if (foundCategory) {
        validCategoryId = categoryId;
        categoryName = foundCategory.name;
      }
    }
    console.log('PATCH /api/newsletters/[id]: foundCategory:', foundCategory);

    // Update the newsletter
    const [updated] = await db
      .update(newsletters)
      .set({
        categoryId: validCategoryId,
        category: categoryName,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(newsletters.id, newsletterId),
          eq(newsletters.userId, session.user.id)
        )
      )
      .returning();

    console.log('PATCH /api/newsletters/[id]: updated newsletter:', updated);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to update newsletter' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: 'Invalid newsletter ID' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(newsletters)
      .where(and(
        eq(newsletters.id, parsedId),
        eq(newsletters.userId, session.user.id)
      ))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    revalidatePath('/inbox');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting newsletter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 