'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Filter,
  X,
  Calendar,
  Star,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  Settings,
  SortAsc,
  SortDesc,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
  isSystem: boolean;
}

interface InboxFilterProps {
  categories: Category[];
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  variant?: 'compact' | 'full';
}

export interface FilterState {
  // Essential filters only
  searchQuery: string;
  readStatus: 'all' | 'read' | 'unread';
  starredStatus: 'all' | 'starred' | 'unstarred';
  dateRange: 'all' | 'today' | 'week' | 'month';
  sortBy: 'date' | 'sender' | 'subject';
  sortOrder: 'asc' | 'desc';
  selectedCategories: number[];
}

const defaultFilters: FilterState = {
  searchQuery: '',
  readStatus: 'all',
  starredStatus: 'all',
  dateRange: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
  selectedCategories: [],
};

export function InboxFilter({ 
  categories, 
  onFilterChange, 
  onClearFilters,
  isExpanded = false,
  onToggleExpanded,
  variant = 'full'
}: InboxFilterProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [activeFilters, setActiveFilters] = useState<number>(0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const filterTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.readStatus !== 'all') count++;
    if (filters.starredStatus !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.selectedCategories.length > 0) count++;
    if (filters.sortBy !== 'date' || filters.sortOrder !== 'desc') count++;
    
    setActiveFilters(count);
  }, [filters]);

  // Debounced filter change
  useEffect(() => {
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    filterTimeoutRef.current = setTimeout(() => {
      onFilterChange(filters);
    }, 300);

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [filters, onFilterChange]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    onClearFilters();
  };

  const toggleCategory = (categoryId: number) => {
    setFilters(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }));
  };

  const getDateRangeLabel = () => {
    switch (filters.dateRange) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'All Time';
    }
  };

  const getSortLabel = () => {
    const sortLabels = {
      date: 'Date',
      sender: 'Sender',
      subject: 'Subject'
    };
    return `${sortLabels[filters.sortBy]} (${filters.sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`;
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFilterModal) {
        setShowFilterModal(false);
      }
    };

    if (showFilterModal) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showFilterModal]);

  // Compact variant for header integration - now as modal
  if (variant === 'compact') {
    return (
      <>
        {/* Filter Trigger Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilterModal(true)}
          className={cn(
            "h-8 w-8 p-0 relative transition-all duration-200",
            activeFilters > 0 && "text-primary bg-primary/5"
          )}
          title="Filter newsletters"
        >
          <Filter className="h-4 w-4" />
          {activeFilters > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center bg-primary text-primary-foreground"
            >
              {activeFilters}
            </Badge>
          )}
        </Button>

        {/* Modal Overlay */}
        {showFilterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFilterModal(false)}
            />
            
            {/* Modal Content */}
            <div className="relative bg-background border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <Filter className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Filter Newsletters</h3>
                  {activeFilters > 0 && (
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      {activeFilters} active
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {activeFilters > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilterModal(false)}
                    className="h-8 w-8 p-0 hover:bg-accent"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                {/* Search */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search newsletters..."
                      value={filters.searchQuery}
                      onChange={(e) => updateFilter('searchQuery', e.target.value)}
                      className="pl-10 border-border focus:border-primary"
                    />
                  </div>
                </div>

                {/* Status Filters */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Read Status</label>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between border-border hover:border-primary"
                        >
                          <span className="flex items-center space-x-2">
                            <Eye className="h-4 w-4" />
                            <span>
                              {filters.readStatus === 'all' ? 'All' : 
                               filters.readStatus === 'read' ? 'Read' : 'Unread'}
                            </span>
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content className="w-48 bg-background border border-border rounded-lg shadow-lg">
                        <DropdownMenu.Item
                          onSelect={() => updateFilter('readStatus', 'all')}
                          className={cn(
                            "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                            filters.readStatus === 'all' && "bg-primary/10 text-primary"
                          )}
                        >
                          All
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onSelect={() => updateFilter('readStatus', 'read')}
                          className={cn(
                            "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                            filters.readStatus === 'read' && "bg-primary/10 text-primary"
                          )}
                        >
                          Read
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onSelect={() => updateFilter('readStatus', 'unread')}
                          className={cn(
                            "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                            filters.readStatus === 'unread' && "bg-primary/10 text-primary"
                          )}
                        >
                          Unread
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Starred</label>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between border-border hover:border-primary"
                        >
                          <span className="flex items-center space-x-2">
                            <Star className="h-4 w-4" />
                            <span>
                              {filters.starredStatus === 'all' ? 'All' : 
                               filters.starredStatus === 'starred' ? 'Starred' : 'Not Starred'}
                            </span>
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content className="w-48 bg-background border border-border rounded-lg shadow-lg">
                        <DropdownMenu.Item
                          onSelect={() => updateFilter('starredStatus', 'all')}
                          className={cn(
                            "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                            filters.starredStatus === 'all' && "bg-primary/10 text-primary"
                          )}
                        >
                          All
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onSelect={() => updateFilter('starredStatus', 'starred')}
                          className={cn(
                            "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                            filters.starredStatus === 'starred' && "bg-primary/10 text-primary"
                          )}
                        >
                          Starred
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onSelect={() => updateFilter('starredStatus', 'unstarred')}
                          className={cn(
                            "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                            filters.starredStatus === 'unstarred' && "bg-primary/10 text-primary"
                          )}
                        >
                          Not Starred
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Date Range</label>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between border-border hover:border-primary"
                      >
                        <span className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{getDateRangeLabel()}</span>
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="w-48 bg-background border border-border rounded-lg shadow-lg">
                      <DropdownMenu.Item
                        onSelect={() => updateFilter('dateRange', 'all')}
                        className={cn(
                          "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                          filters.dateRange === 'all' && "bg-primary/10 text-primary"
                        )}
                      >
                        All Time
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={() => updateFilter('dateRange', 'today')}
                        className={cn(
                          "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                          filters.dateRange === 'today' && "bg-primary/10 text-primary"
                        )}
                      >
                        Today
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={() => updateFilter('dateRange', 'week')}
                        className={cn(
                          "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                          filters.dateRange === 'week' && "bg-primary/10 text-primary"
                        )}
                      >
                        This Week
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={() => updateFilter('dateRange', 'month')}
                        className={cn(
                          "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                          filters.dateRange === 'month' && "bg-primary/10 text-primary"
                        )}
                      >
                        This Month
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Categories</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          onClick={() => toggleCategory(category.id)}
                          className={cn(
                            "flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors border",
                            "hover:bg-accent hover:border-primary/30",
                            filters.selectedCategories.includes(category.id) 
                              ? "bg-primary/10 border-primary/50 text-primary" 
                              : "border-border"
                          )}
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium truncate">
                            {category.name}
                          </span>
                          {filters.selectedCategories.includes(category.id) && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-auto" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sort Options */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Sort By</label>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between border-border hover:border-primary"
                      >
                        <span className="flex items-center space-x-2">
                          {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                          <span>{getSortLabel()}</span>
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="w-48 bg-background border border-border rounded-lg shadow-lg">
                      <DropdownMenu.Item
                        onSelect={() => updateFilter('sortBy', 'date')}
                        className={cn(
                          "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                          filters.sortBy === 'date' && "bg-primary/10 text-primary"
                        )}
                      >
                        Date
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={() => updateFilter('sortBy', 'sender')}
                        className={cn(
                          "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                          filters.sortBy === 'sender' && "bg-primary/10 text-primary"
                        )}
                      >
                        Sender
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={() => updateFilter('sortBy', 'subject')}
                        className={cn(
                          "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                          filters.sortBy === 'subject' && "bg-primary/10 text-primary"
                        )}
                      >
                        Subject
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="my-1 h-px bg-border" />
                      <DropdownMenu.Item
                        onSelect={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
                      >
                        Toggle Order ({filters.sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {activeFilters > 0 && (
                      <>
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm text-primary font-medium">
                          {activeFilters} active filter{activeFilters !== 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowFilterModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setShowFilterModal(false)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Full variant - simplified and elegant
  return (
    <div className="bg-background border border-border rounded-lg shadow-sm">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Inbox Filters</h3>
            {activeFilters > 0 && (
              <Badge variant="default" className="ml-2 bg-primary text-primary-foreground">
                {activeFilters} active
              </Badge>
            )}
          </div>
          
          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground h-8 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search newsletters..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="pl-10 border-border focus:border-primary"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Read Status</label>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between border-border hover:border-primary"
                >
                  <span className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>
                      {filters.readStatus === 'all' ? 'All' : 
                       filters.readStatus === 'read' ? 'Read' : 'Unread'}
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="w-48 bg-background border border-border rounded-lg shadow-lg">
                <DropdownMenu.Item
                  onSelect={() => updateFilter('readStatus', 'all')}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                    filters.readStatus === 'all' && "bg-primary/10 text-primary"
                  )}
                >
                  All
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => updateFilter('readStatus', 'read')}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                    filters.readStatus === 'read' && "bg-primary/10 text-primary"
                  )}
                >
                  Read
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => updateFilter('readStatus', 'unread')}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                    filters.readStatus === 'unread' && "bg-primary/10 text-primary"
                  )}
                >
                  Unread
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Starred</label>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between border-border hover:border-primary"
                >
                  <span className="flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span>
                      {filters.starredStatus === 'all' ? 'All' : 
                       filters.starredStatus === 'starred' ? 'Starred' : 'Not Starred'}
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="w-48 bg-background border border-border rounded-lg shadow-lg">
                <DropdownMenu.Item
                  onSelect={() => updateFilter('starredStatus', 'all')}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                    filters.starredStatus === 'all' && "bg-primary/10 text-primary"
                  )}
                >
                  All
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => updateFilter('starredStatus', 'starred')}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                    filters.starredStatus === 'starred' && "bg-primary/10 text-primary"
                  )}
                >
                  Starred
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => updateFilter('starredStatus', 'unstarred')}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                    filters.starredStatus === 'unstarred' && "bg-primary/10 text-primary"
                  )}
                >
                  Not Starred
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Date Range</label>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between border-border hover:border-primary"
              >
                <span className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{getDateRangeLabel()}</span>
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="w-48 bg-background border border-border rounded-lg shadow-lg">
              <DropdownMenu.Item
                onSelect={() => updateFilter('dateRange', 'all')}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                  filters.dateRange === 'all' && "bg-primary/10 text-primary"
                )}
              >
                All Time
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => updateFilter('dateRange', 'today')}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                  filters.dateRange === 'today' && "bg-primary/10 text-primary"
                )}
              >
                Today
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => updateFilter('dateRange', 'week')}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                  filters.dateRange === 'week' && "bg-primary/10 text-primary"
                )}
              >
                This Week
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => updateFilter('dateRange', 'month')}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                  filters.dateRange === 'month' && "bg-primary/10 text-primary"
                )}
              >
                This Month
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Categories</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors border",
                    "hover:bg-accent hover:border-primary/30",
                    filters.selectedCategories.includes(category.id) 
                      ? "bg-primary/10 border-primary/50 text-primary" 
                      : "border-border"
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium truncate">
                    {category.name}
                  </span>
                  {filters.selectedCategories.includes(category.id) && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Sort By</label>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between border-border hover:border-primary"
              >
                <span className="flex items-center space-x-2">
                  {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  <span>{getSortLabel()}</span>
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="w-48 bg-background border border-border rounded-lg shadow-lg">
              <DropdownMenu.Item
                onSelect={() => updateFilter('sortBy', 'date')}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                  filters.sortBy === 'date' && "bg-primary/10 text-primary"
                )}
              >
                Date
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => updateFilter('sortBy', 'sender')}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                  filters.sortBy === 'sender' && "bg-primary/10 text-primary"
                )}
              >
                Sender
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => updateFilter('sortBy', 'subject')}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm hover:bg-accent",
                  filters.sortBy === 'subject' && "bg-primary/10 text-primary"
                )}
              >
                Subject
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item
                onSelect={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
              >
                Toggle Order ({filters.sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
  );
}
