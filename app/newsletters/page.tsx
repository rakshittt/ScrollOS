import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { newsletters } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NewsletterList } from '../settings/email/components/NewsletterList';

export default async function NewslettersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Please sign in to view your newsletters.</p>
      </div>
    );
  }

  const userNewsletters = await db.query.newsletters.findMany({
    where: eq(newsletters.userId, session.user.id),
    orderBy: (newsletters, { desc }) => [desc(newsletters.receivedAt)],
  });

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Your Newsletters</h1>
          <p className="text-gray-500 mt-2">
            View and manage all your newsletters in one place
          </p>
        </div>

        <div className="grid gap-6">
          {userNewsletters.map((newsletter) => (
            <div
              key={newsletter.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">{newsletter.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    From: {newsletter.sender} ({newsletter.senderEmail})
                  </p>
                </div>

                <div className="prose max-w-none">
                  {newsletter.htmlContent ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: newsletter.htmlContent }}
                      className="text-gray-700"
                    />
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {newsletter.content}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Received: {newsletter.receivedAt ? new Date(newsletter.receivedAt).toISOString().split('T')[0] : 'Unknown date'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {userNewsletters.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No newsletters found.</p>
              <p className="text-gray-500 mt-2">
                Connect your email account and sync newsletters to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 