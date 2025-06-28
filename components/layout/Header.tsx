'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Menu, Moon, Sun, Settings, RefreshCw, Loader2, X, Mail, LogOut, User, ChevronDown, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
  accounts?: any[];
  selectedAccountId?: number | null;
  onAccountChange?: (id: number | null) => void;
}

export function Header({ onMenuClick, onSearchChange, searchQuery = '', accounts = [], selectedAccountId, onAccountChange }: HeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [newNewsletterCount, setNewNewsletterCount] = useState<number>(0);
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onSearchChange?.(query);
  };

  const handleClearSearch = () => {
    onSearchChange?.('');
  };

  // Keyboard shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for sync events from header
  useEffect(() => {
    const handleSyncEvent = (event: CustomEvent) => {
      const { status, message, count } = event.detail;
      setSyncStatus(status);
      setSyncMessage(message || '');
      setNewNewsletterCount(count || 0);
      
      if (status === 'success' && message) {
        toast.success(message);
      } else if (status === 'error' && message) {
        toast.error(message);
      }
    };

    window.addEventListener('sync-status-update', handleSyncEvent as EventListener);
    return () => {
      window.removeEventListener('sync-status-update', handleSyncEvent as EventListener);
    };
  }, [toast]);

  // Listen for sync triggers from other components
  useEffect(() => {
    const handleTriggerSync = () => {
      handleQuickSync();
    };

    window.addEventListener('trigger-sync', handleTriggerSync);
    return () => {
      window.removeEventListener('trigger-sync', handleTriggerSync);
    };
  }, []);

  const handleQuickSync = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus('syncing');
      console.log('🔄 Starting quick sync...');
      
      // Dispatch sync start event
      window.dispatchEvent(new CustomEvent('sync-status-update', {
        detail: { status: 'syncing', message: 'Syncing newsletters...' }
      }));
      
      // Determine which account(s) to sync
      const syncAccountId = selectedAccountId; // null means all accounts, specific ID means that account only
      
      // Trigger sync for selected account(s)
      const response = await fetch('/api/email/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          manualSync: true,
          accountId: syncAccountId // Pass the selected account ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync newsletters');
      }

      const result = await response.json();
      console.log('✅ Quick sync completed:', result);
      setSyncStatus('success');
      setLastSyncTime(new Date().toLocaleTimeString());
      
      const accountName = syncAccountId 
        ? accounts.find(a => a.id === syncAccountId)?.email || 'selected account'
        : 'all accounts';
      
      const successMessage = `Quick sync completed for ${accountName}! ${result.syncedCount || 0} new newsletters imported from whitelisted emails.`;
      toast.success(successMessage);
      
      // Dispatch sync success event
      window.dispatchEvent(new CustomEvent('sync-status-update', {
        detail: { 
          status: 'success', 
          message: successMessage,
          count: result.syncedCount || 0
        }
      }));
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle');
        window.dispatchEvent(new CustomEvent('sync-status-update', {
          detail: { status: 'idle' }
        }));
      }, 3000);
      
      // Refresh the page to show new newsletters
      window.location.reload();
    } catch (error) {
      console.error('❌ Quick sync failed:', error);
      setSyncStatus('error');
      const errorMessage = 'Failed to sync newsletters. Please try again.';
      toast.error(errorMessage);
      
      // Dispatch sync error event
      window.dispatchEvent(new CustomEvent('sync-status-update', {
        detail: { status: 'error', message: errorMessage }
      }));
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle');
        window.dispatchEvent(new CustomEvent('sync-status-update', {
          detail: { status: 'idle' }
        }));
      }, 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDomainWhitelistSync = () => {
    // Navigate to email settings where the domain whitelist modal is available
    window.location.href = '/settings/email';
  };

  const getSyncButtonContent = () => {
    switch (syncStatus) {
      case 'syncing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <Sparkles className="h-4 w-4 text-green-500" />;
      case 'error':
        return <RefreshCw className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const getSyncButtonTitle = () => {
    const accountName = selectedAccountId 
      ? accounts.find(a => a.id === selectedAccountId)?.email || 'selected account'
      : 'all accounts';
      
    switch (syncStatus) {
      case 'syncing':
        return `Syncing ${accountName}...`;
      case 'success':
        return 'Sync completed successfully';
      case 'error':
        return 'Sync failed - click to try again';
      default:
        return lastSyncTime ? `Last synced: ${lastSyncTime}` : `Sync ${accountName}`;
    }
  };

  return (
    <header className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-medium text-foreground hidden sm:block">
              News360
            </span>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-lg mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search newsletters... (Press / to focus)"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 w-full"
              ref={searchInputRef}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent"
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Email Account Filter Dropdown */}
          {accounts.length > 0 && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 px-2 py-1 text-xs border rounded min-w-[120px] bg-background hover:bg-accent focus:ring-2 focus:ring-primary/30"
                  title="Filter by account"
                >
                  <Mail className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="truncate">
                    {selectedAccountId == null
                      ? 'All Accounts'
                      : accounts.find(a => a.id === selectedAccountId)?.email || 'Account'}
                  </span>
                  <ChevronDown className="h-3 w-3 ml-1 text-muted-foreground" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" className="w-48 p-1 z-50 rounded-lg border bg-background shadow-lg">
                <DropdownMenu.Item
                  onSelect={() => onAccountChange?.(null)}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-md text-xs cursor-pointer',
                    selectedAccountId == null ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  All Accounts
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                {accounts.map(account => (
                  <DropdownMenu.Item
                    key={account.id}
                    onSelect={() => onAccountChange?.(account.id)}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-md text-xs cursor-pointer',
                      selectedAccountId === account.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="truncate">{account.email}</span>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          )}

          {/* Enhanced Sync Button with Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={isSyncing}
                title={getSyncButtonTitle()}
                className={cn(
                  "relative transition-all duration-200",
                  syncStatus === 'success' && "text-green-600 hover:text-green-700",
                  syncStatus === 'error' && "text-red-600 hover:text-red-700"
                )}
              >
                {getSyncButtonContent()}
                {lastSyncTime && syncStatus === 'idle' && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" className="w-56 p-2 z-50 rounded-lg border bg-background shadow-lg">
              <div className="px-2 py-1.5">
                <h4 className="text-sm font-medium text-foreground mb-1">Sync Options</h4>
                <p className="text-xs text-muted-foreground">
                  {lastSyncTime ? `Last synced: ${lastSyncTime}` : 'No recent sync'}
                </p>
              </div>
              
              <DropdownMenu.Separator className="my-2 h-px bg-border" />
              
              <DropdownMenu.Item
                onSelect={handleQuickSync}
                disabled={isSyncing}
                className={cn(
                  "flex items-center space-x-3 p-2 rounded-md transition-colors cursor-pointer",
                  "hover:bg-accent hover:text-foreground",
                  isSyncing && "opacity-50 pointer-events-none"
                )}
              >
                <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                <div className="flex-1">
                  <span className="text-sm font-normal">
                    Quick Sync {selectedAccountId 
                      ? accounts.find(a => a.id === selectedAccountId)?.email?.split('@')[0] || 'Account'
                      : 'All Accounts'
                    }
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Import new newsletters from whitelisted emails
                  </p>
                </div>
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onSelect={handleDomainWhitelistSync}
                className="flex items-center space-x-3 p-2 rounded-md transition-colors cursor-pointer hover:bg-accent hover:text-foreground"
              >
                <ShieldCheck className="h-4 w-4" />
                <div className="flex-1">
                  <span className="text-sm font-normal">Domain Whitelist</span>
                  <p className="text-xs text-muted-foreground">Manage newsletter domains</p>
                </div>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-2 h-px bg-border" />

              <DropdownMenu.Item
                onSelect={() => window.location.href = '/settings/email'}
                className="flex items-center space-x-3 p-2 rounded-md transition-colors cursor-pointer hover:bg-accent hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                <div className="flex-1">
                  <span className="text-sm font-normal">Sync Settings</span>
                  <p className="text-xs text-muted-foreground">Configure email accounts</p>
                </div>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            title="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          {/* User Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:block">{session?.user?.name}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" className="w-48 p-1 z-50 rounded-lg border bg-background shadow-lg">
              <DropdownMenu.Item
                onSelect={() => window.location.href = '/settings/account'}
                className="flex items-center px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-accent hover:text-foreground"
              >
                <User className="h-4 w-4 mr-2" />
                Account Settings
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => window.location.href = '/settings'}
                className="flex items-center px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-accent hover:text-foreground"
                >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item
                onSelect={() => signOut()}
                className="flex items-center px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-accent hover:text-foreground text-red-600"
                >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}
