'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  onCategorySelect: (categoryId: number | null) => void;
  selectedCategoryId: number | null;
  onFolderSelect: (folder: string) => void;
  selectedFolder: string;
  onFolderCountsUpdate: (counts: Record<string, number>) => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
  accounts?: any[];
  selectedAccountId?: number | null;
  onAccountChange?: (id: number | null) => void;
}

export function AppLayout({ 
  children, 
  onCategorySelect, 
  selectedCategoryId,
  onFolderSelect,
  selectedFolder,
  onFolderCountsUpdate,
  onSearchChange,
  searchQuery = '',
  accounts = [],
  selectedAccountId,
  onAccountChange
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onCategorySelect={onCategorySelect}
        selectedCategoryId={selectedCategoryId}
        onFolderSelect={onFolderSelect}
        selectedFolder={selectedFolder}
        onFolderCountsUpdate={onFolderCountsUpdate}
        selectedAccountId={selectedAccountId}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          onSearchChange={onSearchChange}
          searchQuery={searchQuery}
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onAccountChange={onAccountChange}
        />
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
