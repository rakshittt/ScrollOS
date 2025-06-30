'use client';

import { useState, useCallback, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { NewsletterList } from '@/app/inbox/components/NewsletterList';
import { ReadingPane } from '@/app/inbox/components/ReadingPane';
import { SyncNotificationBanner } from '@/app/inbox/components/SyncNotificationBanner';
// import { WelcomeBanner } from '@/components/onboarding/WelcomeBanner';
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { EmptyInboxState } from '@/components/onboarding/EmptyInboxState';
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
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  // const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [hasEmailConnected, setHasEmailConnected] = useState(false);
  
  const { toast } = useToast();

  // Check onboarding status on mount
  useEffect(() => {
    if (session?.user) {
      checkOnboardingStatus();
    }
  }, [session]);

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/user/onboarding');
      if (response.ok) {
        const data = await response.json();
        setOnboardingCompleted(data.onboardingCompleted || false);
        
        // Only show welcome banner if onboarding is not completed AND user hasn't connected email
        // If user has connected email, they're already engaged, so skip onboarding
        // setShowWelcomeBanner(!data.onboardingCompleted && !hasEmailConnected);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Show welcome banner by default only if no email is connected
      // setShowWelcomeBanner(!hasEmailConnected);
    }
  };

  // Fetch accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/email/accounts');
        if (response.ok) {
          const data = await response.json();
          setAccounts(data);
          const hasConnected = data.length > 0;
          setHasEmailConnected(hasConnected);
          
          // If user has connected email, hide onboarding since they're already engaged
          if (hasConnected) {
            // setShowWelcomeBanner(false);
            setShowOnboarding(false);
            
            // Mark onboarding as completed since user has connected email
            if (!onboardingCompleted) {
              try {
                await fetch('/api/user/onboarding', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    onboardingCompleted: true,
                    completedSteps: [1, 2, 3, 4, 5] // Mark all steps as completed
                  }),
                });
                setOnboardingCompleted(true);
              } catch (error) {
                console.error('Error marking onboarding as completed:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    if (session) {
      fetchAccounts();
    }
  }, [session, onboardingCompleted]);

  // Check if user has newsletters and mark onboarding as completed if they do
  useEffect(() => {
    const hasNewsletters = newsletterIds.length > 0 || Object.values(folderCounts).some(count => count > 0);
    
    if (hasNewsletters && !onboardingCompleted) {
      // User has newsletters, so they're engaged - mark onboarding as completed
      const markOnboardingCompleted = async () => {
        try {
          await fetch('/api/user/onboarding', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              onboardingCompleted: true,
              completedSteps: [1, 2, 3, 4, 5] // Mark all steps as completed
            }),
          });
          setOnboardingCompleted(true);
          setShowOnboarding(false);
        } catch (error) {
          console.error('Error marking onboarding as completed:', error);
        }
      };
      markOnboardingCompleted();
    }
    // Do nothing if onboardingCompleted is already true
  }, [newsletterIds, folderCounts, onboardingCompleted]);

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

  // Onboarding handlers
  const handleStartOnboarding = () => {
    setShowOnboarding(true);
    // setShowWelcomeBanner(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setOnboardingCompleted(true);
    // setShowWelcomeBanner(false);
  };

  // const handleDismissWelcomeBanner = () => {
  //   setShowWelcomeBanner(false);
  // };

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

  // Check if inbox is empty
  const isInboxEmpty = folderCounts.inbox === 0 && newsletterIds.length === 0;

  // Check if user has newsletters (either in inbox or other folders)
  const hasNewsletters = newsletterIds.length > 0 || Object.values(folderCounts).some(count => count > 0);

  // Only show onboarding if inbox is empty AND user hasn't connected email
  // If user has newsletters, they're already engaged, so skip onboarding
  const shouldShowOnboarding = isInboxEmpty && !hasEmailConnected && !hasNewsletters;

  return (
    <>
      {/* Welcome Banner for new users */}
      {/* {showWelcomeBanner && shouldShowOnboarding && (
        <WelcomeBanner
          onStartOnboarding={handleStartOnboarding}
          onDismiss={handleDismissWelcomeBanner}
        />
      )} */}

      {/* Onboarding Guide Modal */}
      <OnboardingGuide
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />

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
        onShowOnboarding={handleStartOnboarding}
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
        
        {/* Show empty state only when truly empty and user needs onboarding */}
        {shouldShowOnboarding ? (
          <EmptyInboxState
            onStartOnboarding={handleStartOnboarding}
            hasEmailConnected={hasEmailConnected}
          />
        ) : (
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
        )}
      </AppLayout>
    </>
  );
}
