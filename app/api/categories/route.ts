import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { categories } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/categories - Get all categories for the user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCategories = await db.query.categories.findMany({
      where: eq(categories.userId, session.user.id),
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });

    return NextResponse.json(userCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, color } = await request.json();
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category with same name exists for this user only
    const existing = await db.query.categories.findFirst({
      where: and(
        eq(categories.name, name),
        eq(categories.userId, session.user.id)
      ),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const [newCategory] = await db.insert(categories).values({
      userId: session.user.id,
      name,
      color: color || '#ff385c',
      isSystem: false,
    }).returning();

    return NextResponse.json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
} 