'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { NewsletterCard } from '@/app/inbox/components/NewsletterCard';
import { Newsletter } from '@/types';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { InboxFilter, FilterState } from '@/app/inbox/components/InboxFilter';

interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
  isSystem: boolean;
}

interface NewsletterListProps {
  selectedId: number | null;
  onSelectNewsletter: (id: number | null) => void;
  onNewsletterIdsUpdate: (ids: number[]) => void;
  categoryId: number | null;
  folder: string;
  searchQuery?: string;
  onNewsletterAction?: (action: 'bin' | 'restore' | 'star' | 'unstar') => void;
  emailAccountId?: number | null;
  categories: Category[];
  onFilterChange?: (filters: FilterState) => void;
  onClearFilters?: () => void;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
}

export function NewsletterList({ selectedId, onSelectNewsletter, onNewsletterIdsUpdate, categoryId, folder, searchQuery = '', onNewsletterAction, emailAccountId, categories, onFilterChange, onClearFilters }: NewsletterListProps) {
  const { data: session, status } = useSession();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [useLoadMore, setUseLoadMore] = useState(false);
  const [allNewsletters, setAllNewsletters] = useState<Newsletter[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isInitialMount = useRef(true);

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

  // Memoize the fetch parameters to prevent unnecessary re-renders
  const fetchParams = useMemo(() => ({
    folder,
    categoryId,
    debouncedSearchQuery,
    emailAccountId,
    useLoadMore,
    activeFilters
  }), [folder, categoryId, debouncedSearchQuery, emailAccountId, useLoadMore, activeFilters]);

  // Reset pagination when filters change (but not on initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      setCurrentPage(1);
      setAllNewsletters([]);
      setPagination(null);
    } else {
      isInitialMount.current = false;
    }
  }, [fetchParams]);

  const fetchNewsletters = useCallback(async (isPageChange = false, isLoadMore = false) => {
    if (!session) return;
    
    try {
      if (isPageChange) {
        setIsPageLoading(true);
      } else if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setError(null);
        setIsLoading(true);
      }
      
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
      params.append('page', currentPage.toString());
      params.append('limit', '50');
      
      // Add filter parameters
      if (activeFilters) {
        if (activeFilters.searchQuery) {
          params.append('search', activeFilters.searchQuery);
        }
        if (activeFilters.readStatus !== 'all') {
          params.append('readStatus', activeFilters.readStatus);
        }
        if (activeFilters.starredStatus !== 'all') {
          params.append('starredStatus', activeFilters.starredStatus);
        }
        if (activeFilters.dateRange !== 'all') {
          params.append('dateRange', activeFilters.dateRange);
        }
        if (activeFilters.selectedCategories.length > 0) {
          params.append('categories', activeFilters.selectedCategories.join(','));
        }
        if (activeFilters.sortBy !== 'date' || activeFilters.sortOrder !== 'desc') {
          params.append('sortBy', activeFilters.sortBy);
          params.append('sortOrder', activeFilters.sortOrder);
        }
      }
      
      const url = `/api/newsletters?${params.toString()}`;
      
      const response = await fetch(url);
      if (response.status === 401) {
        setError('Please sign in to view your newsletters');
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch newsletters');
      const data = await response.json();
      
      // Handle new paginated response format
      if (data.newsletters && data.pagination) {
        if (useLoadMore && isLoadMore) {
          // Append to existing newsletters for load more
          setAllNewsletters(prev => {
            const updatedNewsletters = [...prev, ...data.newsletters];
            setNewsletters(updatedNewsletters);
            onNewsletterIdsUpdate(updatedNewsletters.map((n: Newsletter) => n.id));
            return updatedNewsletters;
          });
        } else {
          setNewsletters(data.newsletters);
          setAllNewsletters(data.newsletters);
          onNewsletterIdsUpdate(data.newsletters.map((n: Newsletter) => n.id));
        }
        setPagination(data.pagination);
        
        // Show helpful message if provided
        if (data.message) {
          toast.info(data.message);
        }
        
        // Only auto-select first newsletter if we don't have a selected one and there are newsletters
        if (data.newsletters.length > 0 && !selectedId) {
          onSelectNewsletter(data.newsletters[0].id);
        } else if (data.newsletters.length === 0 && selectedId) {
          // Clear selection if no newsletters found
          onSelectNewsletter(null);
        }
      } else {
        // Fallback for old format
        setNewsletters(data);
        setAllNewsletters(data);
        onNewsletterIdsUpdate(data.map((n: Newsletter) => n.id));
        if (data.length > 0 && !selectedId) {
          onSelectNewsletter(data[0].id);
        } else if (data.length === 0 && selectedId) {
          onSelectNewsletter(null);
        }
      }
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      setError('Failed to load newsletters. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsPageLoading(false);
      setIsLoadingMore(false);
    }
  }, [session, folder, categoryId, debouncedSearchQuery, emailAccountId, currentPage, useLoadMore, selectedId, onSelectNewsletter, onNewsletterIdsUpdate, activeFilters]);

  // Single useEffect to handle all fetch scenarios
  useEffect(() => {
    if (session) {
      fetchNewsletters();
    }
  }, [session, fetchParams, currentPage, fetchNewsletters]);

  const refreshNewsletters = useCallback(async () => {
    await fetchNewsletters();
  }, [fetchNewsletters]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!pagination?.hasNext) return;
    setCurrentPage(prev => prev + 1);
  }, [pagination?.hasNext]);

  const toggleViewMode = useCallback(() => {
    setUseLoadMore(!useLoadMore);
    setCurrentPage(1);
    setAllNewsletters([]);
    setPagination(null);
  }, [useLoadMore]);

  const handleNewsletterClick = useCallback(async (newsletter: Newsletter) => {
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
  }, [newsletters, onSelectNewsletter, onNewsletterIdsUpdate]);

  const handleToggleStar = useCallback(async (id: number) => {
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
  }, [newsletters, onNewsletterAction, onNewsletterIdsUpdate]);

  const handleArchive = useCallback(async (id: number) => {
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
  }, [newsletters, selectedId, onSelectNewsletter, onNewsletterAction, onNewsletterIdsUpdate]);

  const handleUnarchive = useCallback(async (id: number) => {
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
  }, [newsletters, onNewsletterAction, onNewsletterIdsUpdate]);

  const handleCategoryChange = useCallback(async (id: number, categoryId: number | null) => {
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
  }, [newsletters, onNewsletterIdsUpdate]);

  // Filter handlers
  const handleFilterChange = useCallback((filters: FilterState) => {
    setActiveFilters(filters);
    // Reset pagination when filters change
    setCurrentPage(1);
    setAllNewsletters([]);
    setPagination(null);
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveFilters(null);
    // Reset pagination when filters are cleared
    setCurrentPage(1);
    setAllNewsletters([]);
    setPagination(null);
  }, []);

  if (!session) {
    return (
      <div className="w-96 border-r border-border bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view your newsletters</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-96 border-r border-border bg-background flex flex-col">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Inbox</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-error/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Newsletters</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refreshNewsletters} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 border-r border-border bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-medium text-foreground">
              {debouncedSearchQuery ? 'Search Results' : 'Inbox'}
            </h2>
            {debouncedSearchQuery && (
              <span className="text-sm text-muted-foreground">
                "{debouncedSearchQuery}"
              </span>
            )}
            {pagination && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {useLoadMore ? 'Load More' : 'Pagination'}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {debouncedSearchQuery && (
              <span className="text-sm text-muted-foreground">
                {pagination?.totalCount || newsletters.length} found
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              {newsletters.filter(n => !n.isRead).length} unread
            </span>
            {/* Compact Filter Icon */}
            <InboxFilter
              categories={categories}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              variant="compact"
            />
            {useLoadMore && pagination && (
              <span className="text-xs text-muted-foreground">
                {allNewsletters.length} loaded
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Newsletter list */}
      <div className="flex-1 overflow-y-auto relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
          </div>
        ) : newsletters.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No newsletters found</p>
          </div>
        ) : (
          <>
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
                  categories={categories}
              />
            ))}
          </div>
            {/* Loading overlay for page changes */}
            {isPageLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <div className="flex items-center space-x-2 bg-background border border-border rounded-lg px-4 py-2 shadow-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {useLoadMore ? (
                `${allNewsletters.length} of ${pagination.totalCount} newsletters`
              ) : (
                `Page ${pagination.currentPage} of ${pagination.totalPages}`
              )}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleViewMode}
                className="text-xs text-primary hover:text-primary/80 underline"
              >
                {useLoadMore ? 'Show pagination' : 'Load more mode'}
              </button>
              <span className="text-sm text-muted-foreground">
                {pagination.totalCount} total newsletters
              </span>
            </div>
          </div>
          
          {useLoadMore ? (
            // Load More Mode
            <div className="flex justify-center">
              {pagination.hasNext ? (
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                      Loading more...
                    </>
                  ) : (
                    'Load More Newsletters'
                  )}
                </Button>
              ) : (
                <span className="text-sm text-muted-foreground">
                  All newsletters loaded
                </span>
              )}
            </div>
          ) : (
            // Pagination Mode
            <>
              {isPageLoading ? (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
