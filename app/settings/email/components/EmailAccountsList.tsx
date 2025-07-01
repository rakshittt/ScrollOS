'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { EmailAccount } from '@/lib/schema';
import { NewsletterSyncModal } from './NewsletterSyncModal';
import { Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { useToast } from '@/hooks/use-toast';

interface EmailAccountsListProps {
  accounts: EmailAccount[];
}

export function EmailAccountsList({ accounts: initialAccounts }: EmailAccountsListProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [syncing, setSyncing] = useState<Record<number, boolean>>({});
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [pendingAccountId, setPendingAccountId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/email/accounts/${accountId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      } else {
        const data = await res.json();
        if (data.error === 'NEWSLETTERS_EXIST') {
          setPendingAccountId(accountId);
          setShowWarning(true);
        } else {
          toast.error(data.message || 'Error removing account');
        }
      }
    } catch (error) {
      toast.error('Error removing account');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWarningAction = async (action: 'delete-newsletters' | 'reassign-newsletters') => {
    if (!pendingAccountId) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/email/accounts/${pendingAccountId}?action=${action}`, {
        method: 'POST',
      });
      if (res.ok) {
        // After action, retry deletion
        const delRes = await fetch(`/api/email/accounts/${pendingAccountId}`, {
          method: 'DELETE',
        });
        if (delRes.ok) {
          setAccounts(prev => prev.filter(acc => acc.id !== pendingAccountId));
          setShowWarning(false);
          setPendingAccountId(null);
          toast.success('Account deleted successfully');
        } else {
          const delData = await delRes.json();
          toast.error(delData.message || 'Error deleting account after action');
        }
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error processing action');
      }
    } catch (error) {
      toast.error('Error processing action');
    } finally {
      setIsProcessing(false);
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
              {/* <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Auto-sync</span>
                <Switch
                  checked={account.syncEnabled ?? false}
                  onChange={(e) => handleToggleSync(account.id, e.target.checked)}
                />
              </div> */}

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

      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Deletion Warning</DialogTitle>
            <DialogDescription>
              This email account is still referenced by newsletters. What would you like to do?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <button
              className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              disabled={isProcessing}
              onClick={() => handleWarningAction('delete-newsletters')}
            >
              Delete all newsletters for this account
            </button>
            <button
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={isProcessing}
              onClick={() => handleWarningAction('reassign-newsletters')}
            >
              Reassign newsletters to store@scrollos.com
            </button>
          </div>
          <DialogFooter>
            <button
              className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              onClick={() => setShowWarning(false)}
              disabled={isProcessing}
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 