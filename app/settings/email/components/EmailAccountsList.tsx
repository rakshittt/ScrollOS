'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { EmailAccount } from '@/lib/schema';
import { NewsletterSyncModal } from './NewsletterSyncModal';
import { Trash2 } from 'lucide-react';

interface EmailAccountsListProps {
  accounts: EmailAccount[];
}

export function EmailAccountsList({ accounts: initialAccounts }: EmailAccountsListProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [syncing, setSyncing] = useState<Record<number, boolean>>({});
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);

  const handleSync = async (accountId: number) => {
    setSelectedAccount(accountId);
  };

  const handleToggleSync = async (accountId: number, enabled: boolean) => {
    try {
      await fetch(`/api/email/accounts/${accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ syncEnabled: enabled }),
      });
      setAccounts(prev => prev.map(acc => acc.id === accountId ? { ...acc, syncEnabled: enabled } : acc));
    } catch (error) {
      console.error('Error updating sync settings:', error);
    }
  };

  const handleRemoveAccount = async (accountId: number) => {
    if (!confirm('Are you sure you want to remove this email account? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/email/accounts/${accountId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      }
    } catch (error) {
      console.error('Error removing account:', error);
    }
  };

  if (accounts.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-600">
        No email accounts connected yet.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <Card key={account.id} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{account.email}</h3>
              <p className="text-sm text-gray-600 capitalize">
                {account.provider}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Auto-sync</span>
                <Switch
                  checked={account.syncEnabled ?? false}
                  onChange={(e) => handleToggleSync(account.id, e.target.checked)}
                />
              </div>

              <Button
                variant="outline"
                onClick={() => handleSync(account.id)}
                disabled={syncing[account.id]}
              >
                {syncing[account.id] ? 'Syncing...' : 'Sync Now'}
              </Button>

              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-800"
                onClick={() => handleRemoveAccount(account.id)}
                title="Remove Account"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {account.lastSyncedAt && (
            <p className="mt-2 text-sm text-gray-600">
              Last synced: {new Date(account.lastSyncedAt).toISOString().replace('T', ' ').slice(0, 19)}
            </p>
          )}
        </Card>
      ))}

      {selectedAccount !== null && (
        <NewsletterSyncModal
          isOpen={true}
          onClose={() => setSelectedAccount(null)}
          accountId={selectedAccount}
        />
      )}
    </div>
  );
} 