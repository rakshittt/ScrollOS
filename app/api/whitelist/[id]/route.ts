import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { userNewsletterEmailWhitelist } from '@/lib/schema';
import { and, eq, ne } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// PATCH - Update whitelist email
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
    const whitelistId = parseInt(id);
    if (isNaN(whitelistId)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, name } = body;

    // Validate email if provided
    if (email && typeof email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Check if email already exists for this user (excluding current record)
      const existing = await db
        .select()
        .from(userNewsletterEmailWhitelist)
        .where(
          and(
            eq(userNewsletterEmailWhitelist.userId, session.user.id),
            eq(userNewsletterEmailWhitelist.email, email),
            ne(userNewsletterEmailWhitelist.id, whitelistId)
          )
        );

      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'Email already exists in whitelist' },
          { status: 409 }
        );
      }
    }

    // Update the whitelist email
    const [updatedWhitelistEmail] = await db
      .update(userNewsletterEmailWhitelist)
      .set({
        email: email || undefined,
        name: name !== undefined ? name : undefined,
        domain: email ? email.split('@')[1] : undefined,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(userNewsletterEmailWhitelist.id, whitelistId),
          eq(userNewsletterEmailWhitelist.userId, session.user.id)
        )
      )
      .returning();

    if (!updatedWhitelistEmail) {
      return NextResponse.json(
        { error: 'Whitelist email not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      whitelistEmail: updatedWhitelistEmail
    });
  } catch (error) {
    console.error('Error updating whitelist email:', error);
    return NextResponse.json(
      { error: 'Failed to update whitelist email' },
      { status: 500 }
    );
  }
}

// DELETE - Remove email from whitelist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const whitelistId = parseInt(id);
    if (isNaN(whitelistId)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    // Delete the whitelist email
    const [deletedWhitelistEmail] = await db
      .delete(userNewsletterEmailWhitelist)
      .where(
        and(
          eq(userNewsletterEmailWhitelist.id, whitelistId),
          eq(userNewsletterEmailWhitelist.userId, session.user.id)
        )
      )
      .returning();

    if (!deletedWhitelistEmail) {
      return NextResponse.json(
        { error: 'Whitelist email not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email removed from whitelist'
    });
  } catch (error) {
    console.error('Error deleting whitelist email:', error);
    return NextResponse.json(
      { error: 'Failed to delete whitelist email' },
      { status: 500 }
    );
  }
} 