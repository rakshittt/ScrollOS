'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Search,
  Mail,
  Save,
  X,
  Check,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface WhitelistEmail {
  id: number;
  email: string;
  name?: string;
  domain?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
}

export default function WhitelistPage() {
  const [whitelistEmails, setWhitelistEmails] = useState<WhitelistEmail[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [newEmail, setNewEmail] = useState({ email: '', name: '' });
  const [editingEmail, setEditingEmail] = useState({ email: '', name: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchWhitelistEmails();
  }, [currentPage, searchTerm]);

  const fetchWhitelistEmails = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50'
      });
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/whitelist?${params}`);
      if (!response.ok) throw new Error('Failed to fetch whitelist emails');
      
      const data = await response.json();
      setWhitelistEmails(data.whitelistEmails);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching whitelist emails:', error);
      toast.error('Failed to load whitelist emails');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEmail = async () => {
    if (!newEmail.email.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      const response = await fetch('/api/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmail),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add email');
      }

      const data = await response.json();
      setWhitelistEmails(prev => [data.whitelistEmail, ...prev]);
      setNewEmail({ email: '', name: '' });
      setIsCreating(false);
      toast.success('Email added to whitelist');
    } catch (error) {
      console.error('Error adding email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add email');
    }
  };

  const handleUpdateEmail = async (id: number) => {
    if (!editingEmail.email.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      const response = await fetch(`/api/whitelist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEmail),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update email');
      }

      const data = await response.json();
      setWhitelistEmails(prev => prev.map(email => 
        email.id === id ? data.whitelistEmail : email
      ));
      setEditingId(null);
      setEditingEmail({ email: '', name: '' });
      toast.success('Email updated successfully');
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update email');
    }
  };

  const handleDeleteEmail = async (id: number) => {
    if (!confirm('Are you sure you want to remove this email from the whitelist? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/whitelist/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete email');

      setWhitelistEmails(prev => prev.filter(email => email.id !== id));
      toast.success('Email removed from whitelist');
    } catch (error) {
      console.error('Error deleting email:', error);
      toast.error('Failed to remove email from whitelist');
    }
  };

  const startEditing = (email: WhitelistEmail) => {
    setEditingId(email.id);
    setEditingEmail({ email: email.email, name: email.name || '' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingEmail({ email: '', name: '' });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Email Whitelist</h1>
              <p className="text-muted-foreground">Control which email addresses can import newsletters during sync</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Add New Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add Email to Whitelist</span>
            </CardTitle>
            <CardDescription>
              Add email addresses that are allowed to send newsletters to your inbox
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isCreating ? (
              <Button onClick={() => setIsCreating(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Email
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address *</label>
                    <Input
                      value={newEmail.email}
                      onChange={(e) => setNewEmail(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="newsletter@example.com"
                      type="email"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Display Name (Optional)</label>
                    <Input
                      value={newEmail.name}
                      onChange={(e) => setNewEmail(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Newsletter Name"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button onClick={handleCreateEmail} disabled={!newEmail.email.trim()}>
                    <Save className="h-4 w-4 mr-2" />
                    Add to Whitelist
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsCreating(false);
                    setNewEmail({ email: '', name: '' });
                  }}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search and Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Whitelisted Emails</CardTitle>
            <CardDescription>
              {pagination && `${pagination.totalCount} email${pagination.totalCount !== 1 ? 's' : ''} in whitelist`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search emails..."
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : whitelistEmails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No whitelisted emails yet. Add your first email to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {whitelistEmails.map((email) => (
                  <div
                    key={email.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        {editingId === email.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editingEmail.email}
                              onChange={(e) => setEditingEmail(prev => ({ ...prev, email: e.target.value }))}
                              className="w-64"
                            />
                            <Input
                              value={editingEmail.name}
                              onChange={(e) => setEditingEmail(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Display name"
                              className="w-40"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="font-medium">{email.name || email.email}</div>
                            <div className="text-sm text-muted-foreground">{email.email}</div>
                            {email.domain && (
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Globe className="h-3 w-3" />
                                <span>{email.domain}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {editingId === email.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateEmail(email.id)}
                            disabled={!editingEmail.email.trim()}
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
                            onClick={() => startEditing(email)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteEmail(email.id)}
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

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                  {pagination.totalCount} emails
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevious}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span>How Whitelisting Works</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                • Only emails in your whitelist can import newsletters during sync
              </p>
              <p>
                • Your inbox shows all newsletters, but new ones only come from whitelisted emails
              </p>
              <p>
                • When you connect an email account, we'll suggest potential newsletter emails to whitelist
              </p>
              <p>
                • You can manually add or remove emails from this list at any time
              </p>
              <p>
                • Removing an email from the whitelist will prevent future imports from that sender
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 