'use client';

import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { cn, formatDate } from '@/lib/utils';
import { Newsletter } from '@/types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Eye,
    Loader2,
    Sparkles,
    Star,
    Tag,
    Trash2
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface FullscreenReaderProps {
  newsletter: Newsletter;
  readingMode: 'focus' | 'normal';
  fontSize: number;
  lineHeight: number;
  maxWidth: number;
  readingProgress: number;
  categories: Array<{ id: number; name: string; color: string; icon?: string; isSystem: boolean }>;
  isUnarchiving: boolean;
  isCategoryLoading: boolean;
  onExitFullscreen: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onToggleReadingMode: () => void;
  onFontSizeChange: (size: number) => void;
  onToggleStar: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onCategoryChange: (categoryId: number | null) => void;
//   onCopyContent: () => void;
  onShowShortcuts: () => void;
}

export function FullscreenReader({
  newsletter,
  readingMode,
  fontSize,
  lineHeight,
  maxWidth,
  readingProgress,
  categories,
  isUnarchiving,
  isCategoryLoading,
  onExitFullscreen,
  onPrevious,
  onNext,
  onToggleReadingMode,
  onFontSizeChange,
  onToggleStar,
  onArchive,
  onUnarchive,
  onCategoryChange,
//   onCopyContent,
  onShowShortcuts
}: FullscreenReaderProps) {
  const [showHeader, setShowHeader] = useState(true);
  const [headerTimeout, setHeaderTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isHeaderTransitioning, setIsHeaderTransitioning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-hide header after 3 seconds
  useEffect(() => {
    if (showHeader && !isHeaderTransitioning) {
      if (headerTimeout) {
        clearTimeout(headerTimeout);
      }
      
      const timeout = setTimeout(() => {
        setShowHeader(false);
      }, 3000);
      
      setHeaderTimeout(timeout);
    }
  }, [showHeader, isHeaderTransitioning]);

  const showHeaderTemporarily = () => {
    if (isHeaderTransitioning) return; // Prevent rapid transitions
    
    setIsHeaderTransitioning(true);
    setShowHeader(true);
    
    if (headerTimeout) {
      clearTimeout(headerTimeout);
    }
    
    // Small delay to prevent rapid transitions
    setTimeout(() => {
      setIsHeaderTransitioning(false);
    }, 100);
  };

  // Keyboard event detection for showing header and handling shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle keyboard shortcuts if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Don't handle keyboard shortcuts if user is interacting with buttons
      if (event.target instanceof HTMLButtonElement) {
        return;
      }

      // Show header on any key press
      showHeaderTemporarily();

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
          onToggleStar();
          break;
        case 'e':
          event.preventDefault();
          onArchive();
          break;
        case 'm':
          event.preventDefault();
          onToggleReadingMode();
          break;
        case 'f':
          event.preventDefault();
          onExitFullscreen();
          break;
        case 'Escape':
          event.preventDefault();
          onExitFullscreen();
          break;
        case '?':
          event.preventDefault();
          onShowShortcuts();
          break;
        case '+':
        case '=':
          event.preventDefault();
          onFontSizeChange(Math.min(fontSize + 1, 28));
          break;
        case '-':
          event.preventDefault();
          onFontSizeChange(Math.max(fontSize - 1, 14));
          break;
        case '0':
          event.preventDefault();
          onFontSizeChange(18); // Reset to default
          break;
        case 'c':
          event.preventDefault();
          // TODO: Add category dropdown trigger
          break;
        case 'h':
        case 'Home':
          event.preventDefault();
          // Scroll to top
          if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
          break;
        case 'End':
          event.preventDefault();
          // Scroll to bottom
          if (contentRef.current) {
            contentRef.current.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' });
          }
          break;
        case ' ':
        case 'PageDown':
          event.preventDefault();
          // Scroll down one page
          if (contentRef.current) {
            const scrollAmount = contentRef.current.clientHeight * 0.8;
            contentRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
          }
          break;
        case 'PageUp':
          event.preventDefault();
          // Scroll up one page
          if (contentRef.current) {
            const scrollAmount = contentRef.current.clientHeight * 0.8;
            contentRef.current.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          // Scroll up
          if (contentRef.current) {
            contentRef.current.scrollBy({ top: -50, behavior: 'smooth' });
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          // Scroll down
          if (contentRef.current) {
            contentRef.current.scrollBy({ top: 50, behavior: 'smooth' });
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrevious, onToggleStar, onArchive, onToggleReadingMode, onExitFullscreen, onShowShortcuts, onFontSizeChange, fontSize]);

  // Prevent ReadingPane's mouse movement detection from interfering
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Only handle mouse movement if it's not on a button or interactive element
      const target = event.target as HTMLElement;
      if (!(target instanceof HTMLButtonElement) && 
          !(target instanceof HTMLAnchorElement) &&
          !target.closest('button') &&
          !target.closest('a')) {
        showHeaderTemporarily();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getReadingModeStyles = () => {
    switch (readingMode) {
      case 'focus':
        return 'max-w-3xl mx-auto px-6';
      default:
        return 'max-w-7xl mx-auto px-8';
    }
  };

  const currentCategory = categories.find(c => c.id === newsletter.categoryId);

  // Utility to check if a newsletter is "new" (imported via sync within last 12 hours)
  const isNewsletterNew = (importedAt?: Date | string): boolean => {
    if (!importedAt) return false; // If no importedAt, it wasn't imported via sync
    const importedTime = new Date(importedAt).getTime();
    const currentTime = new Date().getTime();
    const twelveHoursInMs = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    return (currentTime - importedTime) < twelveHoursInMs;
  };

  // Inject dark mode override styles for newsletter content
  useEffect(() => {
    const styleId = 'newsletter-darkmode-override';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .dark .prose * {
          color: #f4f4f5 !important;
          background: transparent !important;
          border-color: #444 !important;
        }
        .dark .prose a { color: #60a5fa !important; }
        .dark .prose strong, .dark .prose b { color: #fff !important; }
        .dark .prose em { color: #f4f4f5 !important; }
        .dark .prose code { color: #f4f4f5 !important; background: #222 !important; }
        .dark .prose pre { color: #f4f4f5 !important; background: #18181b !important; }
        .dark .prose img {
          filter: brightness(0.95) contrast(1.1) drop-shadow(0 0 2px #222);
          background: transparent !important;
          border-radius: 4px;
        }
        .dark .prose img[src*="zomato"],
        .dark .prose img[alt*="zomato"] {
          background: #fff !important;
          padding: 2px;
          border-radius: 4px;
        }
      `;
      document.head.appendChild(style);
    }
    return () => {};
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Fullscreen Header */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        showHeader ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
      )}>
        {/* Top Bar */}
        <div className="bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left Section - Navigation & Title */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onExitFullscreen();
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
                  <ArrowLeft className="h-3 w-3" />
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
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>

              <div className="w-px h-6 bg-border" />

              <div className="flex flex-col min-w-0">
                <h1 className="text-lg font-medium text-foreground truncate">
                  {newsletter.subject}
                </h1>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>{newsletter.sender}</span>
                  <span>•</span>
                  <span>{formatDate(newsletter.receivedAt)}</span>
                  {isNewsletterNew(newsletter.importedAt) && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full shadow-sm">
                      <Sparkles className="h-3 w-3" />
                      <span>NEW</span>
                    </div>
                  )}
                  {categories.length > 0 && (
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <div
                          onClick={(e) => e.stopPropagation()}
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
                                  onSelect={() => onCategoryChange(category.id)}
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
                              onSelect={() => onCategoryChange(null)}
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
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-2">
              {/* Reading Mode */}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleReadingMode();
                }}
                className="h-8 px-3 hover:bg-accent border-border"
                title={`Reading Mode (R) - ${readingMode}`}
              >
                {readingMode === 'focus' ? <Eye className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                <span className="ml-2 text-xs">{readingMode}</span>
              </Button>

              <div className="w-px h-6 bg-border" />

              {/* Newsletter Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar();
                }}
                className="h-8 w-8 p-0 hover:bg-accent border-border"
                title="Star newsletter (S)"
              >
                <Star className={cn(
                  "h-3 w-3",
                  newsletter.isStarred ? "fill-yellow-400 text-yellow-400" : ""
                )} />
              </Button>

              {/* Bin/Restore Actions */}
              {newsletter && !newsletter.isArchived && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive();
                  }}
                  className="h-8 w-8 p-0 hover:bg-accent border-border"
                  title="Move to Bin (E)"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
              {newsletter && newsletter.isArchived && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnarchive();
                  }}
                  disabled={isUnarchiving}
                  className="h-8 w-8 p-0 hover:bg-accent border-border"
                  title="Restore from Bin"
                >
                  {isUnarchiving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3 text-success" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Reading Progress Bar */}
          <div className="h-1 bg-border">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Content */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto bg-background"
        onClick={(e) => {
          // Only show header if the click is not on a button or interactive element
          const target = e.target as HTMLElement;
          if (!(target instanceof HTMLButtonElement) && 
              !(target instanceof HTMLAnchorElement) &&
              !target.closest('button') &&
              !target.closest('a')) {
            showHeaderTemporarily();
          }
        }}
      >
        <div className={cn(
          "py-16", 
          getReadingModeStyles(),
          readingMode === 'focus' ? 'bg-gradient-to-b from-background to-background/95' : ''
        )}>
          <article 
            className={cn(
              "prose prose-lg max-w-none",
              // Reading mode specific styles
              readingMode === 'focus' ? [
                "prose-xl", // Larger base text
                "prose-p:text-lg prose-p:leading-8 prose-p:mb-8", // Larger paragraphs with more spacing
                "prose-h1:text-5xl prose-h1:mb-10 prose-h1:mt-16 prose-h1:font-bold prose-h1:tracking-tight",
                "prose-h2:text-4xl prose-h2:mb-8 prose-h2:mt-12 prose-h2:font-semibold",
                "prose-h3:text-3xl prose-h3:mb-6 prose-h3:mt-10 prose-h3:font-medium",
                "prose-h4:text-2xl prose-h4:mb-4 prose-h4:mt-8 prose-h4:font-medium",
                "prose-blockquote:border-l-6 prose-blockquote:pl-8 prose-blockquote:py-6 prose-blockquote:my-10",
                "prose-blockquote:bg-accent/40 prose-blockquote:rounded-r-xl",
                "prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-12",
                "prose-pre:rounded-2xl prose-pre:p-8 prose-pre:my-10",
                "prose-ul:space-y-3 prose-ul:my-8",
                "prose-ol:space-y-3 prose-ol:my-8",
                "prose-li:leading-7",
                "prose:first-letter:text-7xl prose:first-letter:font-black prose:first-letter:mr-4"
              ] : [
                // Normal mode - standard styling
                "prose-p:text-base prose-p:leading-7 prose-p:mb-6",
                "prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-12 prose-h1:font-bold",
                "prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-10 prose-h2:font-semibold",
                "prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:font-medium",
                "prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6 prose-h4:font-medium",
                "prose-blockquote:border-l-4 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:my-8",
                "prose-blockquote:bg-accent/30 prose-blockquote:rounded-r-lg",
                "prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8",
                "prose-pre:rounded-xl prose-pre:p-6 prose-pre:my-8",
                "prose-ul:space-y-2 prose-ul:my-6",
                "prose-ol:space-y-2 prose-ol:my-6",
                "prose-li:leading-6",
                "prose:first-letter:text-6xl prose:first-letter:font-bold prose:first-letter:mr-3"
              ],
              // Common styles
              "prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight prose-headings:leading-tight",
              "prose-p:text-foreground prose-p:font-normal",
              "prose-p:first-of-type:text-lg prose-p:first-of-type:leading-8",
              // Links
              "prose-a:text-primary hover:prose-a:text-primary/80 prose-a:underline prose-a:underline-offset-2 prose-a:decoration-2",
              "prose-a:font-normal hover:prose-a:no-underline",
              // Strong and emphasis
              "prose-strong:text-foreground prose-strong:font-semibold",
              "prose-em:text-foreground prose-em:italic",
              // Code
              "prose-code:bg-accent prose-code:text-foreground prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-mono",
              "prose-code:before:content-none prose-code:after:content-none",
              // Pre-formatted code blocks
              "prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:overflow-x-auto",
              "prose-pre:border prose-pre:border-slate-700 prose-pre:shadow-lg",
              // Lists
              "prose-ul:list-disc prose-ul:pl-8",
              "prose-ol:list-decimal prose-ol:pl-8",
              "prose-li:text-foreground",
              "prose-li:marker:text-primary prose-li:marker:font-medium",
              // Images
              "prose-img:mx-auto",
              "prose-img:border prose-img:border-border",
              // Horizontal rules
              "prose-hr:border-border prose-hr:my-12 prose-hr:border-2",
              // Tables
              "prose-table:w-full prose-table:border-collapse prose-table:my-8",
              "prose-th:border prose-th:border-border prose-th:bg-accent prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-medium",
              "prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-3",
              // General spacing and layout
              "prose:max-w-none prose:mx-auto"
            )}
            style={{ 
              fontSize: readingMode === 'focus' ? `${fontSize + 2}px` : `${fontSize}px`,
              lineHeight: readingMode === 'focus' ? lineHeight + 0.2 : lineHeight,
              maxWidth: readingMode === 'focus' ? `${Math.min(maxWidth, 80)}%` : `${maxWidth}%`
            }}
            dangerouslySetInnerHTML={{ __html: newsletter.htmlContent || newsletter.content }}
          />
        </div>
      </div>

      {/* Fullscreen Status Indicator */}
      {!showHeader && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-background/90 backdrop-blur-md border border-border rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-foreground font-medium">Fullscreen Mode</span>
              <span className="text-muted-foreground">Move mouse or press any key to show controls</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground text-xs">J/K to navigate</span>
            </div>
          </div>
        </div>
      )}

      {/* Reading Progress Indicator */}
      {!showHeader && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-background/90 backdrop-blur-md border border-border rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground min-w-[3rem]">
                {Math.round(readingProgress)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 