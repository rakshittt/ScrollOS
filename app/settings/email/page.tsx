import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
<<<<<<< HEAD
=======
import { authOptions } from '@/lib/auth';
>>>>>>> main
import { db } from '@/lib/db';
import { emailAccounts } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { EmailAccountsList } from '@/app/settings/email/components/EmailAccountsList';
import { ConnectEmailButton } from '@/app/settings/email/components/ConnectEmailButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
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
              <h1 className="text-3xl font-semibold text-foreground">Email Accounts</h1>
              <p className="text-muted-foreground">Connect and manage your email accounts for newsletter syncing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Connect New Account */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Connect Email Account</CardTitle>
                  <CardDescription className="text-sm">
                    Add a new email account to automatically import newsletters
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/20">
              <div className="flex items-center space-x-3">
                {/* <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div> */}
                <div>
                  <p className="text-sm font-medium text-foreground">Ready to connect?</p>
                  <p className="text-xs text-muted-foreground">
                    Choose your email provider to get started
                  </p>
                </div>
              </div>
              <ConnectEmailButton />
            </div>
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

        {/* Whitelist Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5" />
              <span>Email Whitelist</span>
            </CardTitle>
            <CardDescription>
              Manage which email addresses can send newsletters to your inbox
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Control which email addresses are allowed to import newsletters during sync. 
                  The inbox will show all newsletters, but only whitelisted emails can import new ones.
                </p>
              </div>
              <Link href="/settings/whitelist">
                <Button variant="outline">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Manage Whitelist
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 