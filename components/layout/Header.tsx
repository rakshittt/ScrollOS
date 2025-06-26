'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Menu, Moon, Sun, Settings, RefreshCw, Loader2, X, Mail, LogOut, User, ChevronDown } from 'lucide-react';
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

  const handleSyncNow = async () => {
    try {
      setIsSyncing(true);
      console.log('🔄 Starting manual sync...');
      
      // Trigger sync for all connected accounts
      const response = await fetch('/api/email/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualSync: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync newsletters');
      }

      const result = await response.json();
      console.log('✅ Sync completed:', result);
      toast.success(`Sync completed! ${result.syncedCount || 0} new newsletters found.`);
      
      // Refresh the page to show new newsletters
      window.location.reload();
    } catch (error) {
      console.error('❌ Sync failed:', error);
      toast.error('Failed to sync newsletters. Please try again.');
    } finally {
      setIsSyncing(false);
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
            <span className="font-semibold text-foreground hidden sm:block">
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
          {/* Sync Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSyncNow}
            disabled={isSyncing}
            title="Sync newsletters"
            className="relative"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          
          {/* Dark Mode Toggle */}
          <Button variant="ghost" size="sm" onClick={toggleDarkMode} title="Toggle dark mode">
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          {/* Avatar with Radix DropdownMenu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="sm" className="p-0 rounded-full w-8 h-8 overflow-hidden border border-border">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-8 h-8 flex items-center justify-center bg-muted rounded-full text-xs font-bold text-muted-foreground">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-[200px] rounded-lg border bg-background p-1 shadow-lg animate-in fade-in-80"
            >
              <div className="px-4 py-3 border-b border-border">
                <div className="font-semibold text-sm truncate">{session?.user?.name || 'User'}</div>
                <div className="text-xs text-muted-foreground truncate">{session?.user?.email}</div>
              </div>
              <DropdownMenu.Item asChild>
                <a
                  href="/settings/account"
                  className="flex items-center px-4 py-2 text-sm hover:bg-accent transition-colors rounded"
                >
                  <User className="h-4 w-4 mr-2" /> Account Settings
                </a>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item asChild>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="flex items-center w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors font-semibold rounded"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Log out
                </button>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* Settings Button */}
          {/* <Link href="/settings">
            <Button variant="ghost" size="sm" title="Settings">
            <Settings className="h-4 w-4" />
          </Button>
          </Link> */}
        </div>
      </div>
    </header>
  );
}
