'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/hooks/use-toast';

interface Newsletter {
  id: number;
  title: string;
  sender: string;
  senderEmail: string;
  subject: string;
  receivedAt: string;
}

interface NewsletterListProps {
  accountId: number;
}

export function NewsletterList({ accountId }: NewsletterListProps) {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newsletterMode, setNewsletterMode] = useState(false);
  const { toast } = useToast();

  const fetchNewsletters = async () => {
    try {
      const response = await fetch(`/api/newsletters?accountId=${accountId}`);
      if (!response.ok) throw new Error('Failed to fetch newsletters');
      const data = await response.json();
      setNewsletters(data.newsletters);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      toast.error('Failed to fetch newsletters');
    }
  };

  const syncNewsletters = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/email/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      if (!response.ok) throw new Error('Failed to sync newsletters');
      
      await fetchNewsletters();
      toast.success('Newsletters synced successfully');
    } catch (error) {
      console.error('Error syncing newsletters:', error);
      toast.error('Failed to sync newsletters');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNewsletterMode = async (enabled: boolean) => {
    try {
      const response = await fetch(`/api/email/accounts/${accountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterMode: enabled }),
      });

      if (!response.ok) throw new Error('Failed to update newsletter mode');
      
      setNewsletterMode(enabled);
      toast.success(`Newsletter mode ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating newsletter mode:', error);
      toast.error('Failed to update newsletter mode');
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, [accountId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            checked={newsletterMode}
            onChange={(e) => toggleNewsletterMode(e.target.checked)}
          />
          <span className="text-sm font-medium">Newsletter Mode</span>
        </div>
        <Button
          onClick={syncNewsletters}
          disabled={isLoading}
        >
          {isLoading ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>

      <div className="grid gap-4">
        {newsletters.map((newsletter) => (
          <Card key={newsletter.id} className="p-4">
            <div className="space-y-2">
              <h3 className="font-medium">{newsletter.title}</h3>
              <p className="text-sm text-gray-500">
                From: {newsletter.sender} ({newsletter.senderEmail})
              </p>
              <p className="text-sm text-gray-500">
                Received: {new Date(newsletter.receivedAt).toLocaleString()}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 