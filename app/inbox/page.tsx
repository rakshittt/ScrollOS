'use client';

import { useState, useCallback, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { NewsletterList } from '@/app/inbox/components/NewsletterList';
import { ReadingPane } from '@/app/inbox/components/ReadingPane';
import { useSession } from 'next-auth/react';

export default function InboxPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedNewsletterId, setSelectedNewsletterId] = useState<number | null>(null);
  const [newsletterIds, setNewsletterIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({
    inbox: 0,
    starred: 0,
    bin: 0
  });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    // Fetch email accounts for the user
    const fetchAccounts = async () => {
      if (!session?.user?.id) return;
      const res = await fetch('/api/email/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    };
    fetchAccounts();
  }, [session]);

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
