'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@iconify/react';
import {
    AlertTriangle,
    HelpCircle,
    Inbox,
    Plus,
    Settings,
    Star,
    Trash2,
    X
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

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

// Category icon mapping and fallback pool
const CATEGORY_ICON_MAP: Record<string, string> = {
  work: 'mdi:briefcase',
  personal: 'mdi:account',
  news: 'mdi:newspaper',
  reading: 'mdi:book-open-page-variant',
  social: 'mdi:email',
  shopping: 'mdi:cart',
  music: 'mdi:music',
  movies: 'mdi:movie',
  entertainment: 'mdi:television',
  finance: 'mdi:currency-usd',
  important: 'mdi:star',
  favorites: 'mdi:heart',
  calendar: 'mdi:calendar',
  travel: 'mdi:airplane',
  health: 'mdi:heart-pulse',
  food: 'mdi:silverware-fork-knife',
  sports: 'mdi:soccer',
  tech: 'mdi:laptop',
  education: 'mdi:school',
  family: 'mdi:account-group',
  workspaces: 'mdi:office-building',
  updates: 'mdi:bell',
  offers: 'mdi:tag',
  bills: 'mdi:receipt',
  events: 'mdi:calendar-star',
  travelog: 'mdi:map-marker',
  inspiration: 'mdi:lightbulb',
  alerts: 'mdi:alert',
  misc: 'mdi:shape',
  receipts: 'mdi:receipt-text',
  invoices: 'mdi:file-document-outline',
  newsletter: 'mdi:email-newsletter',
  notifications: 'mdi:bell-ring',
  reminders: 'mdi:alarm',
  meetings: 'mdi:calendar-clock',
  tickets: 'mdi:ticket',
  transport: 'mdi:bus',
  learning: 'mdi:book',
  science: 'mdi:flask',
  art: 'mdi:palette',
  design: 'mdi:vector-square',
  photography: 'mdi:camera',
  code: 'mdi:code-tags',
  dev: 'mdi:code-braces',
  bug: 'mdi:bug',
  security: 'mdi:shield-lock',
  privacy: 'mdi:lock',
  cloud: 'mdi:cloud',
  weather: 'mdi:weather-partly-cloudy',
  home: 'mdi:home',
  pets: 'mdi:paw',
  kids: 'mdi:baby-face-outline',
  parents: 'mdi:account-child',
  friends: 'mdi:account-multiple',
  community: 'mdi:account-group',
  charity: 'mdi:hand-heart',
  donation: 'mdi:hand-coin',
  volunteer: 'mdi:handshake',
  jobs: 'mdi:briefcase-search',
  career: 'mdi:briefcase-variant',
  investments: 'mdi:chart-line',
  stocks: 'mdi:finance',
  crypto: 'mdi:currency-btc',
  bank: 'mdi:bank',
  insurance: 'mdi:shield-check',
  medical: 'mdi:medical-bag',
  doctor: 'mdi:stethoscope',
  pharmacy: 'mdi:pill',
  fitness: 'mdi:run',
  exercise: 'mdi:dumbbell',
  yoga: 'mdi:meditation',
  mindfulness: 'mdi:head-cog',
  hotel: 'mdi:hotel',
  booking: 'mdi:calendar-check',
  flight: 'mdi:airplane-takeoff',
  train: 'mdi:train',
  car: 'mdi:car',
  bike: 'mdi:bike',
  drink: 'mdi:glass-cocktail',
  restaurant: 'mdi:silverware-fork-knife',
  cafe: 'mdi:coffee',
  groceries: 'mdi:cart',
  gifts: 'mdi:gift',
  birthday: 'mdi:cake-variant',
  anniversary: 'mdi:calendar-heart',
  wedding: 'mdi:heart',
  baby: 'mdi:baby-bottle-outline',
  party: 'mdi:party-popper',
  celebration: 'mdi:party-popper',
  holiday: 'mdi:beach',
  vacation: 'mdi:beach',
  adventure: 'mdi:compass',
  outdoors: 'mdi:pine-tree',
  garden: 'mdi:flower',
  nature: 'mdi:leaf',
  environment: 'mdi:earth',
  sustainability: 'mdi:recycle',
  investment: 'mdi:chart-bar',
  savings: 'mdi:piggy-bank',
  expense: 'mdi:cash-minus',
  income: 'mdi:cash-plus',
  rent: 'mdi:home-city',
  mortgage: 'mdi:home-currency-usd',
  utilities: 'mdi:flash',
  electricity: 'mdi:flash',
  water: 'mdi:water',
  gas: 'mdi:gas-cylinder',
  phone: 'mdi:phone',
  internet: 'mdi:wifi',
  tv: 'mdi:television',
  subscription: 'mdi:credit-card',
  streaming: 'mdi:play-box-multiple',
  gaming: 'mdi:controller-classic',
  books: 'mdi:book-open-page-variant',
  comics: 'mdi:book-open-variant',
  magazine: 'mdi:book-open-variant',
  podcast: 'mdi:podcast',
  video: 'mdi:video',
  youtube: 'mdi:youtube',
  facebook: 'mdi:facebook',
  twitter: 'mdi:twitter',
  instagram: 'mdi:instagram',
  linkedin: 'mdi:linkedin',
  github: 'mdi:github',
  slack: 'mdi:slack',
  discord: 'mdi:discord',
  forum: 'mdi:forum',
  blog: 'mdi:blogger',
  math: 'mdi:math-compass',
  language: 'mdi:alphabetical',
};

const CATEGORY_FALLBACK_ICONS = [
  'mdi:folder',
  'mdi:tag',
  'mdi:star-outline',
  'mdi:bookmark-outline',
  'mdi:label-outline',
  'mdi:shape-outline',
  'mdi:cloud-outline',
  'mdi:compass-outline',
  'mdi:lightbulb-outline',
  'mdi:email-outline',
];

function getCategoryIconName(name: string, id: number) {
  const key = name.trim().toLowerCase();
  if (CATEGORY_ICON_MAP[key]) return CATEGORY_ICON_MAP[key];
  // Use id to pick a fallback icon for stable assignment
  return CATEGORY_FALLBACK_ICONS[id % CATEGORY_FALLBACK_ICONS.length];
}

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
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    category: Category | null;
    newsletterCount: number;
  }>({
    show: false,
    category: null,
    newsletterCount: 0
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
      // First, check if the category has newsletters
      const response = await fetch(`/api/newsletters?categoryId=${categoryId}&limit=1`);
      if (!response.ok) throw new Error('Failed to check category newsletters');
      const data = await response.json();
      const hasNewsletters = data.newsletters && data.newsletters.length > 0;
      
      if (hasNewsletters) {
        // Get the full count for confirmation
        const countResponse = await fetch(`/api/newsletters?categoryId=${categoryId}`);
        if (!countResponse.ok) throw new Error('Failed to get newsletter count');
        const countData = await countResponse.json();
        const newsletterCount = countData.newsletters ? countData.newsletters.length : 0;
        
        // Show confirmation dialog
        const category = categories.find(c => c.id === categoryId);
        setDeleteConfirmation({
          show: true,
          category: category ?? null,
          newsletterCount
        });
        return;
      }
      
      // If no newsletters, delete directly
      await performCategoryDeletion(categoryId);
    } catch (error) {
      console.error('Error checking category newsletters:', error);
      setError('Failed to check category newsletters');
    }
  };

  const performCategoryDeletion = async (categoryId: number) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category');
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      if (selectedCategoryId === categoryId) {
        onCategorySelect(null);
      }
      setDeleteConfirmation({ show: false, category: null, newsletterCount: 0 });
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    }
  };

  const confirmDeleteCategory = () => {
    if (deleteConfirmation.category) {
      performCategoryDeletion(deleteConfirmation.category.id);
    }
  };

  const cancelDeleteCategory = () => {
    setDeleteConfirmation({ show: false, category: null, newsletterCount: 0 });
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
                        <Icon icon={getCategoryIconName(category.name, category.id)}
                          className="w-5 h-5"
                          color={category.color}
                        />
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

      {/* Delete Confirmation Popup */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={cancelDeleteCategory}
          />
          
          {/* Popup */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Delete Category
                </h3>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: deleteConfirmation.category?.color }}
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {deleteConfirmation.category?.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Contains <span className="font-semibold text-gray-900 dark:text-gray-100">{deleteConfirmation.newsletterCount}</span> newsletter{deleteConfirmation.newsletterCount !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-1">
                        What happens to the newsletters?
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                        They'll remain in your inbox but will no longer be categorized. You can reassign them to other categories later.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={cancelDeleteCategory}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  className="flex-1 px-4 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Delete Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
