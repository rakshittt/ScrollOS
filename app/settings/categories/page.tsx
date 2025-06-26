'use client';

import { useState, useEffect } from 'react';
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Palette,
  Save,
  X,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

const predefinedColors = [
  '#ff385c', '#ff6b35', '#f7931e', '#ffd23f', '#06d6a0',
  '#1b9aaa', '#ef476f', '#118ab2', '#073b4c', '#7209b7',
  '#3a0ca3', '#4361ee', '#4cc9f0', '#f72585', '#b5179e'
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#ff385c' });
  const [editingCategory, setEditingCategory] = useState({ name: '', color: '#ff385c' });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }

      const createdCategory = await response.json();
      setCategories(prev => [...prev, createdCategory]);
      setNewCategory({ name: '', color: '#ff385c' });
      setIsCreating(false);
      toast.success('Category created successfully');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editingCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      });

      if (!response.ok) throw new Error('Failed to update category');

      const updatedCategory = await response.json();
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
      setEditingId(null);
      setEditingCategory({ name: '', color: '#ff385c' });
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category');

      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingCategory({ name: category.name, color: category.color });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingCategory({ name: '', color: '#ff385c' });
  };

  const getContrastColor = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Categories</h1>
              <p className="text-muted-foreground">Organize newsletters with custom categories</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Create New Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create New Category</span>
            </CardTitle>
            <CardDescription>
              Add a new category to organize your newsletters
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isCreating ? (
              <Button onClick={() => setIsCreating(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category Name</label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter category name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Color</label>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer"
                        style={{ backgroundColor: newCategory.color }}
                        onClick={() => {
                          const colorPicker = document.createElement('input');
                          colorPicker.type = 'color';
                          colorPicker.value = newCategory.color;
                          colorPicker.onchange = (e) => {
                            setNewCategory(prev => ({ ...prev, color: (e.target as HTMLInputElement).value }));
                          };
                          colorPicker.click();
                        }}
                      />
                      <Input
                        value={newCategory.color}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Color Palette */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Quick Color Selection</label>
                  <div className="grid grid-cols-5 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          newCategory.color === color ? 'border-primary scale-110' : 'border-border hover:border-primary/50'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button onClick={handleCreateCategory} disabled={!newCategory.name.trim()}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Category
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsCreating(false);
                    setNewCategory({ name: '', color: '#ff385c' });
                  }}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Categories</CardTitle>
            <CardDescription>
              Manage your existing categories. System categories cannot be deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No categories yet. Create your first category to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {editingId === category.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                            className="w-32"
                          />
                          <div className="flex items-center space-x-1">
                            <div
                              className="w-6 h-6 rounded border cursor-pointer"
                              style={{ backgroundColor: editingCategory.color }}
                              onClick={() => {
                                const colorPicker = document.createElement('input');
                                colorPicker.type = 'color';
                                colorPicker.value = editingCategory.color;
                                colorPicker.onchange = (e) => {
                                  setEditingCategory(prev => ({ ...prev, color: (e.target as HTMLInputElement).value }));
                                };
                                colorPicker.click();
                              }}
                            />
                            <Input
                              value={editingCategory.color}
                              onChange={(e) => setEditingCategory(prev => ({ ...prev, color: e.target.value }))}
                              className="w-20"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="font-medium">{category.name}</span>
                      )}
                      {category.isSystem && (
                        <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                          System
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {editingId === category.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateCategory(category.id)}
                            disabled={!editingCategory.name.trim()}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(category)}
                            disabled={category.isSystem}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={category.isSystem}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Category Statistics</CardTitle>
            <CardDescription>
              Overview of how your categories are being used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-accent/20 rounded-lg">
                <div className="text-2xl font-bold text-primary">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Total Categories</div>
              </div>
              <div className="text-center p-4 bg-accent/20 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {categories.filter(c => !c.isSystem).length}
                </div>
                <div className="text-sm text-muted-foreground">Custom Categories</div>
              </div>
              <div className="text-center p-4 bg-accent/20 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {categories.filter(c => c.isSystem).length}
                </div>
                <div className="text-sm text-muted-foreground">System Categories</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 