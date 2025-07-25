import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { emailAccounts } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { EmailAccountsList } from '@/app/settings/email/components/EmailAccountsList';
import { ConnectEmailButton } from '@/app/settings/email/components/ConnectEmailButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default async function EmailSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  const accounts = await db.query.emailAccounts.findMany({
    where: eq(emailAccounts.userId, session.user.id),
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Email Accounts</h1>
              <p className="text-muted-foreground">Connect and manage your email accounts for newsletter syncing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Connect New Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Connect Email Account</span>
            </CardTitle>
            <CardDescription>
              Add a new email account to automatically import newsletters
            </CardDescription>
          </CardHeader>
          <CardContent>
          <ConnectEmailButton />
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>
              Manage your connected email accounts and sync settings
            </CardDescription>
          </CardHeader>
          <CardContent>
        <EmailAccountsList accounts={accounts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 