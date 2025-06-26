'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { useToast } from '@/hooks/use-toast';

interface Newsletter {
  id: string;
  subject: string;
  from: {
    text: string;
    value: Array<{ address: string }>;
  };
  date: string;
  score: number;
  confidence: 'low' | 'medium' | 'high';
}

interface NewsletterSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: number;
}

export function NewsletterSyncModal({ isOpen, onClose, accountId }: NewsletterSyncModalProps) {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [selectedNewsletters, setSelectedNewsletters] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchNewsletters();
    }
  }, [isOpen, accountId]);

  const fetchNewsletters = async () => {
    try {
      console.log('🔄 Fetching newsletters preview...');
      setIsLoading(true);
      const response = await fetch(`/api/email/sync/preview?accountId=${accountId}`);
      if (!response.ok) throw new Error('Failed to fetch newsletters');
      const data = await response.json();
      console.log(`✅ Found ${data.newsletters.length} potential newsletters`);
      setNewsletters(data.newsletters);
    } catch (error) {
      console.error('❌ Error fetching newsletters:', error);
      toast.error('Failed to fetch newsletters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedNewsletters.size === newsletters.length) {
      console.log('📋 Deselecting all newsletters');
      setSelectedNewsletters(new Set());
    } else {
      console.log(`📋 Selecting all ${newsletters.length} newsletters`);
      setSelectedNewsletters(new Set(newsletters.map(n => n.id)));
    }
  };

  const handleSelectNewsletter = (id: string) => {
    const newSelected = new Set(selectedNewsletters);
    if (newSelected.has(id)) {
      console.log(`📋 Deselecting newsletter: ${id}`);
      newSelected.delete(id);
    } else {
      console.log(`📋 Selecting newsletter: ${id}`);
      newSelected.add(id);
    }
    setSelectedNewsletters(newSelected);
  };

  const handleAddToInbox = async () => {
    try {
      console.log('🔄 Starting to add newsletters to inbox...');
      setIsLoading(true);
      
      // Get the full data for selected newsletters
      const selectedNewsletterData = newsletters.filter(n => 
        selectedNewsletters.has(n.id)
      );
      
      console.log(`📦 Preparing to add ${selectedNewsletterData.length} newsletters to inbox`);
      console.log('Selected newsletters:', selectedNewsletterData.map(n => ({
        id: n.id,
        subject: n.subject,
        from: n.from.text
      })));
      
      // Add selected newsletters to database
      const response = await fetch('/api/email/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          selectedNewsletters: selectedNewsletterData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Failed to add newsletters:', errorData);
        throw new Error(errorData.error || 'Failed to add newsletters');
      }
      
      const result = await response.json();
      console.log('✅ Success:', result.message);
      toast.success('Newsletters added to inbox successfully');
      onClose();
    } catch (error) {
      console.error('❌ Error adding newsletters:', error);
      toast.error('Failed to add newsletters to inbox');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceBadgeStyles = (confidence: 'low' | 'medium' | 'high') => {
    switch (confidence) {
      case 'high':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
      case 'low':
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-xl">
        <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <DialogTitle className="text-slate-900 dark:text-slate-100 text-xl font-semibold">
            Select Newsletters to Add to Inbox
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="select-all"
              checked={selectedNewsletters.size === newsletters.length}
              onCheckedChange={handleSelectAll}
            />
            <label 
              htmlFor="select-all" 
              className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Select All
            </label>
          </div>
          <Button
            onClick={handleAddToInbox}
            disabled={isLoading || selectedNewsletters.size === 0}
            className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
          >
            {isLoading ? 'Adding...' : `Add ${selectedNewsletters.size} to Inbox`}
          </Button>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3 py-2">
            {newsletters.map((newsletter) => (
              <div
                key={newsletter.id}
                className="flex items-start space-x-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors duration-200 group"
              >
                <Checkbox
                  id={newsletter.id}
                  checked={selectedNewsletters.has(newsletter.id)}
                  onCheckedChange={() => handleSelectNewsletter(newsletter.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor={newsletter.id}
                      className="font-medium text-slate-900 dark:text-slate-100 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    >
                      {newsletter.subject}
                    </label>
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getConfidenceBadgeStyles(newsletter.confidence)}`}>
                      {newsletter.confidence} confidence
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate mb-1">
                    From: {newsletter.from.text}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {new Date(newsletter.date).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            
            {newsletters.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No newsletters found to sync
                </p>
              </div>
            )}
            
            {isLoading && newsletters.length === 0 && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                  Loading newsletters...
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 