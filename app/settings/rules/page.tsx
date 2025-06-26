'use client';

import { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  Save,
  X,
  Check,
  Filter,
  Tag,
  Star,
  Folder
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface NewsletterRule {
  id: number;
  name: string;
  condition: {
    type: 'sender' | 'subject' | 'content';
    value: string;
  };
  action: {
    type: 'category' | 'priority' | 'folder';
    value: string | number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

export default function RulesPage() {
  const [rules, setRules] = useState<NewsletterRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newRule, setNewRule] = useState<Partial<NewsletterRule>>({
    name: '',
    condition: { type: 'sender', value: '' },
    action: { type: 'category', value: '' },
    isActive: true
  });
  const [editingRule, setEditingRule] = useState<Partial<NewsletterRule>>({
    name: '',
    condition: { type: 'sender', value: '' },
    action: { type: 'category', value: '' },
    isActive: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRules();
    fetchCategories();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/newsletters/categorize');
      if (!response.ok) throw new Error('Failed to fetch rules');
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Failed to load rules');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateRule = async () => {
    if (!newRule.name?.trim() || !newRule.condition?.value?.trim() || !newRule.action?.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/newsletters/categorize', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule),
      });

      if (!response.ok) throw new Error('Failed to create rule');

      await fetchRules();
      setNewRule({
        name: '',
        condition: { type: 'sender', value: '' },
        action: { type: 'category', value: '' },
        isActive: true
      });
      setIsCreating(false);
      toast.success('Rule created successfully');
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error('Failed to create rule');
    }
  };

  const handleUpdateRule = async (id: number) => {
    if (!editingRule.name?.trim() || !editingRule.condition?.value?.trim() || !editingRule.action?.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`/api/newsletters/categorize/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRule),
      });

      if (!response.ok) throw new Error('Failed to update rule');

      await fetchRules();
      setEditingId(null);
      setEditingRule({
        name: '',
        condition: { type: 'sender', value: '' },
        action: { type: 'category', value: '' },
        isActive: true
      });
      toast.success('Rule updated successfully');
    } catch (error) {
      console.error('Error updating rule:', error);
      toast.error('Failed to update rule');
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('Are you sure you want to delete this rule? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/newsletters/categorize/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete rule');

      await fetchRules();
      toast.success('Rule deleted successfully');
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  const handleToggleRule = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/newsletters/categorize/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) throw new Error('Failed to update rule');

      await fetchRules();
      toast.success(`Rule ${isActive ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating rule:', error);
      toast.error('Failed to update rule');
    }
  };

  const startEditing = (rule: NewsletterRule) => {
    setEditingId(rule.id);
    setEditingRule({
      name: rule.name,
      condition: rule.condition,
      action: rule.action,
      isActive: rule.isActive
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingRule({
      name: '',
      condition: { type: 'sender', value: '' },
      action: { type: 'category', value: '' },
      isActive: true
    });
  };

  const getConditionIcon = (type: string) => {
    switch (type) {
      case 'sender': return <Filter className="h-4 w-4" />;
      case 'subject': return <Tag className="h-4 w-4" />;
      case 'content': return <Zap className="h-4 w-4" />;
      default: return <Filter className="h-4 w-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'category': return <Tag className="h-4 w-4" />;
      case 'priority': return <Star className="h-4 w-4" />;
      case 'folder': return <Folder className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
    }
  };

  const getActionValueLabel = (action: any) => {
    if (action.type === 'category') {
      const category = categories.find(c => c.id === action.value);
      return category ? category.name : 'Unknown Category';
    }
    return action.value;
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
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Automation Rules</h1>
              <p className="text-muted-foreground">Set up rules to automatically organize newsletters</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Create New Rule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create New Rule</span>
            </CardTitle>
            <CardDescription>
              Create automation rules to automatically categorize and organize newsletters
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isCreating ? (
              <Button onClick={() => setIsCreating(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rule Name</label>
                    <Input
                      value={newRule.name}
                      onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Tech newsletters to Tech category"
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Active</label>
                    <Switch
                      checked={newRule.isActive}
                      onChange={(e) => setNewRule(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Condition</label>
                    <div className="space-y-2">
                      <select
                        value={newRule.condition?.type}
                        onChange={(e) => setNewRule(prev => ({
                          ...prev,
                          condition: { ...prev.condition!, type: e.target.value as any }
                        }))}
                        className="w-full p-2 border border-border rounded-md"
                      >
                        <option value="sender">Sender Email</option>
                        <option value="subject">Subject Contains</option>
                        <option value="content">Content Contains</option>
                      </select>
                      <Input
                        value={newRule.condition?.value}
                        onChange={(e) => setNewRule(prev => ({
                          ...prev,
                          condition: { ...prev.condition!, value: e.target.value }
                        }))}
                        placeholder="Enter condition value"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Action</label>
                    <div className="space-y-2">
                      <select
                        value={newRule.action?.type}
                        onChange={(e) => setNewRule(prev => ({
                          ...prev,
                          action: { ...prev.action!, type: e.target.value as any, value: '' }
                        }))}
                        className="w-full p-2 border border-border rounded-md"
                      >
                        <option value="category">Set Category</option>
                        <option value="priority">Set Priority</option>
                        <option value="folder">Move to Folder</option>
                      </select>
                      {newRule.action?.type === 'category' ? (
                        <select
                          value={newRule.action.value}
                          onChange={(e) => setNewRule(prev => ({
                            ...prev,
                            action: { ...prev.action!, value: parseInt(e.target.value) }
                          }))}
                          className="w-full p-2 border border-border rounded-md"
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          value={newRule.action?.value}
                          onChange={(e) => setNewRule(prev => ({
                            ...prev,
                            action: { ...prev.action!, value: e.target.value }
                          }))}
                          placeholder="Enter action value"
                          className="w-full"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button onClick={handleCreateRule} disabled={!newRule.name?.trim() || !newRule.condition?.value?.trim() || !newRule.action?.value}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsCreating(false);
                    setNewRule({
                      name: '',
                      condition: { type: 'sender', value: '' },
                      action: { type: 'category', value: '' },
                      isActive: true
                    });
                  }}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rules List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Rules</CardTitle>
            <CardDescription>
              Manage your automation rules. Active rules will be applied to new newsletters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No rules yet. Create your first automation rule to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      rule.isActive ? 'border-primary/20 bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">{rule.name}</h3>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            rule.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            {getConditionIcon(rule.condition.type)}
                            <span>
                              {rule.condition.type === 'sender' && 'Sender email'}
                              {rule.condition.type === 'subject' && 'Subject contains'}
                              {rule.condition.type === 'content' && 'Content contains'}
                            </span>
                            <span className="font-medium text-foreground">"{rule.condition.value}"</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getActionIcon(rule.action.type)}
                            <span>
                              {rule.action.type === 'category' && 'Set category to'}
                              {rule.action.type === 'priority' && 'Set priority to'}
                              {rule.action.type === 'folder' && 'Move to folder'}
                            </span>
                            <span className="font-medium text-foreground">
                              {getActionValueLabel(rule.action)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rule.isActive}
                          onChange={(e) => handleToggleRule(rule.id, e.target.checked)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(rule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Edit Form */}
                    {editingId === rule.id && (
                      <div className="mt-4 p-4 bg-accent/20 rounded-lg space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Rule Name</label>
                            <Input
                              value={editingRule.name}
                              onChange={(e) => setEditingRule(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium">Active</label>
                            <Switch
                              checked={editingRule.isActive}
                              onChange={(e) => setEditingRule(prev => ({ ...prev, isActive: e.target.checked }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Condition</label>
                            <div className="space-y-2">
                              <select
                                value={editingRule.condition?.type}
                                onChange={(e) => setEditingRule(prev => ({
                                  ...prev,
                                  condition: { ...prev.condition!, type: e.target.value as any }
                                }))}
                                className="w-full p-2 border border-border rounded-md"
                              >
                                <option value="sender">Sender Email</option>
                                <option value="subject">Subject Contains</option>
                                <option value="content">Content Contains</option>
                              </select>
                              <Input
                                value={editingRule.condition?.value}
                                onChange={(e) => setEditingRule(prev => ({
                                  ...prev,
                                  condition: { ...prev.condition!, value: e.target.value }
                                }))}
                                className="w-full"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Action</label>
                            <div className="space-y-2">
                              <select
                                value={editingRule.action?.type}
                                onChange={(e) => setEditingRule(prev => ({
                                  ...prev,
                                  action: { ...prev.action!, type: e.target.value as any, value: '' }
                                }))}
                                className="w-full p-2 border border-border rounded-md"
                              >
                                <option value="category">Set Category</option>
                                <option value="priority">Set Priority</option>
                                <option value="folder">Move to Folder</option>
                              </select>
                              {editingRule.action?.type === 'category' ? (
                                <select
                                  value={editingRule.action.value}
                                  onChange={(e) => setEditingRule(prev => ({
                                    ...prev,
                                    action: { ...prev.action!, value: parseInt(e.target.value) }
                                  }))}
                                  className="w-full p-2 border border-border rounded-md"
                                >
                                  <option value="">Select Category</option>
                                  {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                      {category.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <Input
                                  value={editingRule.action?.value}
                                  onChange={(e) => setEditingRule(prev => ({
                                    ...prev,
                                    action: { ...prev.action!, value: e.target.value }
                                  }))}
                                  className="w-full"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button 
                            onClick={() => handleUpdateRule(rule.id)}
                            disabled={!editingRule.name?.trim() || !editingRule.condition?.value?.trim() || !editingRule.action?.value}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={cancelEditing}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rules Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Rules Statistics</CardTitle>
            <CardDescription>
              Overview of your automation rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-accent/20 rounded-lg">
                <div className="text-2xl font-bold text-primary">{rules.length}</div>
                <div className="text-sm text-muted-foreground">Total Rules</div>
              </div>
              <div className="text-center p-4 bg-accent/20 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {rules.filter(r => r.isActive).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Rules</div>
              </div>
              <div className="text-center p-4 bg-accent/20 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {rules.filter(r => !r.isActive).length}
                </div>
                <div className="text-sm text-muted-foreground">Inactive Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 