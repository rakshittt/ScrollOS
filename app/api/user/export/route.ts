import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { newsletters, categories, newsletterRules, userPreferences } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET /api/user/export - Export user data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user data
    const [userNewsletters, userCategories, userRules, userPrefs] = await Promise.all([
      db.query.newsletters.findMany({
        where: eq(newsletters.userId, session.user.id),
      }),
      db.query.categories.findMany({
        where: eq(categories.userId, session.user.id),
      }),
      db.query.newsletterRules.findMany({
        where: eq(newsletterRules.userId, session.user.id),
      }),
      db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, session.user.id),
      }),
    ]);

    // Create export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
      newsletters: userNewsletters,
      categories: userCategories,
      rules: userRules,
      preferences: userPrefs,
    };

    // Return as JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="newsletter-data.json"',
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
} 