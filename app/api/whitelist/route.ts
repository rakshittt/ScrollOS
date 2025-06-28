import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { userNewsletterEmailWhitelist } from '@/lib/schema';
import { eq, desc, or, ilike, and, SQL } from 'drizzle-orm';

// GET - Fetch all whitelist emails for the user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Build query conditions
    let whereConditions: SQL<unknown>;
    
    if (search.trim()) {
      whereConditions = and(
        eq(userNewsletterEmailWhitelist.userId, session.user.id),
        or(
          ilike(userNewsletterEmailWhitelist.email, `%${search}%`),
          ilike(userNewsletterEmailWhitelist.name || '', `%${search}%`)
        )
      );
    } else {
      whereConditions = eq(userNewsletterEmailWhitelist.userId, session.user.id);
    }

    // Get total count
    const totalCount = await db
      .select({ count: userNewsletterEmailWhitelist.id })
      .from(userNewsletterEmailWhitelist)
      .where(whereConditions);

    // Get paginated results
    const whitelistEmails = await db
      .select()
      .from(userNewsletterEmailWhitelist)
      .where(whereConditions)
      .orderBy(desc(userNewsletterEmailWhitelist.createdAt))
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(totalCount.length / limit);

    return NextResponse.json({
      whitelistEmails,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: totalCount.length,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching whitelist emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch whitelist emails' },
      { status: 500 }
    );
  }
}

// POST - Add new email to whitelist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists for this user
    const existing = await db
      .select()
      .from(userNewsletterEmailWhitelist)
      .where(
        and(
          eq(userNewsletterEmailWhitelist.userId, session.user.id),
          eq(userNewsletterEmailWhitelist.email, email)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists in whitelist' },
        { status: 409 }
      );
    }

    // Extract domain from email
    const domain = email.split('@')[1];

    // Insert new whitelist email
    const [newWhitelistEmail] = await db
      .insert(userNewsletterEmailWhitelist)
      .values({
        userId: session.user.id,
        email,
        name: name || null,
        domain
      })
      .returning();

    return NextResponse.json({
      success: true,
      whitelistEmail: newWhitelistEmail
    });
  } catch (error) {
    console.error('Error adding email to whitelist:', error);
    return NextResponse.json(
      { error: 'Failed to add email to whitelist' },
      { status: 500 }
    );
  }
} 