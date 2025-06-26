'use client';

import { useState, useEffect } from 'react';
import { 
  Inbox, 
  Star, 
  Trash2,
  Folder, 
  Plus, 
  X,
  Hash,
  Settings,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn, formatDate, getContrastColor } from '../../lib/utils';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  color: string;
  isSystem: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect: (categoryId: number | null) => void;
  selectedCategoryId: number | null;
  onFolderSelect: (folder: string) => void;
  selectedFolder: string;
  onFolderCountsUpdate?: (counts: Record<string, number>) => void;
  selectedAccountId?: number | null;
}

const defaultFolders = [
  { id: 'inbox', name: 'Inbox', icon: Inbox, color: 'text-blue-600' },
  { id: 'starred', name: 'Starred', icon: Star, color: 'text-yellow-500' },
  { id: 'bin', name: 'Bin', icon: Trash2, color: 'text-red-500' },
];

const CATEGORY_COLORS = [
  '#ff385c', '#ffb400', '#00b894', '#0984e3', '#6c5ce7', '#fd79a8', '#00cec9', '#e17055', '#636e72', '#fab1a0', '#81ecec', '#a29bfe', '#ffeaa7', '#55efc4', '#fdcb6e', '#dfe6e9'
];

function getRandomCategoryColor() {
  return CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];
}

export function Sidebar({ 
  isOpen, 
  onClose, 
  onCategorySelect, 
  selectedCategoryId,
  onFolderSelect,
  selectedFolder,
  onFolderCountsUpdate,
  selectedAccountId
}: SidebarProps) {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({
    inbox: 0,
    starred: 0,
    bin: 0
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setError(null);
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchFolderCounts = async () => {
      try {
        let url = '/api/newsletters/stats';
        if (selectedAccountId) {
          url += `?emailAccountId=${selectedAccountId}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch folder counts');
        const data = await response.json();
        setFolderCounts(data);
      } catch (error) {
        console.error('Error fetching folder counts:', error);
      }
    };

    if (session) {
      fetchCategories();
      fetchFolderCounts();
    }
  }, [session, selectedAccountId]);

  const updateFolderCounts = (updates: Partial<Record<string, number>>) => {
    setFolderCounts(prev => {
      const newCounts = { ...prev };
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key in prev) {
          newCounts[key] = value;
        }
      });
      if (onFolderCountsUpdate) {
        onFolderCountsUpdate(newCounts);
      }
      return newCounts;
    });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const color = getRandomCategoryColor();
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim(), color }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create category');
      }
      const newCategory = await response.json();
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating category:', error);
      setError(error instanceof Error ? error.message : 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category');
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      if (selectedCategoryId === categoryId) {
        onCategorySelect(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <div className="flex items-center justify-between p-4 lg:hidden border-b border-border">
            <span className="font-semibold text-foreground">Navigation</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-6">
            {/* Default folders */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Folders
              </h3>
              <div className="space-y-1">
                {defaultFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => onFolderSelect(folder.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      selectedFolder === folder.id
                        ? "bg-primary-50 text-primary-600 border-r-2 border-primary-600 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-400"
                        : "text-foreground hover:bg-accent"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <folder.icon className={cn("h-4 w-4", folder.color)} />
                      <span>{folder.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {folderCounts[folder.id] || 0}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Categories
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {isCreating && (
                <div className="mb-3 p-2 bg-accent rounded-lg">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name"
                    className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2 bg-background text-foreground"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateCategory();
                      } else if (e.key === 'Escape') {
                        setIsCreating(false);
                        setNewCategoryName('');
                      }
                    }}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsCreating(false);
                        setNewCategoryName('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleCreateCategory}
                      disabled={!newCategoryName.trim()}
                    >
                      Create
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-500 text-sm mb-3">{error}</div>
              )}

              <div className="space-y-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500" />
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2 text-center">
                    No categories yet
                  </div>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className={cn(
                        "group flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-100",
                        selectedCategoryId === category.id ? "bg-primary-100 text-primary-700" : ""
                      )}
                      onClick={() => onCategorySelect(category.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ 
                            backgroundColor: category.color,
                            color: getContrastColor(category.color)
                          }}
                        >
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm">{category.name}</span>
                      </div>
                      {!category.isSystem && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="h-3 w-3 text-gray-500" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 space-y-2">
            <Link href="/settings" className="w-full">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Button>
            </Link>
            <Link href="/settings/help" className="w-full">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <HelpCircle className="h-4 w-4 mr-3" />
                Help & Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
