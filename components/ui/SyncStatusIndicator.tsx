'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncStatusIndicatorProps {
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncTime?: string | null;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SyncStatusIndicator({ 
  status, 
  lastSyncTime, 
  className,
  showText = false,
  size = 'md'
}: SyncStatusIndicatorProps) {
  const getIcon = () => {
    switch (status) {
      case 'syncing':
        return <RefreshCw className={cn("animate-spin", size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-5 w-5" : "h-4 w-4")} />;
      case 'success':
        return <Sparkles className={cn("text-green-500", size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-5 w-5" : "h-4 w-4")} />;
      case 'error':
        return <AlertCircle className={cn("text-red-500", size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-5 w-5" : "h-4 w-4")} />;
      default:
        return <RefreshCw className={cn(size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-5 w-5" : "h-4 w-4")} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return 'Sync failed';
      default:
        return lastSyncTime ? `Last sync: ${lastSyncTime}` : 'Ready to sync';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'syncing':
        return 'text-blue-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="relative">
        {getIcon()}
        {status === 'idle' && lastSyncTime && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        )}
      </div>
      {showText && (
        <span className={cn("text-xs font-medium", getStatusColor())}>
          {getStatusText()}
        </span>
      )}
    </div>
  );
} 