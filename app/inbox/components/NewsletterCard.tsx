'use client';

import { Star, Archive, MoreVertical, Tag, Trash2, Loader2, Building2 } from 'lucide-react';
import { Newsletter } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { formatDate, truncateText, cn, getContrastColor } from '../../../lib/utils';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  DropdownSeparator,
} from '../../../components/ui/Dropdown';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
  isSystem: boolean;
}

interface NewsletterCardProps {
  newsletter: Newsletter & { category?: string };
  isSelected: boolean;
  onClick: () => void;
  onToggleStar: () => void;
  onArchive: () => void;
  onUnarchive?: () => void;
  onCategoryChange?: (categoryId: number | null) => void;
}

// Utility to extract sender name
function extractSenderName(sender: string) {
  const emailMatch = sender.match(/^(.+?)\s*<.+>$/);
  if (emailMatch) {
    return emailMatch[1].trim();
  }
  const emailOnlyMatch = sender.match(/^([^@]+)@/);
  if (emailOnlyMatch) {
    return emailOnlyMatch[1].trim();
  }
  return sender.trim();
}

// Utility to extract domain from sender email
function extractDomain(senderEmail: string) {
  // Try to extract email from 'Name <email@domain.com>'
  const emailMatch = senderEmail.match(/<([^>]+)>/);
  const email = emailMatch ? emailMatch[1] : senderEmail;
  const atIdx = email.indexOf('@');
  if (atIdx !== -1) {
    return email.slice(atIdx + 1).toLowerCase();
  }
  return null;
}

export function NewsletterCard({ 
  newsletter, 
  isSelected, 
  onClick, 
  onToggleStar, 
  onArchive, 
  onUnarchive,
  onCategoryChange
}: NewsletterCardProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnarchiving, setIsUnarchiving] = useState(false);
  const { toast } = useToast();
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStar();
  };

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onArchive();
  };

  const handleUnarchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUnarchive) {
      onUnarchive();
      return;
    }
    try {
      setIsUnarchiving(true);
      const response = await fetch(`/api/newsletters`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newsletter.id,
          isArchived: false,
        }),
      });
      if (!response.ok) throw new Error('Failed to unarchive newsletter');
      const updated = await response.json();
      toast.success('Newsletter restored from Bin');
      // Optionally, trigger a refresh or callback
    } catch (error) {
      console.error('Error unarchiving newsletter:', error);
      toast.error('Failed to restore from Bin');
    } finally {
      setIsUnarchiving(false);
    }
  };

  const handleCategoryChange = async (categoryId: number | null) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(`/api/newsletters/${newsletter.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId }),
      });

      if (!response.ok) throw new Error('Failed to update category');
      
      const updated = await response.json();
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryColor = newsletter.categoryId
    ? categories.find(c => c.id === newsletter.categoryId)?.color || '#ff385c'
    : '#ff385c';

  return (
    <div
      className={cn(
        "group relative bg-background rounded-md shadow-sm border border-border p-4 transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-primary/30",
        isSelected ? "ring-2 ring-primary/40 border-primary/60" : "",
        !newsletter.isRead ? "bg-blue-50 dark:bg-blue-900/20" : ""
      )}
      onClick={onClick}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center min-w-0 space-x-3">
          {/* Logo */}
          {(() => {
            const domain = extractDomain(newsletter.senderEmail || newsletter.sender);
            if (domain && !logoError) {
              const logoUrl = `https://logo.clearbit.com/${domain}`;
              return (
                <img
                  src={logoUrl}
                  alt="Company Logo"
                  className="w-5 h-5 rounded bg-white border border-border object-contain mr-1"
                  onError={() => setLogoError(true)}
                />
              );
            } else if (domain && logoError) {
              return (
                <Building2 className="w-5 h-5 text-muted-foreground mr-1" />
              );
            }
            return null;
          })()}
          {/* Sender Name */}
              <span className={cn(
            "text-sm font-medium truncate max-w-[120px]",
                !newsletter.isRead ? "text-foreground" : "text-muted-foreground"
              )}>
            {extractSenderName(newsletter.sender)}
          </span>
          {/* Account Badge */}
          {newsletter.senderEmail && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground border border-border truncate max-w-[90px] font-medium" title={newsletter.senderEmail}>
              {newsletter.senderEmail.length > 15 ? newsletter.senderEmail.slice(0, 12) + '...' : newsletter.senderEmail}
              </span>
          )}
          {/* Unread Dot */}
              {!newsletter.isRead && (
            <span className="w-2 h-2 bg-primary-500 rounded-full ml-1" />
              )}
            </div>
        {/* Date */}
        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap ml-2">
              {formatDate(newsletter.receivedAt)}
            </span>
          </div>

          {/* Subject */}
      <div className="mb-0.5">
          <h3 className={cn(
          "text-sm leading-5 font-semibold truncate",
          !newsletter.isRead ? "text-foreground" : "text-muted-foreground"
          )}>
          {truncateText(newsletter.subject, 40)}
          </h3>
        {/* Category Badge below subject, left-aligned */}
          {newsletter.categoryId && (
          <span className="flex items-center mt-1 px-2 py-0.5 rounded-full border border-border text-xs font-medium w-fit"
            style={{ background: 'none', borderColor: categoryColor }}>
            <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: categoryColor, display: 'inline-block' }} />
            <span className="category-badge-text" style={{ color: 'var(--category-badge-text-color)' }}>
              {categories.find(c => c.id === newsletter.categoryId)?.name}
            </span>
          </span>
          )}
        </div>

      {/* Preview */}
      <p className="text-xs text-muted-foreground mb-2 leading-4 truncate max-w-full">
        {truncateText(newsletter.content, 80)}
      </p>

      {/* Actions Row - bottom right, horizontal, only on hover/focus */}
      <div className="absolute bottom-3 right-4 flex flex-row space-x-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-10">
          <Button
            variant="ghost"
          size="icon"
            onClick={handleStarClick}
          className="h-7 w-7 p-0"
          tabIndex={-1}
          >
            <Star
              className={cn(
              "h-4 w-4",
                newsletter.isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              )}
            />
          </Button>
        {/* Category Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={e => e.stopPropagation()}
              className={cn(
                "h-7 w-7 p-0 transition-all duration-200",
                newsletter.categoryId && "text-foreground",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading}
              title={newsletter.categoryId ? `Category: ${categories.find(c => c.id === newsletter.categoryId)?.name}` : "Add category"}
              tabIndex={-1}
            >
              <Tag className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" className="w-56 p-2 z-50 rounded-lg border bg-background shadow-lg">
            <div className="px-2 py-1.5">
              <h4 className="text-sm font-semibold text-foreground mb-2">
                {newsletter.categoryId ? 'Change Category' : 'Add Category'}
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Organize your newsletter for better discovery
              </p>
            </div>
            <DropdownMenu.Separator className="my-1 h-px bg-border" />
            <div className="max-h-48 overflow-y-auto">
              {categories.length === 0 ? (
                <div className="px-2 py-3 text-center">
                  <div className="w-8 h-8 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No categories available
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {categories.map((category) => (
                    <DropdownMenu.Item
                      key={category.id}
                      onSelect={() => handleCategoryChange(category.id)}
                      className={cn(
                        "flex items-center space-x-3 p-2 rounded-md transition-colors cursor-pointer",
                        "hover:bg-accent hover:text-foreground",
                        newsletter.categoryId === category.id && "bg-primary/10 text-primary",
                        isLoading && "opacity-50 pointer-events-none"
                      )}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">
                          {category.name}
                        </span>
                        {category.isSystem && (
                          <span className="text-xs text-muted-foreground block">
                            System Category
                          </span>
                        )}
                      </div>
                      {newsletter.categoryId === category.id && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      )}
                    </DropdownMenu.Item>
                  ))}
                </div>
              )}
            </div>
            {newsletter.categoryId && (
              <>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  onSelect={() => handleCategoryChange(null)}
                  className={cn(
                    "flex items-center space-x-2 p-2 text-error hover:bg-error/10 hover:text-error",
                    "transition-colors rounded-md cursor-pointer",
                    isLoading && "opacity-50 pointer-events-none"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    Remove Category
                  </span>
                </DropdownMenu.Item>
              </>
            )}
            {isLoading && (
              <div className="px-2 py-2 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Updating category...
                  </span>
                </div>
              </div>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        {/* Bin/Restore Actions */}
        {!newsletter.isArchived ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleArchiveClick}
            className="h-7 w-7 p-0"
            title="Move to Bin"
            tabIndex={-1}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          ) : (
            <Button
              variant="ghost"
            size="icon"
            onClick={handleUnarchive}
            className="h-7 w-7 p-0"
            title="Restore from Bin"
            disabled={isUnarchiving}
            tabIndex={-1}
          >
            {isUnarchiving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-success" />
            )}
            </Button>
          )}
      </div>
    </div>
  );
}
