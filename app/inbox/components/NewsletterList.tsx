'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { NewsletterCard } from '@/app/inbox/components/NewsletterCard';
import { Newsletter } from '@/types';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface NewsletterListProps {
  selectedId: number | null;
  onSelectNewsletter: (id: number | null) => void;
  onNewsletterIdsUpdate: (ids: number[]) => void;
  categoryId: number | null;
  folder: string;
  searchQuery?: string;
  onNewsletterAction?: (action: 'bin' | 'restore' | 'star' | 'unstar') => void;
  emailAccountId?: number | null;
}

export function NewsletterList({ selectedId, onSelectNewsletter, onNewsletterIdsUpdate, categoryId, folder, searchQuery = '', onNewsletterAction, emailAccountId }: NewsletterListProps) {
  const { data: session, status } = useSession();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const fetchNewsletters = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      params.append('folder', folder);
      if (categoryId) {
        params.append('categoryId', categoryId.toString());
      }
      if (debouncedSearchQuery.trim()) {
        params.append('query', debouncedSearchQuery.trim());
      }
      if (emailAccountId !== null && emailAccountId !== undefined) {
        params.append('emailAccountId', emailAccountId.toString());
      }
      
      const url = `/api/newsletters?${params.toString()}`;
      const response = await fetch(url);
      if (response.status === 401) {
        setError('Please sign in to view your newsletters');
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch newsletters');
      const data = await response.json();
      setNewsletters(data);
      onNewsletterIdsUpdate(data.map((n: Newsletter) => n.id));
      if (data.length > 0 && !selectedId) {
        onSelectNewsletter(data[0].id);
      } else if (data.length === 0) {
        onSelectNewsletter(null);
      }
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      setError('Failed to load newsletters. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, folder, debouncedSearchQuery, onSelectNewsletter, selectedId, onNewsletterIdsUpdate, emailAccountId]);

  useEffect(() => {
    if (session) {
      fetchNewsletters();
    }
  }, [session, fetchNewsletters]);

  const refreshNewsletters = async () => {
    await fetchNewsletters();
  };

  const handleNewsletterClick = async (newsletter: Newsletter) => {
    onSelectNewsletter(newsletter.id);
    if (!newsletter.isRead) {
      try {
        const response = await fetch(`/api/newsletters`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newsletter.id,
            isRead: true,
          }),
        });
        if (!response.ok) throw new Error('Failed to update newsletter');
        const updated = await response.json();
        const updatedNewsletters = newsletters.map(n => n.id === newsletter.id ? updated : n);
        setNewsletters(updatedNewsletters);
        onNewsletterIdsUpdate(updatedNewsletters.map(n => n.id));
      } catch (error) {
        console.error('Error updating newsletter:', error);
      }
    }
  };

  const handleToggleStar = async (id: number) => {
    const newsletter = newsletters.find(n => n.id === id);
    if (!newsletter) return;

    try {
      const response = await fetch(`/api/newsletters`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          isStarred: !newsletter.isStarred,
        }),
      });
      if (!response.ok) throw new Error('Failed to update newsletter');
      const updated = await response.json();
      const updatedNewsletters = newsletters.map(n => n.id === id ? updated : n);
      setNewsletters(updatedNewsletters);
      onNewsletterIdsUpdate(updatedNewsletters.map(n => n.id));
      if (onNewsletterAction) {
        onNewsletterAction('star');
      }
    } catch (error) {
      console.error('Error updating newsletter:', error);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      const response = await fetch(`/api/newsletters`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          isArchived: true,
        }),
      });
      if (!response.ok) throw new Error('Failed to archive newsletter');
      const updatedNewsletters = newsletters.filter(n => n.id !== id);
      setNewsletters(updatedNewsletters);
      onNewsletterIdsUpdate(updatedNewsletters.map(n => n.id));
      if (selectedId === id) {
        onSelectNewsletter(null);
      }
      if (onNewsletterAction) {
        onNewsletterAction('bin');
      }
      toast.success('Newsletter moved to Bin');
    } catch (error) {
      console.error('Error archiving newsletter:', error);
      toast.error('Failed to move to Bin');
    }
  };

  const handleUnarchive = async (id: number) => {
    try {
      const response = await fetch(`/api/newsletters`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          isArchived: false,
        }),
      });
      if (!response.ok) throw new Error('Failed to unarchive newsletter');
      const updatedNewsletters = newsletters.filter(n => n.id !== id);
      setNewsletters(updatedNewsletters);
      onNewsletterIdsUpdate(updatedNewsletters.map(n => n.id));
      if (onNewsletterAction) {
        onNewsletterAction('restore');
      }
      toast.success('Newsletter restored from Bin');
    } catch (error) {
      console.error('Error unarchiving newsletter:', error);
      toast.error('Failed to restore from Bin');
    }
  };

  const handleCategoryChange = async (id: number, categoryId: number | null) => {
    try {
      const response = await fetch(`/api/newsletters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId }),
      });
      if (!response.ok) throw new Error('Failed to update category');
      const updated = await response.json();
      const updatedNewsletters = newsletters.map(n => n.id === id ? updated : n);
      setNewsletters(updatedNewsletters);
      onNewsletterIdsUpdate(updatedNewsletters.map(n => n.id));
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  if (!session) {
    return (
      <div className="w-96 border-r border-border bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view your newsletters</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-96 border-r border-border bg-background flex items-center justify-center">
        <p className="text-error-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-96 border-r border-border bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-foreground">
              {debouncedSearchQuery ? 'Search Results' : 'Inbox'}
            </h2>
            {debouncedSearchQuery && (
              <span className="text-sm text-muted-foreground">
                "{debouncedSearchQuery}"
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {debouncedSearchQuery && (
              <span className="text-sm text-muted-foreground">
                {newsletters.length} found
              </span>
            )}
          <span className="text-sm text-muted-foreground">
            {newsletters.filter(n => !n.isRead).length} unread
          </span>
          </div>
        </div>
      </div>

      {/* Newsletter list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
          </div>
        ) : newsletters.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No newsletters found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {newsletters.map((newsletter) => (
              <NewsletterCard
                key={newsletter.id}
                newsletter={newsletter}
                isSelected={selectedId === newsletter.id}
                onClick={() => handleNewsletterClick(newsletter)}
                onToggleStar={() => handleToggleStar(newsletter.id)}
                onArchive={() => handleArchive(newsletter.id)}
                onUnarchive={() => handleUnarchive(newsletter.id)}
                onCategoryChange={(categoryId: number | null) => handleCategoryChange(newsletter.id, categoryId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
