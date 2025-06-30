'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Loader2, Mail, Shield, Sparkles, X, RefreshCw, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EmailPreview {
  email: string;
  name: string;
  domain: string;
  count: number;
  isWhitelisted: boolean;
  sample: {
    subject: string;
    from: string;
    senderEmail: string;
    date: string;
    confidence: 'low' | 'medium' | 'high';
    score: number;
  };
  newsletters?: any[];
}

interface ImportedCount {
  email: string;
  count: number;
}

interface NewsletterSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: number;
}

type Step = 'select' | 'importing' | 'results';

export function NewsletterSyncModal({ isOpen, onClose, accountId }: NewsletterSyncModalProps) {
  // State
  const [step, setStep] = useState<Step>('select');
  const [emails, setEmails] = useState<EmailPreview[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [importedCounts, setImportedCounts] = useState<ImportedCount[] | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  const [actualImportedCount, setActualImportedCount] = useState(0);
  const [syncProgress, setSyncProgress] = useState<any>(null);
  const [syncResults, setSyncResults] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  // Step 1: Fetch emails on open
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setImportedCounts(null);
      setImportProgress(0);
      setImportStatus('');
      setActualImportedCount(0);
      fetchEmails();
      console.log('[NewsletterSyncModal] Modal opened, fetching emails...');
    }
  }, [isOpen, accountId]);

  // Ensure selectedEmails is always in sync with emails
  useEffect(() => {
    if (emails.length > 0) {
      setSelectedEmails(new Set(emails.map(e => e.email)));
      console.log('[NewsletterSyncModal] Emails loaded:', emails.map(e => e.email));
    }
  }, [emails]);

  // Poll for real-time sync progress when importing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === 'importing' && accountId) {
      setSyncStatus('syncing');
      const poll = async () => {
        try {
          const res = await fetch(`/api/email/sync/imported-counts?accountId=${accountId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.progress) {
              setSyncProgress(data.progress);
              setSyncStatus(data.progress.status);
              setSyncResults(data.progress.emailResults || []);
              setImportProgress(data.progress.progress || 0);
              setImportStatus(data.progress.status === 'syncing' ? 'Importing newsletters...' : data.progress.status === 'success' ? 'Import completed successfully!' : 'Import failed.');
              if (data.progress.status === 'success' || data.progress.status === 'error') {
                if (interval) clearInterval(interval);
                setTimeout(() => setStep('results'), 1000);
              }
            }
          }
        } catch (err) {
          // Ignore polling errors
        }
      };
      poll();
      interval = setInterval(poll, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, accountId]);

  const fetchEmails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/email/sync/preview?accountId=${accountId}`);
      if (!response.ok) throw new Error('Failed to fetch emails');
      const data = await response.json();
      // Ensure unique and stable emails
      const seen = new Set();
      const uniqueEmails = (data.emails || []).filter((e: EmailPreview) => {
        if (seen.has(e.email)) return false;
        seen.add(e.email);
        return true;
      });
      
      // Debug: Log whitelisted emails
      const whitelistedEmails = uniqueEmails.filter((e: EmailPreview) => e.isWhitelisted);
      console.log(`[NewsletterSyncModal] Found ${whitelistedEmails.length} whitelisted emails:`, whitelistedEmails.map((e: EmailPreview) => e.email));
      
      setEmails(uniqueEmails);
      console.log('[NewsletterSyncModal] Unique emails set:', uniqueEmails);
    } catch (error) {
      toast.error('Failed to fetch newsletter emails');
      console.error('[NewsletterSyncModal] Error fetching emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Email selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(new Set(emails.map(e => e.email)));
      console.log('[NewsletterSyncModal] All emails selected');
    } else {
      setSelectedEmails(new Set());
      console.log('[NewsletterSyncModal] All emails deselected');
    }
  };

  const handleSelectEmail = (email: string, checked: boolean) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(email);
        console.log(`[NewsletterSyncModal] Email selected: ${email}`);
      } else {
        next.delete(email);
        console.log(`[NewsletterSyncModal] Email deselected: ${email}`);
      }
      return next;
    });
  };

  // Step 2: Whitelist and import with progress simulation
  const handleWhitelistEmails = async () => {
    setIsLoading(true);
    setStep('importing');
    setImportProgress(0);
    setImportStatus('Preparing import...');
    console.log('[NewsletterSyncModal] Whitelisting emails:', Array.from(selectedEmails));
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // Update status messages
      const statusMessages = [
        'Analyzing email patterns...',
        'Identifying newsletters...',
        'Whitelisting email addresses...',
        'Importing newsletter content...',
        'Finalizing import...'
      ];
      
      let statusIndex = 0;
      const statusInterval = setInterval(() => {
        if (statusIndex < statusMessages.length - 1) {
          setImportStatus(statusMessages[statusIndex]);
          statusIndex++;
        }
      }, 1000);

      // Collect all newsletter data from selected emails
      const previewData: any[] = [];
      emails.forEach(email => {
        if (selectedEmails.has(email.email) && email.newsletters) {
          previewData.push(...email.newsletters);
        }
      });
      
      console.log(`[NewsletterSyncModal] Sending ${previewData.length} newsletters with import request`);
      
      const response = await fetch('/api/email/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          acceptedEmails: Array.from(selectedEmails),
          previewData, // Send the preview data to avoid fetching again
        }),
      });
      
      if (!response.ok) throw new Error('Failed to whitelist emails');
      
      // Get the actual imported count from the response
      const responseData = await response.json();
      const importedCount = responseData.importedCount || 0;
      setActualImportedCount(importedCount);
      
      // Clear intervals and set final progress
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      setImportProgress(100);
      setImportStatus('Import completed successfully!');
      
      // Wait a moment to show completion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // After import, fetch imported counts and show results
      await fetchImportedCounts();
      setStep('results');
      console.log('[NewsletterSyncModal] Newsletters from whitelisted emails stored in DB.');
    } catch (error) {
      toast.error('Failed to whitelist emails');
      setStep('select');
      console.error('[NewsletterSyncModal] Error whitelisting emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Fetch imported counts
  const fetchImportedCounts = async () => {
    try {
      console.log('[NewsletterSyncModal] Fetching imported counts for account:', accountId);
      const res = await fetch(`/api/email/sync/imported-counts?accountId=${accountId}`);
      
      if (!res.ok) {
        console.error('[NewsletterSyncModal] Failed to fetch imported counts:', res.status, res.statusText);
        // Don't throw error, just log it and continue
        return;
      }
      
      const data = await res.json();
      console.log('[NewsletterSyncModal] Imported counts response:', data);
      
      if (data.counts && Array.isArray(data.counts)) {
        setImportedCounts(data.counts);
        console.log('[NewsletterSyncModal] Set imported counts:', data.counts);
      } else {
        console.log('[NewsletterSyncModal] No counts data or invalid format:', data);
        setImportedCounts([]);
      }
    } catch (error) {
      console.error('[NewsletterSyncModal] Error fetching imported counts:', error);
      // Don't throw error, just log it and continue
      setImportedCounts([]);
    }
  };

  // UI helpers
  const getConfidenceBadgeStyles = (confidence: 'low' | 'medium' | 'high') => {
    switch (confidence) {
      case 'high': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getNewsletterType = (sample: EmailPreview['sample']): string => {
    const subject = sample.subject.toLowerCase();
    const from = sample.from.toLowerCase();
    if (subject.includes('digest')) return 'Digest';
    if (subject.includes('update')) return 'Update';
    if (subject.includes('news')) return 'News';
    if (subject.includes('promotion') || subject.includes('offer')) return 'Promotion';
    if (subject.includes('bulletin')) return 'Bulletin';
    if (subject.includes('weekly')) return 'Weekly';
    if (subject.includes('monthly')) return 'Monthly';
    if (from.includes('digest')) return 'Digest';
    if (from.includes('update')) return 'Update';
    if (from.includes('news')) return 'News';
    if (from.includes('promotion') || from.includes('offer')) return 'Promotion';
    if (from.includes('bulletin')) return 'Bulletin';
    if (from.includes('weekly')) return 'Weekly';
    if (from.includes('monthly')) return 'Monthly';
    return 'General';
  };

  // Fun loading quotes
  const loadingQuotes = [
    'Fetching your potential newsletters...',
    'Looking for the best email addresses in your inbox...',
    'Almost there! Good things take time.',
    'Did you know? You can always change your selections later.',
    "Hang tight! We're sorting your newsletters.",
    'Your reading experience is about to get better!',
  ];
  const randomQuote = loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)];

  // Calculate total newsletter count from selected emails
  const totalNewsletterCount = emails
    .filter((e: EmailPreview) => selectedEmails.has(e.email))
    .reduce((sum, e: EmailPreview) => sum + e.count, 0);

  // Calculate total imported count
  const totalImportedCount = actualImportedCount;

  // Step indicator
  const stepIndicator = (
    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-2">
      <span className={step === 'select' ? 'text-primary underline underline-offset-4' : ''}>1. Select Emails</span>
      <span>→</span>
      <span className={step === 'importing' ? 'text-primary underline underline-offset-4' : ''}>2. Import</span>
      <span>→</span>
      <span className={step === 'results' ? 'text-primary underline underline-offset-4' : ''}>3. Results</span>
    </div>
  );

  // Main render
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full bg-background border border-border shadow-2xl rounded-lg p-0 h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 border-b border-border bg-primary/5 rounded-t-lg flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">Newsletter Sync</h2>
            </div>
          </div>
          {stepIndicator}
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Step 1: Select Emails */}
          {step === 'select' && (
            <>
              <div className="flex items-center justify-between py-4 px-6 border-b border-border bg-background flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="select-all"
                    checked={selectedEmails.size === emails.length && emails.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="h-5 w-5 border-2 border-border hover:border-primary transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer"
                    aria-label="Select all emails"
                  />
                  <label 
                    htmlFor="select-all" 
                    className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors select-none"
                    style={{ userSelect: 'none' }}
                  >
                    Select All
                  </label>
                </div>
                <div className="flex items-center space-x-4">
                  {selectedEmails.size > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {selectedEmails.size} email{selectedEmails.size !== 1 ? 's' : ''} selected • {totalNewsletterCount} newsletter{totalNewsletterCount !== 1 ? 's' : ''} to import
                      {emails.filter((e: EmailPreview) => selectedEmails.has(e.email) && e.isWhitelisted).length > 0 && (
                        <span className="ml-2 text-green-600 font-medium">
                          • {emails.filter((e: EmailPreview) => selectedEmails.has(e.email) && e.isWhitelisted).length} already whitelisted
                        </span>
                      )}
                    </div>
                  )}
                  <Button
                    onClick={handleWhitelistEmails}
                    disabled={isLoading || selectedEmails.size === 0}
                    className="min-w-[140px] bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Accept selected emails and start import"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {isLoading ? 'Saving...' : `Import ${totalNewsletterCount} Newsletter${totalNewsletterCount !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="px-6 py-4">
                    {isLoading && emails.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 text-primary animate-spin mb-3" />
                        <div className="text-base font-medium text-primary mb-1">{randomQuote}</div>
                        <div className="text-xs text-muted-foreground">This may take a few moments.</div>
                      </div>
                    ) : emails.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-lg font-semibold text-primary mb-2">No newsletter emails found</div>
                        <div className="text-sm text-muted-foreground">Try syncing again later or check your email account settings.</div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {emails.map((e) => {
                          // Debug: Log whitelisted status for each email
                          if (e.isWhitelisted) {
                            console.log(`[NewsletterSyncModal] Rendering whitelisted email: ${e.email}`);
                          }
                          
                          return (
                            <Card
                              key={e.email}
                              className={
                                `flex flex-col gap-2 p-4 border rounded-lg shadow-sm hover:border-primary focus-within:ring-2 focus-within:ring-primary-500 transition-all duration-150 group min-h-[100px] ${
                                  e.isWhitelisted 
                                    ? 'border-green-400 bg-green-100/80 ring-2 ring-green-300 shadow-lg shadow-green-200/50' 
                                    : selectedEmails.has(e.email) 
                                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                                      : 'border-border bg-background'
                                }`
                              }
                              tabIndex={0}
                              aria-label={`Email ${e.email}${e.isWhitelisted ? ' (Whitelisted)' : ''}`}
                              style={{ 
                                background: e.isWhitelisted 
                                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%)' 
                                  : selectedEmails.has(e.email) 
                                    ? 'var(--primary-50)' 
                                    : 'var(--background-secondary)' 
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  id={e.email}
                                  checked={selectedEmails.has(e.email)}
                                  onCheckedChange={(checked) => handleSelectEmail(e.email, !!checked)}
                                  className="mt-0.5 cursor-pointer h-4 w-4 border-2 border-border hover:border-primary transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  style={{ zIndex: 2 }}
                                  aria-label={`Select email ${e.email}`}
                                />
                                <div className="relative flex-shrink-0">
                                  <img
                                    src={`https://www.google.com/s2/favicons?domain=${e.domain}`}
                                    alt={e.domain}
                                    className={`h-8 w-8 rounded-md bg-muted border border-border flex-shrink-0 shadow-sm ${
                                      e.isWhitelisted ? 'ring-2 ring-green-400 shadow-green-300/50' : ''
                                    }`}
                                    style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}
                                  />
                                  {e.isWhitelisted && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-white shadow-sm">
                                      <Shield className="h-2.5 w-2.5 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-base text-foreground truncate" title={e.name || e.email}>
                                      {e.name || e.email}
                                    </h3>
                                    {e.isWhitelisted && (
                                      <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                                        ✓ WHITELISTED
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground font-medium" title={e.email}>
                                    {e.email}
                                  </p>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <Badge className={`capitalize text-xs font-medium ${getConfidenceBadgeStyles(e.sample.confidence)}`}>
                                      {e.sample.confidence}
                                    </Badge>
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs font-medium">
                                      {e.count} newsletter{e.count !== 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className={`border-t pt-2 ${e.isWhitelisted ? 'border-green-200' : 'border-border'}`}>
                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 text-xs ${
                                  e.isWhitelisted ? 'text-green-800' : 'text-muted-foreground'
                                }`}>
                                  <div className="space-y-0.5">
                                    <span className="font-medium text-foreground">Subject:</span>
                                    <p className="text-foreground font-medium truncate" title={e.sample.subject}>
                                      {e.sample.subject}
                                    </p>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="font-medium text-foreground">Type:</span>
                                    <p className="text-foreground font-medium">
                                      {getNewsletterType(e.sample)}
                                    </p>
                                  </div>
                                </div>
                                {e.isWhitelisted && (
                                  <div className="mt-2 p-1.5 bg-green-50 border border-green-200 rounded-md">
                                    <span className="text-green-700 font-medium flex items-center gap-1.5 text-xs">
                                      <Shield className="h-3 w-3" />
                                      Ready to sync
                                    </span>
                                  </div>
                                )}
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}

          {/* Step 2: Importing */}
          {step === 'importing' && (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
              <div className="text-center space-y-6 max-w-md">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  </div>
                  <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Importing Newsletters</h3>
                  <p className="text-sm text-muted-foreground">{importStatus}</p>
                </div>
                {/* Real-time Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${syncProgress?.progress ?? importProgress}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(syncProgress?.progress ?? importProgress)}% complete
                </div>
                {/* Real-time Results Summary */}
                {syncResults.length > 0 && (
                  <div className="text-xs text-muted-foreground space-y-1 mt-2">
                    <p>• {syncResults.filter((r: any) => r.status === 'success').length} successful</p>
                    <p>• {syncResults.filter((r: any) => r.status === 'error').length} failed</p>
                    <p>• {syncResults.filter((r: any) => r.status === 'skipped').length} skipped</p>
                  </div>
                )}
                {/* Live per-email feedback */}
                {syncResults.length > 0 && (
                  <div className="mt-4 max-h-40 overflow-y-auto rounded border border-border bg-background text-left">
                    {syncResults.map((r: any, idx: number) => (
                      <div key={r.email + idx} className="flex items-center gap-2 px-3 py-1 border-b last:border-b-0 border-border text-xs">
                        {r.status === 'success' && <span className="text-green-600"><CheckCircle2 className="h-4 w-4" /></span>}
                        {r.status === 'error' && <span className="text-red-600"><AlertCircle className="h-4 w-4" /></span>}
                        {r.status === 'skipped' && <span className="text-gray-500"><Mail className="h-4 w-4" /></span>}
                        <span className="truncate flex-1" title={r.email}>{r.email}</span>
                        <span className="font-medium">
                          {r.status === 'success' && 'Imported'}
                          {r.status === 'error' && 'Failed'}
                          {r.status === 'skipped' && 'Skipped'}
                        </span>
                        {r.error && <span className="text-red-500 ml-2">{r.error}</span>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Importing {totalNewsletterCount} newsletters</p>
                  <p>• Whitelisting {selectedEmails.size} email addresses</p>
                  <p>• This may take a few moments...</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 'results' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header Section */}
              <div className="px-6 py-6 border-b border-border flex-shrink-0">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">
                      {totalImportedCount > 0 ? 'Import Complete!' : 'Sync Complete!'}
                    </h3>
                    <p className="text-muted-foreground">
                      {totalImportedCount > 0 
                        ? `Successfully imported ${totalImportedCount} newsletters from ${selectedEmails.size} email addresses.`
                        : `All newsletters from ${selectedEmails.size} email addresses were already imported.`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-6 space-y-6">
                  {/* Results Summary */}
                  <div className="bg-muted/30 rounded-lg p-6">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Import Summary
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-background rounded-lg border border-border">
                        <div className="text-2xl font-bold text-primary">{totalImportedCount}</div>
                        <div className="text-sm text-muted-foreground">Newsletters Imported</div>
                      </div>
                      <div className="text-center p-4 bg-background rounded-lg border border-border">
                        <div className="text-2xl font-bold text-primary">{selectedEmails.size}</div>
                        <div className="text-sm text-muted-foreground">Email Addresses</div>
                      </div>
                      <div className="text-center p-4 bg-background rounded-lg border border-border">
                        <div className="text-2xl font-bold text-green-600">
                          {totalImportedCount > 0 ? '100%' : '0%'}
                        </div>
                        <div className="text-sm text-muted-foreground">Success Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* Import Results */}
                  {importedCounts && importedCounts.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        Import Results by Email
                      </h4>
                      <div className="space-y-3">
                        {importedCounts.map((count, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Mail className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{count.email}</p>
                                <p className="text-xs text-muted-foreground">Email address</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary text-lg">{count.count}</p>
                              <p className="text-xs text-muted-foreground">
                                newsletter{count.count !== 1 ? 's' : ''} imported
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Results Message */}
                  {totalImportedCount === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                        <Mail className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">No New Newsletters</h4>
                      <p className="text-muted-foreground">
                        All newsletters from the selected email addresses were already imported.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Fixed at bottom */}
              <div className="px-6 py-4 border-t border-border bg-background flex-shrink-0">
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep('select');
                      setImportedCounts(null);
                      setImportProgress(0);
                      setImportStatus('');
                      setActualImportedCount(0);
                    }}
                    className="min-w-[120px]"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Again
                  </Button>
                  <Button
                    onClick={onClose}
                    className="min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}