'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Loader2, Mail, Shield, Sparkles } from 'lucide-react';
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
  const { toast } = useToast();

  // Step 1: Fetch emails on open
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setImportedCounts(null);
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
      const whitelistedEmails = uniqueEmails.filter(e => e.isWhitelisted);
      console.log(`[NewsletterSyncModal] Found ${whitelistedEmails.length} whitelisted emails:`, whitelistedEmails.map(e => e.email));
      
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

  // Step 2: Whitelist and import (no polling)
  const handleWhitelistEmails = async () => {
    setIsLoading(true);
    setStep('importing');
    console.log('[NewsletterSyncModal] Whitelisting emails:', Array.from(selectedEmails));
    
    try {
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
    .filter(e => selectedEmails.has(e.email))
    .reduce((sum, e) => sum + e.count, 0);

  // Step indicator
  const stepIndicator = (
    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-2 animate-fade-in">
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
      <DialogContent className="max-w-2xl w-full bg-background border border-border shadow-2xl rounded-lg p-0 h-[80vh] flex flex-col animate-fade-in">
        <div className="px-6 pt-6 pb-2 border-b border-border bg-primary/5 rounded-t-lg flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="h-6 w-6 text-primary animate-fade-in" />
            <h2 className="text-2xl font-bold text-primary animate-fade-in">Newsletter Sync</h2>
          </div>
          {stepIndicator}
        </div>
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Step 1: Select Emails */}
          {step === 'select' && (
            <>
              <div className="flex items-center justify-between py-4 px-6 border-b border-border bg-background flex-shrink-0 animate-fade-in">
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
                {emails.filter(e => selectedEmails.has(e.email) && e.isWhitelisted).length > 0 && (
                  <span className="ml-2 text-green-600 font-medium">
                    • {emails.filter(e => selectedEmails.has(e.email) && e.isWhitelisted).length} already whitelisted
                  </span>
                )}
              </div>
            )}
          <Button
                  onClick={handleWhitelistEmails}
                  disabled={isLoading || selectedEmails.size === 0}
                  className="min-w-[140px] bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 animate-fade-in"
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
                      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
                        <Loader2 className="h-6 w-6 text-primary animate-spin mb-3" />
                        <div className="text-base font-medium text-primary mb-1">{randomQuote}</div>
                        <div className="text-xs text-muted-foreground">This may take a few moments.</div>
                      </div>
                    ) : emails.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
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
                              `flex flex-col gap-2 p-4 border rounded-lg shadow-sm hover:border-primary focus-within:ring-2 focus-within:ring-primary-500 transition-all duration-150 group min-h-[100px] animate-fade-in ${
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
                                  {/* {e.isWhitelisted && (
                                    <Badge className="bg-green-500 text-white border-green-500 text-xs font-bold shadow-sm">
                                      <Shield className="h-2.5 w-2.5 mr-1" />
                                      IMPORTED
                                    </Badge>
                                  )} */}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}