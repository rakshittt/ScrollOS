'use client';

import { useState, useEffect } from 'react';
import { X, RefreshCw, Sparkles, AlertCircle, CheckCircle, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SyncNotificationBannerProps {
  status: 'idle' | 'syncing' | 'success' | 'error';
  message?: string;
  newNewsletterCount?: number;
  onDismiss?: () => void;
  onRetry?: () => void;
  onViewSettings?: () => void;
}

export function SyncNotificationBanner({
  status,
  message,
  newNewsletterCount = 0,
  onDismiss,
  onRetry,
  onViewSettings
}: SyncNotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (status === 'syncing' || status === 'success' || status === 'error') {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [status]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getBannerContent = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          title: 'Syncing newsletters...',
          description: 'Importing new newsletters from whitelisted emails.',
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          action: null
        };
      case 'success':
        return {
          icon: <Sparkles className="h-4 w-4 text-green-600" />,
          title: 'Sync completed!',
          description: newNewsletterCount > 0 
            ? `${newNewsletterCount} new newsletter${newNewsletterCount !== 1 ? 's' : ''} imported from whitelisted emails.`
            : 'All newsletters are up to date from whitelisted emails.',
          color: 'bg-green-50 border-green-200 text-green-800',
          action: newNewsletterCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              View New
            </Button>
          ) : null
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-600" />,
          title: 'Sync failed',
          description: message || 'There was an error importing newsletters from whitelisted emails.',
          color: 'bg-red-50 border-red-200 text-red-800',
          action: (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                Retry
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewSettings}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                Settings
              </Button>
            </div>
          )
        };
      default:
        return null;
    }
  };

  const content = getBannerContent();
  if (!content || !isVisible) return null;

  return (
    <div className={cn(
      "border-b px-4 py-3 transition-all duration-300 ease-in-out",
      content.color
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {content.icon}
          <div>
            <h3 className="text-sm font-medium">{content.title}</h3>
            <p className="text-xs opacity-90">{content.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {content.action}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
} 