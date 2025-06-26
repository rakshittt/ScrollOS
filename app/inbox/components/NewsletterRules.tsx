'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Plus, Trash2 } from 'lucide-react';

type RuleCondition = {
  type: 'sender' | 'subject' | 'content';
  value: string;
};

type RuleAction = {
  type: 'category' | 'priority' | 'folder';
  value: string | number;
};

type NewsletterRule = {
  id: number;
  name: string;
  condition: RuleCondition;
  action: RuleAction;
  isActive: boolean;
};

export function NewsletterRules() {
  const [rules, setRules] = useState<NewsletterRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRule, setNewRule] = useState<Partial<NewsletterRule>>({
    name: '',
    condition: { type: 'sender', value: '' },
    action: { type: 'category', value: '' },
    isActive: true,
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/newsletters/categorize');
      if (!response.ok) throw new Error('Failed to fetch rules');
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRule = async () => {
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
        isActive: true,
      });
    } catch (error) {
      console.error('Error creating rule:', error);
    }
  };

  const handleDeleteRule = async (id: number) => {
    try {
      const response = await fetch(`/api/newsletters/categorize/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete rule');
      await fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const handleToggleRule = async (id: number, checked: boolean) => {
    try {
      const response = await fetch(`/api/newsletters/categorize/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: checked }),
      });
      if (!response.ok) throw new Error('Failed to update rule');
      await fetchRules();
    } catch (error) {
      console.error('Error updating rule:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Newsletter Rules</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateRule}
          disabled={!newRule.name || !newRule.condition?.value || !newRule.action?.value}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* New Rule Form */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <Input
          placeholder="Rule Name"
          value={newRule.name}
          onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Condition</label>
            <select
              value={newRule.condition?.type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setNewRule({
                  ...newRule,
                  condition: { ...newRule.condition!, type: e.target.value as 'sender' | 'subject' | 'content' },
                })
              }
            >
              <option value="sender">Sender Email</option>
              <option value="subject">Subject Contains</option>
              <option value="content">Content Contains</option>
            </select>
            <Input
              placeholder="Value"
              value={newRule.condition?.value}
              onChange={(e) =>
                setNewRule({
                  ...newRule,
                  condition: { ...newRule.condition!, value: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Action</label>
            <select
              value={newRule.action?.type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setNewRule({
                  ...newRule,
                  action: { ...newRule.action!, type: e.target.value as 'category' | 'priority' | 'folder' },
                })
              }
            >
              <option value="category">Set Category</option>
              <option value="priority">Set Priority</option>
              <option value="folder">Move to Folder</option>
            </select>
            <Input
              placeholder="Value"
              value={newRule.action?.value}
              onChange={(e) =>
                setNewRule({
                  ...newRule,
                  action: { ...newRule.action!, value: e.target.value },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Existing Rules */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{rule.name}</h3>
                <Switch
                  checked={rule.isActive}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleToggleRule(rule.id, e.target.checked)}
                />
              </div>
              <p className="text-sm text-gray-500">
                If {rule.condition.type} contains "{rule.condition.value}", then{' '}
                {rule.action.type} to "{rule.action.value}"
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteRule(rule.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 