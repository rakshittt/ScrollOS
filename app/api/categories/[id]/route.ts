import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { categories } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

// PATCH /api/categories/[id] - Update a category
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const { name, color } = await request.json();

    // Check if category exists and belongs to user
    const category = await db.query.categories.findFirst({
      where: and(
        eq(categories.id, categoryId),
        eq(categories.userId, session.user.id)
      ),
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (category.isSystem) {
      return NextResponse.json(
        { error: 'Cannot modify system category' },
        { status: 400 }
      );
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existing = await db.query.categories.findFirst({
        where: and(
          eq(categories.name, name),
          eq(categories.userId, session.user.id),
          eq(categories.id, categoryId)
        ),
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Update the category
    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;

    const [updatedCategory] = await db
      .update(categories)
      .set(updateData)
      .where(
        and(
          eq(categories.id, categoryId),
          eq(categories.userId, session.user.id)
        )
      )
      .returning();

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Check if category exists and belongs to user
    const category = await db.query.categories.findFirst({
      where: and(
        eq(categories.id, categoryId),
        eq(categories.userId, session.user.id)
      ),
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (category.isSystem) {
      return NextResponse.json(
        { error: 'Cannot delete system category' },
        { status: 400 }
      );
    }

    // Delete the category
    await db.delete(categories).where(
      and(
        eq(categories.id, categoryId),
        eq(categories.userId, session.user.id)
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
} 