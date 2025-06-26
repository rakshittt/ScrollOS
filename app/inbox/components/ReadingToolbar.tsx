'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Star, 
  Archive, 
  Tag, 
  Maximize,
  Minimize,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger, DropdownSeparator } from '@/components/ui/Dropdown';
import { Newsletter } from '@/types';
import { cn } from '@/lib/utils';

// Toolbar Section Components
interface ToolbarSectionProps {
  children: React.ReactNode;
}

function ToolbarSection({ children }: ToolbarSectionProps) {
  return <div className="flex items-center space-x-2">{children}</div>;
}

function ToolbarDivider() {
  return <div className="w-px h-4 bg-border" />;
}

// Navigation Section
interface NavigationSectionProps {
  onPrevious?: () => void;
  onNext?: () => void;
}

export function NavigationSection({ onPrevious, onNext }: NavigationSectionProps) {
  return (
    <ToolbarSection>
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={!onPrevious}
        className="h-9 w-9 p-0 hover:bg-accent border-border"
        title="Previous (K)"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!onNext}
        className="h-9 w-9 p-0 hover:bg-accent border-border"
        title="Next (J)"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </ToolbarSection>
  );
}

// Reading Controls Section
interface ReadingControlsSectionProps {
  readingMode: 'focus' | 'distraction-free' | 'normal';
  onToggleReadingMode: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export function ReadingControlsSection({ 
  readingMode, 
  onToggleReadingMode, 
  fontSize, 
  onFontSizeChange 
}: ReadingControlsSectionProps) {
  return (
    <ToolbarSection>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleReadingMode}
        className="h-9 px-3 hover:bg-accent border-border"
        title={`Reading Mode (R) - ${readingMode}`}
      >
        {readingMode === 'focus' ? <Eye className="h-4 w-4" /> :
         readingMode === 'distraction-free' ? <EyeOff className="h-4 w-4" /> :
         <BookOpen className="h-4 w-4" />}
      </Button>
      
      {/* <div className="flex items-center space-x-1 bg-muted/50 rounded-lg px-2 py-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFontSizeChange(Math.max(fontSize - 1, 14))}
          className="h-7 w-7 p-0 hover:bg-accent"
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
          className="h-7 w-7 p-0 hover:bg-accent"
          title="Increase font size (+)"
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
      </div> */}
    </ToolbarSection>
  );
}

// Actions Section
interface ActionsSectionProps {
  newsletter: Newsletter | null;
  onToggleStar: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  isUnarchiving: boolean;
  categories: Array<{ id: number; name: string; color: string; icon?: string; isSystem: boolean }>;
  onCategoryChange: (categoryId: number | null) => void;
  isCategoryLoading: boolean;
}

export function ActionsSection({ 
  newsletter, 
  onToggleStar, 
  onArchive, 
  onUnarchive, 
  isUnarchiving,
  categories,
  onCategoryChange,
  isCategoryLoading
}: ActionsSectionProps) {
  if (!newsletter) return null;

  const currentCategory = categories.find(c => c.id === newsletter.categoryId);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'>('bottom-left');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return 'bottom-left';
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Dropdown dimensions (approximate)
    const dropdownWidth = 224; // w-56 = 14rem = 224px
    const dropdownHeight = 300; // Approximate max height
    
    // Check horizontal positioning
    const spaceOnRight = viewportWidth - buttonRect.right;
    const spaceOnLeft = buttonRect.left;
    
    // Check vertical positioning
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    
    // Determine horizontal alignment
    const horizontalAlign = spaceOnRight >= dropdownWidth ? 'left' : 'right';
    
    // Determine vertical alignment
    const verticalAlign = spaceBelow >= dropdownHeight ? 'bottom' : 'top';
    
    return `${verticalAlign}-${horizontalAlign}` as 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  };

  const handleCategoryButtonClick = () => {
    if (!isCategoryDropdownOpen) {
      const position = calculateDropdownPosition();
      setDropdownPosition(position);
    }
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    onCategoryChange(categoryId);
    setIsCategoryDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    if (isCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryDropdownOpen]);

  const getDropdownPositionClasses = () => {
    switch (dropdownPosition) {
      case 'bottom-left':
        return 'absolute top-full left-0 mt-2';
      case 'bottom-right':
        return 'absolute top-full right-0 mt-2';
      case 'top-left':
        return 'absolute bottom-full left-0 mb-2';
      case 'top-right':
        return 'absolute bottom-full right-0 mb-2';
      default:
        return 'absolute top-full left-0 mt-2';
    }
  };

  const renderCategoryDropdown = () => {
    if (!isCategoryDropdownOpen) return null;

    return (
      <div className={cn(
        "w-56 p-2 z-50 bg-background border border-border rounded-lg shadow-lg",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        getDropdownPositionClasses()
      )}>
        <div className="px-2 py-1.5">
          <h4 className="text-sm font-semibold text-foreground mb-2">
            {currentCategory ? 'Change Category' : 'Add Category'}
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            Organize your newsletter for better discovery
          </p>
        </div>
        
        <div className="h-px bg-border my-2" />
        
        {/* Current Category Display */}
        {currentCategory && (
          <div className="px-2 py-1.5">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Current Category
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-md bg-accent/50 border border-border">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: currentCategory.color }}
              />
              <span className="text-sm font-medium text-foreground">
                {currentCategory.name}
              </span>
            </div>
          </div>
        )}
        
        {/* Category List */}
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
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={cn(
                    "flex items-center space-x-3 p-2 rounded-md transition-colors cursor-pointer",
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
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Remove Category Option */}
        {currentCategory && (
          <>
            <div className="h-px bg-border my-2" />
            <div
              onClick={() => handleCategorySelect(null)}
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
            </div>
          </>
        )}
        
        {/* Loading State */}
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
      </div>
    );
  };

  return (
    <ToolbarSection>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleStar}
        className="h-9 w-9 p-0 hover:bg-accent border-border"
        title="Star newsletter (S)"
      >
        <Star className={cn(
          "h-4 w-4",
          newsletter.isStarred ? "fill-yellow-400 text-yellow-400" : ""
        )} />
      </Button>

      {/* Category Icon Button */}
      {/* <div className="relative">
        <Button
          ref={buttonRef}
          variant="outline"
          size="sm"
          onClick={handleCategoryButtonClick}
          className={cn(
            "h-9 w-9 p-0 hover:bg-accent border-border transition-all duration-200",
            currentCategory && "border-2",
            currentCategory && "border-primary/30",
            isCategoryLoading && "opacity-50 cursor-not-allowed",
            "relative bg-background", // Ensure proper positioning and background
            !currentCategory && "bg-muted/30" // Subtle background when no category
          )}
          disabled={isCategoryLoading}
          title={currentCategory ? `Category: ${currentCategory.name}` : "Add category"}
        >
          {currentCategory ? (
            <div
              className="w-4 h-4 rounded-full shadow-sm border border-white/20 flex-shrink-0"
              style={{ 
                backgroundColor: currentCategory.color,
                boxShadow: `0 0 0 1px ${currentCategory.color}40, 0 2px 4px rgba(0,0,0,0.1)`
              }}
            />
          ) : (
            <div className="relative">
              <Tag className="h-4 w-4 text-muted-foreground hover:text-foreground flex-shrink-0" /> */}
              {/* Small indicator dot */}
              {/* <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full opacity-60" />
            </div>
          )}
        </Button> */}
        
        {/* Dropdown Content */}
        {/* {renderCategoryDropdown()}
      </div> */}
      
      {/* Bin/Restore Actions */}
      {newsletter && !newsletter.isArchived && (
        <Button
          variant="outline"
          size="sm"
          onClick={onArchive}
          className="h-9 w-9 p-0 hover:bg-accent border-border"
          title="Move to Bin (E)"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      {newsletter && newsletter.isArchived && (
        <Button
          variant="outline"
          size="sm"
          onClick={onUnarchive}
          disabled={isUnarchiving}
          className="h-9 w-9 p-0 hover:bg-accent border-border"
          title="Restore from Bin"
        >
          {isUnarchiving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-success" />
          )}
        </Button>
      )}
    </ToolbarSection>
  );
}

// Fullscreen Section
interface FullscreenSectionProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function FullscreenSection({ isFullscreen, onToggleFullscreen }: FullscreenSectionProps) {
  return (
    <ToolbarSection>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleFullscreen}
        className="h-9 w-9 p-0 hover:bg-accent border-border"
        title="Toggle fullscreen (F)"
      >
        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </Button>
    </ToolbarSection>
  );
}

// Main Smart Toolbar Component
interface SmartToolbarProps {
  newsletter: Newsletter | null;
  categories: Array<{ id: number; name: string; color: string; icon?: string; isSystem: boolean }>;
  readingMode: 'focus' | 'distraction-free' | 'normal';
  fontSize: number;
  isFullscreen: boolean;
  isUnarchiving: boolean;
  isCategoryLoading: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onToggleReadingMode: () => void;
  onFontSizeChange: (size: number) => void;
  onToggleStar: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onCategoryChange: (categoryId: number | null) => void;
  onToggleFullscreen: () => void;
}

export function SmartToolbar({
  newsletter,
  categories,
  readingMode,
  fontSize,
  isFullscreen,
  isUnarchiving,
  isCategoryLoading,
  onPrevious,
  onNext,
  onToggleReadingMode,
  onFontSizeChange,
  onToggleStar,
  onArchive,
  onUnarchive,
  onCategoryChange,
  onToggleFullscreen
}: SmartToolbarProps) {
  return (
    <div className="flex items-center space-x-2">
      <NavigationSection onPrevious={onPrevious} onNext={onNext} />
      <ToolbarDivider />
      <ReadingControlsSection 
        readingMode={readingMode}
        onToggleReadingMode={onToggleReadingMode}
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
      />
      <ToolbarDivider />
      <ActionsSection 
        newsletter={newsletter}
        onToggleStar={onToggleStar}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        isUnarchiving={isUnarchiving}
        categories={categories}
        onCategoryChange={onCategoryChange}
        isCategoryLoading={isCategoryLoading}
      />
      <ToolbarDivider />
      <FullscreenSection 
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />
    </div>
  );
} 