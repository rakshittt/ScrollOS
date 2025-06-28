import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { userPreferences } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET /api/user/preferences - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, session.user.id),
    });

    return NextResponse.json(preferences || {});
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/user/preferences - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Check if preferences exist for this user
    const existing = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, session.user.id),
    });

    if (existing) {
      // Update existing preferences
      const updated = await db
        .update(userPreferences)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, session.user.id))
        .returning();

      return NextResponse.json(updated[0]);
    } else {
      // Create new preferences
      const created = await db
        .insert(userPreferences)
        .values({
          userId: session.user.id,
          ...body,
        })
        .returning();

      return NextResponse.json(created[0]);
    }
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
} 