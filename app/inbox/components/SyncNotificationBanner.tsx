'use client';

import { useState, useEffect } from 'react';
import { X, RefreshCw, Sparkles, AlertCircle, CheckCircle, Mail, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SyncResult {
  email: string;
  newslettersFound: number;
  status: 'success' | 'error' | 'skipped';
  error?: string;
}

interface SyncNotificationBannerProps {
  status: 'idle' | 'syncing' | 'success' | 'error';
  message?: string;
  newNewsletterCount?: number;
  syncResults?: SyncResult[];
  totalEmailsProcessed?: number;
  onDismiss?: () => void;
  onRetry?: () => void;
  onViewSettings?: () => void;
}

export function SyncNotificationBanner({
  status,
  message,
  newNewsletterCount = 0,
  syncResults = [],
  totalEmailsProcessed = 0,
  onDismiss,
  onRetry,
  onViewSettings
}: SyncNotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Show banner when there's a status other than idle
    if (status === 'syncing' || status === 'success' || status === 'error') {
      setIsVisible(true);
    }
    // Note: We don't automatically hide the banner anymore
    // It will only be hidden when the user manually dismisses it
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
        const successEmails = syncResults.filter(r => r.status === 'success');
        const errorEmails = syncResults.filter(r => r.status === 'error');
        const skippedEmails = syncResults.filter(r => r.status === 'skipped');
        
        return {
          icon: <Sparkles className="h-4 w-4 text-green-600" />,
          title: 'Sync completed!',
          description: newNewsletterCount > 0 
            ? `${newNewsletterCount} new newsletter${newNewsletterCount !== 1 ? 's' : ''} imported from ${successEmails.length} email${successEmails.length !== 1 ? 's' : ''}.`
            : `All newsletters are up to date. Processed ${totalEmailsProcessed} email${totalEmailsProcessed !== 1 ? 's' : ''}.`,
          color: 'bg-green-50 border-green-200 text-green-800',
          action: (
            <div className="flex items-center space-x-2">
              {syncResults.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  Details
                </Button>
              )}
              {newNewsletterCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  View New
                </Button>
              )}
            </div>
          )
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-600" />,
          title: 'Sync failed',
          description: message || 'There was an error importing newsletters from whitelisted emails.',
          color: 'bg-red-50 border-red-200 text-red-800',
          action: (
            <div className="flex items-center space-x-2">
              {syncResults.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  Details
                </Button>
              )}
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

  const successEmails = syncResults.filter(r => r.status === 'success');
  const errorEmails = syncResults.filter(r => r.status === 'error');
  const skippedEmails = syncResults.filter(r => r.status === 'skipped');

  return (
    <div className={cn(
      "border-b transition-all duration-300 ease-in-out",
      content.color
    )}>
      {/* Main Banner */}
      <div className="px-4 py-3">
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
              title="Dismiss"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Compact Results Summary - Always visible when there are results */}
      {syncResults.length > 0 && !showDetails && (
        <div className="px-4 pb-3 border-t border-current/20">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              {successEmails.length > 0 && (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>{successEmails.length} successful</span>
                </div>
              )}
              {errorEmails.length > 0 && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  <span>{errorEmails.length} failed</span>
                </div>
              )}
              {skippedEmails.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Mail className="h-3 w-3 text-gray-600" />
                  <span>{skippedEmails.length} skipped</span>
                </div>
              )}
            </div>
            <span className="text-xs opacity-70">
              Total: {totalEmailsProcessed} emails processed
            </span>
          </div>
        </div>
      )}

      {/* Detailed Results */}
      {showDetails && syncResults.length > 0 && (
        <div className="px-4 pb-3 border-t border-current/20">
          <div className="space-y-3">
            {/* Summary Stats */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-4">
                {successEmails.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>{successEmails.length} successful</span>
                  </div>
                )}
                {errorEmails.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3 text-red-600" />
                    <span>{errorEmails.length} failed</span>
                  </div>
                )}
                {skippedEmails.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3 text-gray-600" />
                    <span>{skippedEmails.length} skipped</span>
                  </div>
                )}
              </div>
              <span className="text-xs opacity-70">
                Total: {totalEmailsProcessed} emails processed
              </span>
            </div>

            {/* Email Details */}
            <div className="max-h-32 overflow-y-auto space-y-1">
              {syncResults.map((result, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-2 rounded text-xs",
                    result.status === 'success' && "bg-green-100/50",
                    result.status === 'error' && "bg-red-100/50",
                    result.status === 'skipped' && "bg-gray-100/50"
                  )}
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    {result.status === 'success' && <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />}
                    {result.status === 'error' && <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0" />}
                    {result.status === 'skipped' && <Mail className="h-3 w-3 text-gray-600 flex-shrink-0" />}
                    <span className="truncate font-medium">{result.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    {result.status === 'success' && (
                      <span className="text-green-700">
                        {result.newslettersFound} newsletter{result.newslettersFound !== 1 ? 's' : ''}
                      </span>
                    )}
                    {result.status === 'error' && (
                      <span className="text-red-700 truncate max-w-32" title={result.error}>
                        {result.error || 'Failed'}
                      </span>
                    )}
                    {result.status === 'skipped' && (
                      <span className="text-gray-600">No newsletters</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 