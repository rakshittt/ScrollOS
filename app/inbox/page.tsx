'use client';

import { useState, useCallback, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { NewsletterList } from '@/app/inbox/components/NewsletterList';
import { ReadingPane } from '@/app/inbox/components/ReadingPane';
import { SyncNotificationBanner } from '@/app/inbox/components/SyncNotificationBanner';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
  isSystem: boolean;
}

export default function InboxPage() {
  const { data: session } = useSession();
  const [selectedNewsletterId, setSelectedNewsletterId] = useState<number | null>(null);
  const [newsletterIds, setNewsletterIds] = useState<number[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({
    inbox: 0,
    starred: 0,
    bin: 0
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [newNewsletterCount, setNewNewsletterCount] = useState<number>(0);
  const [syncResults, setSyncResults] = useState<Array<{
    email: string;
    newslettersFound: number;
    status: 'success' | 'error' | 'skipped';
    error?: string;
  }>>([]);
  const [totalEmailsProcessed, setTotalEmailsProcessed] = useState<number>(0);
  const { toast } = useToast();

  // Fetch accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/email/accounts');
        if (response.ok) {
          const data = await response.json();
        setAccounts(data);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    if (session) {
    fetchAccounts();
    }
  }, [session]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (session) {
      fetchCategories();
    }
  }, [session]);

  // Listen for sync events from header
  useEffect(() => {
    const handleSyncEvent = (event: CustomEvent) => {
      const { status, message, count, results, totalEmails } = event.detail;
      setSyncStatus(status);
      setSyncMessage(message || '');
      setNewNewsletterCount(count || 0);
      setSyncResults(results || []);
      setTotalEmailsProcessed(totalEmails || 0);
      
      if (status === 'success' && message) {
        toast.success(message);
      } else if (status === 'error' && message) {
        toast.error(message);
      }
    };

    window.addEventListener('sync-status-update', handleSyncEvent as EventListener);
    return () => {
      window.removeEventListener('sync-status-update', handleSyncEvent as EventListener);
    };
  }, [toast]);

  const handleSyncDismiss = () => {
    setSyncStatus('idle');
    setSyncMessage('');
    setNewNewsletterCount(0);
    setSyncResults([]);
    setTotalEmailsProcessed(0);
  };

  const handleSyncRetry = () => {
    // Trigger a new sync
    window.dispatchEvent(new CustomEvent('trigger-sync'));
  };

  const handleViewSettings = () => {
    window.location.href = '/settings/email';
  };

  const handleFolderCountsUpdate = (counts: Record<string, number>) => {
    setFolderCounts(counts);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleNewsletterAction = (action: 'bin' | 'restore' | 'star' | 'unstar') => {
    // Optimistically update folder counts based on the action
    setFolderCounts(prev => {
      const newCounts = { ...prev };
      switch (action) {
        case 'bin':
          newCounts.inbox = Math.max(0, newCounts.inbox - 1);
          newCounts.bin = newCounts.bin + 1;
          break;
        case 'restore':
          newCounts.inbox = newCounts.inbox + 1;
          newCounts.bin = Math.max(0, newCounts.bin - 1);
          break;
        case 'star':
          newCounts.inbox = Math.max(0, newCounts.inbox - 1);
          newCounts.starred = newCounts.starred + 1;
          break;
        case 'unstar':
          newCounts.inbox = newCounts.inbox + 1;
          newCounts.starred = Math.max(0, newCounts.starred - 1);
          break;
      }
      return newCounts;
    });
  };

  // Navigation logic
  const handleNextNewsletter = useCallback(() => {
    if (newsletterIds.length === 0 || selectedNewsletterId === null) return;
    
    const currentIndex = newsletterIds.indexOf(selectedNewsletterId);
    if (currentIndex === -1) return;
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < newsletterIds.length) {
      setSelectedNewsletterId(newsletterIds[nextIndex]);
    }
  }, [newsletterIds, selectedNewsletterId]);

  const handlePreviousNewsletter = useCallback(() => {
    if (newsletterIds.length === 0 || selectedNewsletterId === null) return;
    
    const currentIndex = newsletterIds.indexOf(selectedNewsletterId);
    if (currentIndex === -1) return;
    
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setSelectedNewsletterId(newsletterIds[prevIndex]);
    }
  }, [newsletterIds, selectedNewsletterId]);

  // Check if navigation is possible
  const canNavigateNext = newsletterIds.length > 0 && selectedNewsletterId !== null && 
    newsletterIds.indexOf(selectedNewsletterId) < newsletterIds.length - 1;
  
  const canNavigatePrevious = newsletterIds.length > 0 && selectedNewsletterId !== null && 
    newsletterIds.indexOf(selectedNewsletterId) > 0;

  // New handlers to ensure only one filter is active at a time
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setSelectedFolder('inbox'); // Always switch to inbox when a category is selected
  };

  const handleFolderSelect = (folder: string) => {
    setSelectedFolder(folder);
    setSelectedCategoryId(null); // Clear category when a folder is selected
  };

  return (
    <AppLayout
      onCategorySelect={handleCategorySelect}
      selectedCategoryId={selectedCategoryId}
      onFolderSelect={handleFolderSelect}
      selectedFolder={selectedFolder}
      onFolderCountsUpdate={handleFolderCountsUpdate}
      onSearchChange={handleSearchChange}
      searchQuery={searchQuery}
      accounts={accounts}
      selectedAccountId={selectedAccountId}
      onAccountChange={setSelectedAccountId}
    >
      {/* Sync Notification Banner */}
      <SyncNotificationBanner
        status={syncStatus}
        message={syncMessage}
        newNewsletterCount={newNewsletterCount}
        syncResults={syncResults}
        totalEmailsProcessed={totalEmailsProcessed}
        onDismiss={handleSyncDismiss}
        onRetry={handleSyncRetry}
        onViewSettings={handleViewSettings}
      />
      
      <div className="flex flex-1">
        <NewsletterList
          selectedId={selectedNewsletterId}
          onSelectNewsletter={setSelectedNewsletterId}
          onNewsletterIdsUpdate={setNewsletterIds}
          categoryId={selectedCategoryId}
          folder={selectedFolder}
          searchQuery={searchQuery}
          onNewsletterAction={handleNewsletterAction as (action: 'star' | 'unstar' | 'bin' | 'restore') => void}
          emailAccountId={selectedAccountId}
          categories={categories}
        />
        <ReadingPane
          selectedId={selectedNewsletterId}
          onNext={canNavigateNext ? handleNextNewsletter : undefined}
          onPrevious={canNavigatePrevious ? handlePreviousNewsletter : undefined}
          onRemove={() => handleNewsletterAction('bin')}
        />
      </div>
    </AppLayout>
  );
}
