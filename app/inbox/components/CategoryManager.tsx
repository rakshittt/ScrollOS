'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, getContrastColor } from '@/lib/utils';

interface Category {
  id: number;
  name: string;
  color: string;
  isSystem: boolean;
}

interface CategoryManagerProps {
  onCategorySelect: (categoryId: number | null) => void;
  selectedCategoryId: number | null;
}

const CATEGORY_COLORS = [
  '#ff385c', '#ffb400', '#00b894', '#0984e3', '#6c5ce7', '#fd79a8', '#00cec9', '#e17055', '#636e72', '#fab1a0', '#81ecec', '#a29bfe', '#ffeaa7', '#55efc4', '#fdcb6e', '#dfe6e9'
];

function getRandomCategoryColor() {
  return CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];
}

export function CategoryManager({ onCategorySelect, selectedCategoryId }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setIsLoading(true);
      const color = getRandomCategoryColor();
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim(), color }),
      });
      if (!response.ok) throw new Error('Failed to create category');
      const newCategory = await response.json();
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setIsCreating(false);
      toast.success('Category created successfully');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category');
      
      setCategories(categories.filter(c => c.id !== categoryId));
      if (selectedCategoryId === categoryId) {
        onCategorySelect(null);
      }
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Categories</h3>
        {!isCreating && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="space-y-2">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            className="h-8"
            disabled={isLoading}
          />
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateCategory}
              disabled={isLoading || !newCategoryName.trim()}
              className="h-8"
            >
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCreating(false);
                setNewCategoryName('');
              }}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-2 hover:bg-accent rounded cursor-pointer"
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
              <span className="text-sm text-foreground">{category.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 