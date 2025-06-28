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
      const response = await fetch('/api/email/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          acceptedEmails: Array.from(selectedEmails),
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
                        {emails.map((e) => (
                          <Card
                            key={e.email}
                            className={
                              `flex flex-col gap-3 p-5 border rounded-xl shadow-sm hover:border-primary focus-within:ring-2 focus-within:ring-primary-500 transition-all duration-150 group min-h-[120px] animate-fade-in ${
                                selectedEmails.has(e.email) 
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                                  : 'border-border bg-background'
                              }`
                            }
                            tabIndex={0}
                            aria-label={`Email ${e.email}`}
                            style={{ background: selectedEmails.has(e.email) ? 'var(--primary-50)' : 'var(--background-secondary)' }}
                          >
                            <div className="flex items-center gap-4 mb-1">
                <Checkbox
                                id={e.email}
                                checked={selectedEmails.has(e.email)}
                                onCheckedChange={(checked) => handleSelectEmail(e.email, !!checked)}
                                className="mt-0.5 cursor-pointer h-5 w-5 border-2 border-border hover:border-primary transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                style={{ zIndex: 2 }}
                                aria-label={`Select email ${e.email}`}
                              />
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${e.domain}`}
                                alt={e.domain}
                                className="h-8 w-8 rounded bg-muted border border-border flex-shrink-0 shadow-md"
                                style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
                />
                <div className="flex-1 min-w-0">
                                <div className="font-semibold text-lg text-foreground truncate" title={e.name || e.email}>
                                  {e.name || e.email}
                                </div>
                                <div className="text-sm text-muted-foreground truncate flex items-center gap-1" title={e.email}>
                                  {e.email}
                                  {e.isWhitelisted && (
                                    <div title="Domain is already whitelisted">
                                      <Shield className="h-3 w-3 text-green-600" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge className={`capitalize ${getConfidenceBadgeStyles(e.sample.confidence)}`}>
                                  {e.sample.confidence} confidence
                                </Badge>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  {e.count} newsletter{e.count !== 1 ? 's' : ''}
                                </Badge>
                                {e.isWhitelisted && (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                    Whitelisted
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                              <span className="truncate max-w-[120px]" title={e.sample.subject}>Subject: <span className="text-foreground font-medium">{e.sample.subject}</span></span>
                              <span className="whitespace-nowrap">{new Date(e.sample.date).toLocaleString()}</span>
                              <span className="text-info font-medium">Type: {getNewsletterType(e.sample)}</span>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
          {/* Step 2: Importing Progress */}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center flex-1 animate-fade-in">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <div className="text-lg font-semibold text-primary mb-2 animate-fade-in">Importing newsletters...</div>
              <div className="text-xs text-muted-foreground animate-fade-in">This may take a minute. You can close this modal and come back later.</div>
            </div>
          )}
          {/* Step 3: Results */}
          {step === 'results' && (
            <div className="px-6 py-8 overflow-y-auto max-h-[60vh] animate-fade-in">
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-fade-in">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2 animate-fade-in">Import Complete!</h3>
                <p className="text-muted-foreground text-center animate-fade-in">
                  Your newsletters have been successfully imported and are ready to read.
                </p>
              </div>

              {/* Import Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-6 border border-green-200 dark:border-green-800 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-foreground">Import Summary</h4>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-primary">Success</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {selectedEmails.size}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Email{selectedEmails.size !== 1 ? 's' : ''} Whitelisted
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {totalNewsletterCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Newsletter{totalNewsletterCount !== 1 ? 's' : ''} Imported
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {emails.filter(e => e.isWhitelisted).length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Already Whitelisted
                    </div>
                  </div>
                </div>
              </div>

              {/* Imported Emails List */}
              <div className="mb-6 animate-fade-in">
                <h4 className="text-lg font-semibold text-foreground mb-4">Imported Newsletters</h4>
                
                {importedCounts && importedCounts.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {importedCounts.map((item, index) => (
                      <div 
                        key={item.email} 
                        className="flex items-center gap-4 p-4 bg-background border border-border rounded-lg hover:bg-accent/5 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${item.email.split('@')[1]}`}
                          alt={item.email.split('@')[1]}
                          className="h-8 w-8 rounded bg-muted border border-border flex-shrink-0 shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate" title={item.email}>
                            {item.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.email.split('@')[1]}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full font-semibold">
                            {item.count} Newsletter{item.count !== 1 ? 's' : ''}
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {/* Fallback: Show selected emails with their counts */}
                    {Array.from(selectedEmails).map((email, index) => {
                      const emailData = emails.find(e => e.email === email);
                      return (
                        <div 
                          key={email} 
                          className="flex items-center gap-4 p-4 bg-background border border-border rounded-lg hover:bg-accent/5 transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${email.split('@')[1]}`}
                            alt={email.split('@')[1]}
                            className="h-8 w-8 rounded bg-muted border border-border flex-shrink-0 shadow-sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate" title={email}>
                              {emailData?.name || email}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {email}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full font-semibold">
                              {emailData?.count || 0} Newsletter{(emailData?.count || 0) !== 1 ? 's' : ''}
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6 animate-fade-in">
                <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-600" />
                  What's Next?
                </h4>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Your newsletters are now available in your inbox</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Use categories and rules to organize your newsletters</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Set up automatic syncing to import new newsletters regularly</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                  You can close this modal and continue using the app
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setStep('select');
                      setSelectedEmails(new Set());
                    }}
                    className="animate-fade-in"
                  >
                    Import More
                  </Button>
                  <Button 
                    onClick={onClose} 
                    className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 animate-fade-in"
                  >
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