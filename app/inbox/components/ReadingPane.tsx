'use client';

import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { cn, estimateReadingTime, formatDate } from '@/lib/utils';
import { Newsletter } from '@/types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
    ArrowLeft,
    BookOpen,
    Building2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
    Tag,
    Trash2,
    X
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FullscreenReader } from './FullscreenReader';
import { SmartToolbar } from './ReadingToolbar';

interface ReadingPaneProps {
  selectedId: number | null;
  onNext?: () => void;
  onPrevious?: () => void;
  onRemove?: () => void;
}

interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
  isSystem: boolean;
}

type ReadingMode = 'normal' | 'focus';
type ReadingTheme = 'light' | 'dark' | 'sepia';

export function ReadingPane({ selectedId, onNext, onPrevious, onRemove }: ReadingPaneProps) {
  const { data: session } = useSession();
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [readingMode, setReadingMode] = useState<ReadingMode>('normal');
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('light');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [maxWidth, setMaxWidth] = useState(65); // percentage
  const [readingProgress, setReadingProgress] = useState(0);
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [isUnarchiving, setIsUnarchiving] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showFullscreenHeader, setShowFullscreenHeader] = useState(true);
  const [fullscreenHeaderTimeout, setFullscreenHeaderTimeout] = useState<NodeJS.Timeout | null>(null);
  const [logoError, setLogoError] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNewsletter = async () => {
      if (!selectedId) {
        setNewsletter(null);
        return;
      }

      // Small delay to prevent rapid loading state changes
      const loadingTimeout = setTimeout(() => {
        setIsLoading(true);
      }, 50);

      try {
        const response = await fetch(`/api/newsletters/${selectedId}`);
        if (!response.ok) throw new Error('Failed to fetch newsletter');
        const data = await response.json();
        setNewsletter(data);
      } catch (error) {
        console.error('Error fetching newsletter:', error);
        toast.error('Failed to load newsletter');
      } finally {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
      }
    };

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

    if (session) {
      fetchNewsletter();
      fetchCategories();
    }
  }, [selectedId, session, toast]);

  // Reading progress tracking
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current && containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const scrollHeight = containerRef.current.scrollHeight;
        const clientHeight = containerRef.current.clientHeight;
        const progress = Math.min((scrollTop / (scrollHeight - clientHeight)) * 100, 100);
        setReadingProgress(progress);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [newsletter]);

  // Fullscreen header auto-hide
  useEffect(() => {
    if (isFullscreen && showFullscreenHeader) {
      if (fullscreenHeaderTimeout) {
        clearTimeout(fullscreenHeaderTimeout);
      }
      
      const timeout = setTimeout(() => {
        setShowFullscreenHeader(false);
      }, 3000);
      
      setFullscreenHeaderTimeout(timeout);
    }
  }, [isFullscreen, showFullscreenHeader]);

  const showFullscreenHeaderTemporarily = () => {
    if (isFullscreen) {
      setShowFullscreenHeader(true);
      if (fullscreenHeaderTimeout) {
        clearTimeout(fullscreenHeaderTimeout);
      }
    }
  };

  const toggleReadingMode = () => {
    const modes: ReadingMode[] = ['normal', 'focus'];
    const currentIndex = modes.indexOf(readingMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setReadingMode(modes[nextIndex]);
    toast.success(`Switched to ${modes[nextIndex]} mode`);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
      setShowFullscreenHeader(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
      setIsFullscreen(false);
      setShowFullscreenHeader(false);
    }
  };

  const handleToggleStar = async () => {
    if (!newsletter) return;
    try {
      const response = await fetch(`/api/newsletters`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newsletter.id,
          isStarred: !newsletter.isStarred,
        }),
      });
      if (!response.ok) throw new Error('Failed to update newsletter');
      const updated = await response.json();
      setNewsletter(updated);
      toast.success(updated.isStarred ? 'Newsletter starred' : 'Newsletter unstarred');
    } catch (error) {
      console.error('Error updating newsletter:', error);
      toast.error('Failed to update newsletter');
    }
  };

  const handleArchive = async () => {
    if (!newsletter) return;
    try {
      setIsUnarchiving(true);
      const response = await fetch(`/api/newsletters`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newsletter.id,
          isArchived: true,
        }),
      });
      if (!response.ok) throw new Error('Failed to archive newsletter');
      toast.success('Newsletter moved to Bin');
      if (onRemove) onRemove();
      else if (onNext) onNext();
    } catch (error) {
      console.error('Error archiving newsletter:', error);
      toast.error('Failed to move to Bin');
    } finally {
      setIsUnarchiving(false);
    }
  };

  const handleUnarchive = async () => {
    if (!newsletter) return;
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
      setNewsletter(updated);
      toast.success('Newsletter restored from Bin');
    } catch (error) {
      console.error('Error unarchiving newsletter:', error);
      toast.error('Failed to restore from Bin');
    } finally {
      setIsUnarchiving(false);
    }
  };

  const resetZoom = () => {
    setFontSize(18);
    setLineHeight(1.7);
    setMaxWidth(65);
  };

  const handleCategoryChange = async (categoryId: number | null) => {
    if (!newsletter) return;
    try {
      setIsCategoryLoading(true);
      const response = await fetch(`/api/newsletters/${newsletter.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId }),
      });
      if (!response.ok) throw new Error('Failed to update category');
      const updated = await response.json();
      setNewsletter(updated);
      toast.success(categoryId ? 'Category updated' : 'Category removed');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setIsCategoryLoading(false);
    }
  };

  // const copyToClipboard = async () => {
  //   if (!newsletter) return;
  //   try {
  //     await navigator.clipboard.writeText(newsletter.content);
  //     toast.success('Content copied to clipboard');
  //   } catch (error) {
  //     toast.error('Failed to copy content');
  //   }
  // };

  // Keyboard shortcuts handler
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't handle keyboard shortcuts if user is typing in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    // Don't handle keyboard shortcuts if user is interacting with buttons
    if (event.target instanceof HTMLButtonElement) {
      return;
    }
    
    // Handle keyboard shortcuts
    switch (event.key) {
      case 'j':
      case 'ArrowRight':
        if (onNext) {
          event.preventDefault();
          onNext();
        }
        break;
      case 'k':
      case 'ArrowLeft':
        if (onPrevious) {
          event.preventDefault();
          onPrevious();
        }
        break;
      case 's':
        event.preventDefault();
        handleToggleStar();
        break;
      case 'e':
        event.preventDefault();
        handleArchive();
        break;
      case 'm':
        event.preventDefault();
        toggleReadingMode();
        break;
      case 'f':
        event.preventDefault();
        toggleFullscreen();
        break;
      case 'Escape':
        event.preventDefault();
        if (showShortcuts) setShowShortcuts(false);
        if (isFullscreen) toggleFullscreen();
        break;
      case '?':
        event.preventDefault();
        setShowShortcuts(!showShortcuts);
        break;
      case '+':
      case '=':
        event.preventDefault();
        setFontSize(prev => Math.min(prev + 1, 28));
        break;
      case '-':
        event.preventDefault();
        setFontSize(prev => Math.max(prev - 1, 14));
        break;
      case '0':
        event.preventDefault();
        resetZoom();
        break;
      case 'c':
        event.preventDefault();
        // TODO: Add category dropdown trigger
        toast.info('Press C to manage categories (dropdown will be implemented)');
        break;
      case 'h':
      case 'Home':
        event.preventDefault();
        // Scroll to top
        if (containerRef.current) {
          containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
        break;
      case 'End':
        event.preventDefault();
        // Scroll to bottom
        if (containerRef.current) {
          containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
        }
        break;
      case ' ':
      case 'PageDown':
        event.preventDefault();
        // Scroll down one page
        if (containerRef.current) {
          const scrollAmount = containerRef.current.clientHeight * 0.8;
          containerRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        }
        break;
      case 'PageUp':
        event.preventDefault();
        // Scroll up one page
        if (containerRef.current) {
          const scrollAmount = containerRef.current.clientHeight * 0.8;
          containerRef.current.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        // Scroll up
        if (containerRef.current) {
          containerRef.current.scrollBy({ top: -50, behavior: 'smooth' });
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        // Scroll down
        if (containerRef.current) {
          containerRef.current.scrollBy({ top: 50, behavior: 'smooth' });
        }
        break;
    }

    // Show fullscreen header on any key press (but not on button clicks)
    if (isFullscreen && !(event.target instanceof HTMLButtonElement)) {
      showFullscreenHeaderTemporarily();
    }
  }, [onNext, onPrevious, showShortcuts, isFullscreen, handleToggleStar, handleArchive, toggleReadingMode, toggleFullscreen, toast, resetZoom]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Fullscreen change event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setShowFullscreenHeader(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Mouse movement detection for fullscreen header (only when not in fullscreen mode)
  useEffect(() => {
    if (isFullscreen) return; // Don't handle mouse movement when FullscreenReader is active

    const handleMouseMove = () => {
      showFullscreenHeaderTemporarily();
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isFullscreen, showFullscreenHeaderTemporarily]);

  const getReadingModeStyles = () => {
    switch (readingMode) {
      case 'focus':
        return 'max-w-3xl mx-auto px-6';
      default:
        return 'max-w-7xl mx-auto px-8';
    }
  };

  const extractSenderName = (sender: string) => {
    // If sender contains email format (name <email@domain.com>), extract just the name
    const emailMatch = sender.match(/^(.+?)\s*<.+>$/);
    if (emailMatch) {
      return emailMatch[1].trim();
    }
    
    // If it's just an email address, extract the part before @
    const emailOnlyMatch = sender.match(/^([^@]+)@/);
    if (emailOnlyMatch) {
      return emailOnlyMatch[1].trim();
    }
    
    // Otherwise, return the sender as is
    return sender.trim();
  };

  // Utility to extract domain from sender email (copied from NewsletterCard)
  function extractDomain(senderEmail: string) {
    const emailMatch = senderEmail.match(/<([^>]+)>/);
    const email = emailMatch ? emailMatch[1] : senderEmail;
    const atIdx = email.indexOf('@');
    if (atIdx !== -1) {
      return email.slice(atIdx + 1).toLowerCase();
    }
    return null;
  }

  // Calculate reading time
  const readingTime = newsletter ? estimateReadingTime(newsletter.htmlContent || newsletter.content) : null;

  // Fullscreen Layout - Always render when in fullscreen mode, even during loading
  if (isFullscreen) {
    // If we have a newsletter, render the fullscreen reader
    if (newsletter) {
      return (
        <FullscreenReader
          newsletter={newsletter}
          readingMode={readingMode}
          fontSize={fontSize}
          lineHeight={lineHeight}
          maxWidth={maxWidth}
          readingProgress={readingProgress}
          categories={categories}
          isUnarchiving={isUnarchiving}
          isCategoryLoading={isCategoryLoading}
          onExitFullscreen={toggleFullscreen}
          onPrevious={onPrevious}
          onNext={onNext}
          onToggleReadingMode={toggleReadingMode}
          onFontSizeChange={setFontSize}
          onToggleStar={handleToggleStar}
          onArchive={handleArchive}
          onUnarchive={handleUnarchive}
          onCategoryChange={handleCategoryChange}
          // onCopyContent={copyToClipboard}
          onShowShortcuts={() => setShowShortcuts(true)}
        />
      );
    }
    
    // If we're in fullscreen but don't have newsletter data yet, show a loading state
    // that maintains the fullscreen layout - this prevents the inbox flash
    // This happens during navigation between newsletters
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Fullscreen Header for loading state */}
        <div className="bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="h-9 w-9 p-0 hover:bg-accent"
                title="Exit Fullscreen (ESC)"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrevious?.();
                  }}
                  disabled={!onPrevious}
                  className="h-8 w-8 p-0 hover:bg-accent border-border"
                  title="Previous (K)"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext?.();
                  }}
                  disabled={!onNext}
                  className="h-8 w-8 p-0 hover:bg-accent border-border"
                  title="Next (J)"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading content area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading newsletter...</p>
          </div>
        </div>
      </div>
    );
  }

  // Normal Layout - Only render when not in fullscreen mode
  if (!session) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view newsletters</p>
      </div>
    );
  }

  if (!selectedId) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Select a Newsletter</h3>
            <p className="text-muted-foreground">Choose a newsletter from the list to start reading</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading newsletter...</p>
        </div>
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-error/10 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-error" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Newsletter Not Found</h3>
            <p className="text-muted-foreground">The newsletter you're looking for doesn't exist</p>
          </div>
        </div>
      </div>
    );
  }

  // Normal Layout
  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex-1 flex flex-col relative overflow-hidden",
        readingMode === 'focus' ? 'bg-background-secondary' : ''
      )}
    >
      {/* Focus Mode Indicator */}
      {readingMode === 'focus' && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-background/90 backdrop-blur-md border border-border rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-foreground font-medium">Focus Mode</span>
              <span className="text-muted-foreground">Press M to exit</span>
            </div>
          </div>
        </div>
      )}

      {/* Reading Time Indicator */}
      {/* <div className="fixed top-0 left-0 right-0 h-8 bg-border/50 z-40 flex items-center justify-center">
        {readingTime && (
          <span className="text-xs font-medium text-muted-foreground tracking-wide flex items-center gap-1">
            <Clock className="w-4 h-4 mr-1 inline-block text-primary" />
            {readingTime} min read
          </span>
        )}
      </div> */}

      {/* Header */}
      {readingMode !== 'focus' && (
        <div className="border-b border-border bg-gradient-to-b from-background to-background/95 backdrop-blur-sm sticky top-0 z-30">
          <div className={getReadingModeStyles()}>
            <div className="px-8 py-8">
              {/* Main Header Section */}
              <div className="space-y-4">
                {/* Title and Primary Actions */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 min-w-0 pr-6">
                    <h1 className="text-2xl font-bold text-foreground leading-tight tracking-tight">
                  {newsletter.subject}
                </h1>
                  </div>
                  
                  {/* Primary Actions - Right Side */}
                  <div className="flex items-center flex-shrink-0">
                    <SmartToolbar
                      newsletter={newsletter}
                      categories={categories}
                      readingMode={readingMode}
                      fontSize={fontSize}
                      isFullscreen={isFullscreen}
                      isUnarchiving={isUnarchiving}
                      isCategoryLoading={isCategoryLoading}
                      onPrevious={onPrevious}
                      onNext={onNext}
                      onToggleReadingMode={toggleReadingMode}
                      onFontSizeChange={setFontSize}
                      onToggleStar={handleToggleStar}
                      onArchive={handleArchive}
                      onUnarchive={handleUnarchive}
                      onCategoryChange={handleCategoryChange}
                      onToggleFullscreen={toggleFullscreen}
                    />
                  </div>
                </div>

                {/* Newsletter Metadata - Simplified */}
                <div className="flex items-center justify-between mb-8">
                  {/* Sender and Date */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const domain = extractDomain(newsletter.senderEmail || newsletter.sender);
                        if (domain && !logoError) {
                          const logoUrl = `https://logo.clearbit.com/${domain}`;
                          return (
                            <img
                              src={logoUrl}
                              alt="Company Logo"
                              className="w-8 h-8 rounded bg-white border border-border object-contain mr-3"
                              onError={() => setLogoError(true)}
                            />
                          );
                        } else if (domain && logoError) {
                          return (
                            <Building2 className="w-8 h-8 text-muted-foreground mr-3" />
                          );
                        }
                        return null;
                      })()}
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground text-sm py-1">
                          {extractSenderName(newsletter.sender)}
                        </span>
                        <span className="font-medium text-foreground text-xs">
                          {newsletter.senderEmail}
                        </span>
                      </div>
                    <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(newsletter.receivedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Category Badge */}
                    {categories.length > 0 && (
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <div
                            className={cn(
                              "flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border border-transparent hover:border-current/20 cursor-pointer",
                              isCategoryLoading && "opacity-50",
                              newsletter.categoryId && "bg-background/80"
                            )}
                            style={{
                              backgroundColor: newsletter.categoryId ? `${categories.find(c => c.id === newsletter.categoryId)?.color}15` : undefined,
                              color: categories.find(c => c.id === newsletter.categoryId)?.color || '#ff385c',
                            }}
                            title={newsletter.categoryId ? `Category: ${categories.find(c => c.id === newsletter.categoryId)?.name}` : 'Add category'}
                          >
                            <div
                              className="w-2 h-2 rounded-full shadow-sm"
                              style={{
                                backgroundColor: categories.find(c => c.id === newsletter.categoryId)?.color || '#ff385c',
                                boxShadow: `0 0 0 1px ${categories.find(c => c.id === newsletter.categoryId)?.color || '#ff385c'}40`
                              }}
                            />
                            <span className="font-semibold">
                              {newsletter.categoryId ? categories.find(c => c.id === newsletter.categoryId)?.name : 'Add Category'}
                            </span>
                            {isCategoryLoading && (
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin ml-2" />
                            )}
                          </div>
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
                                      isCategoryLoading && "opacity-50 pointer-events-none"
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
                                  isCategoryLoading && "opacity-50 pointer-events-none"
                      )}
                    >
                      {isCategoryLoading ? (
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
                          {isCategoryLoading && (
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
                    )}
                  </div>

                  {/* Reading Time */}
                  <div className="flex items-center space-x-3">
                    {readingTime && (
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4 mr-1 inline-block text-primary" />
                        {readingTime} min read
                      </span>
                    )}
                  </div>
                          </div>
                        </div>
            </div>
          </div>
        </div>
      )}

      

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn("py-16 pb-24", getReadingModeStyles())}>
          <article 
            ref={contentRef}
            className={cn(
              "prose prose-lg max-w-none",
              readingTheme === 'dark' ? "prose-invert" : "",
              readingTheme === 'sepia' ? "prose-amber" : "",
              // Headings
              "prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight prose-headings:leading-tight",
              "prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-12 prose-h1:font-extrabold",
              "prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-10 prose-h2:font-bold",
              "prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:font-semibold",
              "prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6 prose-h4:font-semibold",
              // Paragraphs and text
              "prose-p:text-foreground prose-p:leading-7 prose-p:mb-6 prose-p:text-base prose-p:font-normal",
              "prose-p:first-of-type:text-lg prose-p:first-of-type:leading-8",
              // Links
              "prose-a:text-primary hover:prose-a:text-primary/80 prose-a:underline prose-a:underline-offset-2 prose-a:decoration-2",
              "prose-a:font-medium hover:prose-a:no-underline",
              // Strong and emphasis
              "prose-strong:text-foreground prose-strong:font-bold prose-strong:font-semibold",
              "prose-em:text-foreground prose-em:italic",
              // Blockquotes
              "prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:bg-accent/30",
              "prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:my-8 prose-blockquote:rounded-r-lg",
              "prose-blockquote:text-foreground prose-blockquote:font-medium prose-blockquote:italic",
              // Code
              "prose-code:bg-accent prose-code:text-foreground prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-mono",
              "prose-code:before:content-none prose-code:after:content-none",
              // Pre-formatted code blocks
              "prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:p-6 prose-pre:rounded-xl prose-pre:overflow-x-auto",
              "prose-pre:border prose-pre:border-slate-700 prose-pre:shadow-lg",
              "prose-pre:my-8",
              // Lists
              "prose-ul:list-disc prose-ul:pl-8 prose-ul:space-y-2 prose-ul:my-6",
              "prose-ol:list-decimal prose-ol:pl-8 prose-ol:space-y-2 prose-ol:my-6",
              "prose-li:text-foreground prose-li:leading-6",
              "prose-li:marker:text-primary prose-li:marker:font-semibold",
              // Images
              "prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:mx-auto",
              "prose-img:border prose-img:border-border",
              // Horizontal rules
              "prose-hr:border-border prose-hr:my-12 prose-hr:border-2",
              // Tables
              "prose-table:w-full prose-table:border-collapse prose-table:my-8",
              "prose-th:border prose-th:border-border prose-th:bg-accent prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold",
              "prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-3",
              // General spacing and layout
              "prose:max-w-none prose:mx-auto",
              "prose:first-letter:text-6xl prose:first-letter:font-bold prose:first-letter:text-primary",
              "prose:first-letter:float-left prose:first-letter:mr-3 prose:first-letter:leading-none"
            )}
            style={{ 
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              maxWidth: `${maxWidth}%`
            }}
            dangerouslySetInnerHTML={{ __html: newsletter.htmlContent || newsletter.content }}
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Keyboard Shortcuts</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowShortcuts(false)} className="hover:bg-accent">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-6">
              {/* Navigation */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-2">Navigation</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Next Newsletter</span>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-2 py-1 bg-accent rounded text-xs">J</kbd>
                      <span className="text-muted-foreground">or</span>
                      <kbd className="px-2 py-1 bg-accent rounded text-xs">→</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Previous Newsletter</span>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-2 py-1 bg-accent rounded text-xs">K</kbd>
                      <span className="text-muted-foreground">or</span>
                      <kbd className="px-2 py-1 bg-accent rounded text-xs">←</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Scroll Down</span>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-2 py-1 bg-accent rounded text-xs">↓</kbd>
                      <span className="text-muted-foreground">or</span>
                      <kbd className="px-2 py-1 bg-accent rounded text-xs">Space</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Scroll Up</span>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-2 py-1 bg-accent rounded text-xs">↑</kbd>
                      <span className="text-muted-foreground">or</span>
                      <kbd className="px-2 py-1 bg-accent rounded text-xs">Page Up</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Scroll to Top</span>
                    <kbd className="px-2 py-1 bg-accent rounded text-xs">Home</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Scroll to Bottom</span>
                    <kbd className="px-2 py-1 bg-accent rounded text-xs">End</kbd>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-2">Actions</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Star/Unstar</span>
                    <kbd className="px-2 py-1 bg-accent rounded text-xs">S</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Move to Bin</span>
                    <kbd className="px-2 py-1 bg-accent rounded text-xs">E</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Toggle Reading Mode</span>
                    <kbd className="px-2 py-1 bg-accent rounded text-xs">R</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Toggle Fullscreen</span>
                    <kbd className="px-2 py-1 bg-accent rounded text-xs">F</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Exit Fullscreen</span>
                    <kbd className="px-2 py-1 bg-accent rounded text-xs">ESC</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Category Management</span>
                    <kbd className="px-2 py-1 bg-accent rounded text-xs">C</kbd>
                  </div>
                </div>
              </div>

              {/* Reading Controls */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-2">Reading Controls</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Increase Font Size</span>
                    <kbd className="px-2 py-1 bg-accent rounded text-xs">+</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Decrease Font Size</span>
                    <kbd className="px-2 py-1 bg-accent rounded text-xs">-</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reset Font Size</span>
                    <kbd className="px-2 py-1 bg-accent rounded text-xs">0</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Show This Help</span>
                    <kbd className="px-2 py-1 bg-accent rounded text-xs">?</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
