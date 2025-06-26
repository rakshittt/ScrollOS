'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Star,
  Archive,
  Eye,
  EyeOff,
  BookOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  HelpCircle,
  ArrowLeft,
  Loader2,
  X,
  User,
  Calendar,
  Tag,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { Newsletter } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface FullscreenReaderProps {
  newsletter: Newsletter;
  readingMode: 'focus' | 'distraction-free' | 'normal';
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
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-hide header after 3 seconds
  useEffect(() => {
    if (showHeader) {
      if (headerTimeout) {
        clearTimeout(headerTimeout);
      }
      
      const timeout = setTimeout(() => {
        setShowHeader(false);
      }, 3000);
      
      setHeaderTimeout(timeout);
    }
  }, [showHeader]);

  const showHeaderTemporarily = () => {
    setShowHeader(true);
    if (headerTimeout) {
      clearTimeout(headerTimeout);
    }
  };

  // Mouse movement detection
  useEffect(() => {
    const handleMouseMove = () => {
      showHeaderTemporarily();
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getReadingModeStyles = () => {
    switch (readingMode) {
      case 'focus':
        return 'max-w-4xl mx-auto px-8';
      case 'distraction-free':
        return 'max-w-5xl mx-auto px-12';
      default:
        return 'max-w-6xl mx-auto px-6';
    }
  };

  const currentCategory = categories.find(c => c.id === newsletter.categoryId);

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
                onClick={onExitFullscreen}
                className="h-9 w-9 p-0 hover:bg-accent"
                title="Exit Fullscreen (ESC)"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrevious}
                  disabled={!onPrevious}
                  className="h-8 w-8 p-0 hover:bg-accent border-border"
                  title="Previous (K)"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNext}
                  disabled={!onNext}
                  className="h-8 w-8 p-0 hover:bg-accent border-border"
                  title="Next (J)"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>

              <div className="w-px h-6 bg-border" />

              <div className="flex flex-col min-w-0">
                <h1 className="text-lg font-semibold text-foreground truncate">
                  {newsletter.subject}
                </h1>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>{newsletter.sender}</span>
                  <span>•</span>
                  <span>{formatDate(newsletter.receivedAt)}</span>
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
                onClick={onToggleReadingMode}
                className="h-8 px-3 hover:bg-accent border-border"
                title={`Reading Mode (R) - ${readingMode}`}
              >
                {readingMode === 'focus' ? <Eye className="h-3 w-3" /> :
                 readingMode === 'distraction-free' ? <EyeOff className="h-3 w-3" /> :
                 <BookOpen className="h-3 w-3" />}
                <span className="ml-2 text-xs">{readingMode}</span>
              </Button>

              {/* Font Controls */}
              {/* <div className="flex items-center space-x-1 bg-muted/50 rounded-lg px-2 py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFontSizeChange(Math.max(fontSize - 1, 14))}
                  className="h-6 w-6 p-0 hover:bg-accent"
                  title="Decrease font size (-)"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="text-xs font-medium text-foreground min-w-[2rem] text-center">
                  {fontSize}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFontSizeChange(Math.min(fontSize + 1, 28))}
                  className="h-6 w-6 p-0 hover:bg-accent"
                  title="Increase font size (+)"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onFontSizeChange(18);
                    toast.success('Font size reset');
                  }}
                  className="h-6 w-6 p-0 hover:bg-accent"
                  title="Reset zoom (0)"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div> */}

              <div className="w-px h-6 bg-border" />

              {/* Newsletter Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleStar}
                className="h-8 w-8 p-0 hover:bg-accent border-border"
                title="Star newsletter (S)"
              >
                <Star className={cn(
                  "h-3 w-3",
                  newsletter.isStarred ? "fill-yellow-400 text-yellow-400" : ""
                )} />
              </Button>

              {/* Category Icon Button
                <Dropdown align="end">
                <DropdownTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 hover:bg-accent border-border transition-all duration-200",
                      currentCategory && "border-2",
                      currentCategory && "border-primary/30",
                      isCategoryLoading && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={isCategoryLoading}
                    title={currentCategory ? `Category: ${currentCategory.name}` : "Add category"}
                  >
                    {currentCategory ? (
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-sm border border-white/20"
                        style={{ 
                          backgroundColor: currentCategory.color,
                          boxShadow: `0 0 0 1px ${currentCategory.color}40, 0 2px 4px rgba(0,0,0,0.1)`
                        }}
                      />
                    ) : (
                      <Tag className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    )}
                  </Button>
                </DropdownTrigger>
                <DropdownContent className="w-56 p-2">
                  <div className="px-2 py-1.5">
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      {currentCategory ? 'Change Category' : 'Add Category'}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Organize your newsletter for better discovery
                    </p>
                  </div>
                  
                  <DropdownSeparator />
                  
                  {/* Current Category Display */}
                  {/* {currentCategory && (
                    <div className="px-2 py-1.5">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Current Category
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-md bg-accent/50 border border-border">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: currentCategory.color }}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {currentCategory.name}
                        </span>
                      </div>
                    </div>
                  )} */}
                  
                  {/* Category List */}
                  {/* <div className="max-h-48 overflow-y-auto">
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
                          <DropdownItem
                            key={category.id}
                            onClick={() => onCategoryChange(category.id)}
                            className={cn(
                              "flex items-center space-x-3 p-2 rounded-md transition-colors",
                              "hover:bg-accent hover:text-foreground",
                              currentCategory?.id === category.id && "bg-primary/10 text-primary",
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
                            {currentCategory?.id === category.id && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                          </DropdownItem>
                        ))}
                      </div>
                    )}
                  </div> */}
                  
                  {/* Remove Category Option */}
                  {/* {currentCategory && (
                    <>
                      <DropdownSeparator />
                      <DropdownItem
                        onClick={() => onCategoryChange(null)}
                        className={cn(
                          "flex items-center space-x-2 p-2 text-error hover:bg-error/10 hover:text-error",
                          "transition-colors rounded-md",
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
                      </DropdownItem>
                    </>
                  )}
                   */}
                  {/* Loading State */}
                  {/* {isCategoryLoading && (
                    <div className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Updating category...
                        </span>
                      </div>
                    </div>
                  )}
                </DropdownContent>
              </Dropdown>    */} 
              
              {/* Bin/Restore Actions */}
              {newsletter && !newsletter.isArchived && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onArchive}
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
                  onClick={onUnarchive}
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

              {/* <Button
                variant="outline"
                size="sm"
                onClick={onCopyContent}
                className="h-8 w-8 p-0 hover:bg-accent border-border"
                title="Copy content"
              >
                <Copy className="h-3 w-3" />
              </Button> */}

              {/* <Button
                variant="outline"
                size="sm"
                onClick={onShowShortcuts}
                className="h-8 w-8 p-0 hover:bg-accent border-border"
                title="Keyboard shortcuts (?)"
              >
                <HelpCircle className="h-3 w-3" />
              </Button> */}
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
        onClick={showHeaderTemporarily}
      >
        <div className={cn("py-16", getReadingModeStyles())}>
          <article 
            className={cn(
              "prose prose-lg max-w-none",
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

      {/* Fullscreen Status Indicator */}
      {!showHeader && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-background/90 backdrop-blur-md border border-border rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-foreground font-medium">Fullscreen Mode</span>
              <span className="text-muted-foreground">Move mouse or press any key to show controls</span>
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