'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface DomainPreview {
  domain: string;
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
  domain: string;
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
  const [domains, setDomains] = useState<DomainPreview[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [importedCounts, setImportedCounts] = useState<ImportedCount[] | null>(null);
  const { toast } = useToast();

  // Step 1: Fetch domains on open
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setImportedCounts(null);
      fetchDomains();
      console.log('[NewsletterSyncModal] Modal opened, fetching domains...');
    }
  }, [isOpen, accountId]);

  // Ensure selectedDomains is always in sync with domains
  useEffect(() => {
    if (domains.length > 0) {
      setSelectedDomains(new Set(domains.map(d => d.domain)));
      console.log('[NewsletterSyncModal] Domains loaded:', domains.map(d => d.domain));
    }
  }, [domains]);

  const fetchDomains = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/email/sync/preview?accountId=${accountId}`);
      if (!response.ok) throw new Error('Failed to fetch domains');
      const data = await response.json();
      // Ensure unique and stable domains
      const seen = new Set();
      const uniqueDomains = (data.domains || []).filter((d: DomainPreview) => {
        if (seen.has(d.domain)) return false;
        seen.add(d.domain);
        return true;
      });
      setDomains(uniqueDomains);
      console.log('[NewsletterSyncModal] Unique domains set:', uniqueDomains);
    } catch (error) {
      toast.error('Failed to fetch newsletter domains');
      console.error('[NewsletterSyncModal] Error fetching domains:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Domain selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDomains(new Set(domains.map(d => d.domain)));
      console.log('[NewsletterSyncModal] All domains selected');
    } else {
      setSelectedDomains(new Set());
      console.log('[NewsletterSyncModal] All domains deselected');
    }
  };
  const handleSelectDomain = (domain: string, checked: boolean) => {
    setSelectedDomains(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(domain);
        console.log(`[NewsletterSyncModal] Domain selected: ${domain}`);
      } else {
        next.delete(domain);
        console.log(`[NewsletterSyncModal] Domain deselected: ${domain}`);
      }
      return next;
    });
  };

  // Step 2: Whitelist and import (no polling)
  const handleWhitelistDomains = async () => {
    setIsLoading(true);
    setStep('importing');
    console.log('[NewsletterSyncModal] Whitelisting domains:', Array.from(selectedDomains));
    try {
      const response = await fetch('/api/email/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          acceptedDomains: Array.from(selectedDomains),
        }),
      });
      if (!response.ok) throw new Error('Failed to whitelist domains');
      // After import, fetch imported counts and show results
      await fetchImportedCounts();
      setStep('results');
      console.log('[NewsletterSyncModal] Newsletters from whitelisted domains stored in DB.');
    } catch (error) {
      toast.error('Failed to whitelist domains');
      setStep('select');
      console.error('[NewsletterSyncModal] Error whitelisting domains:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Fetch imported counts
  const fetchImportedCounts = async () => {
    try {
      const res = await fetch(`/api/email/sync/imported-counts?accountId=${accountId}`);
      if (res.ok) {
        const data = await res.json();
        setImportedCounts(data.counts || []);
        console.log('[NewsletterSyncModal] Imported newsletter counts:', data.counts);
      }
    } catch (error) {
      console.error('[NewsletterSyncModal] Error fetching imported counts:', error);
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
  const getNewsletterType = (sample: DomainPreview['sample']): string => {
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
    'Looking for the best domains in your inbox...',
    'Almost there! Good things take time.',
    'Did you know? You can always change your selections later.',
    "Hang tight! We're sorting your newsletters.",
    'Your reading experience is about to get better!',
  ];
  const randomQuote = loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)];

  // Domain counts (for badge)
  const domainCounts: Record<string, number> = {};
  domains.forEach((d) => {
    domainCounts[d.domain] = (domainCounts[d.domain] || 0) + 1;
  });

  // Step indicator
  const stepIndicator = (
    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-2 animate-fade-in">
      <span className={step === 'select' ? 'text-primary underline underline-offset-4' : ''}>1. Select Domains</span>
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
          {/* Step 1: Select Domains */}
          {step === 'select' && (
            <>
              <div className="flex items-center justify-between py-4 px-6 border-b border-border bg-background flex-shrink-0 animate-fade-in">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="select-all"
                    checked={selectedDomains.size === domains.length && domains.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="h-5 w-5 border-2 border-border hover:border-primary transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer"
                    aria-label="Select all domains"
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors select-none"
                    style={{ userSelect: 'none' }}
                  >
                    Select All
                  </label>
                </div>
                <Button
                  onClick={handleWhitelistDomains}
                  disabled={isLoading || selectedDomains.size === 0}
                  className="min-w-[140px] bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 animate-fade-in"
                  aria-label="Accept selected domains and start import"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {isLoading ? 'Saving...' : `Accept ${selectedDomains.size} Domains`}
                </Button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="px-6 py-4">
                    {isLoading && domains.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
                        <Loader2 className="h-6 w-6 text-primary animate-spin mb-3" />
                        <div className="text-base font-medium text-primary mb-1">{randomQuote}</div>
                        <div className="text-xs text-muted-foreground">This may take a few moments.</div>
                      </div>
                    ) : domains.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
                        <div className="text-lg font-semibold text-primary mb-2">No newsletter domains found</div>
                        <div className="text-sm text-muted-foreground">Try syncing again later or check your email account settings.</div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {domains.map((d) => (
                          <Card
                            key={d.domain}
                            className={
                              `flex flex-col gap-3 p-5 border rounded-xl shadow-sm hover:border-primary focus-within:ring-2 focus-within:ring-primary-500 transition-all duration-150 group min-h-[120px] animate-fade-in ${
                                selectedDomains.has(d.domain) 
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                                  : 'border-border bg-background'
                              }`
                            }
                            tabIndex={0}
                            aria-label={`Domain ${d.domain}`}
                            style={{ background: selectedDomains.has(d.domain) ? 'var(--primary-50)' : 'var(--background-secondary)' }}
                          >
                            <div className="flex items-center gap-4 mb-1">
                              <Checkbox
                                id={d.domain}
                                checked={selectedDomains.has(d.domain)}
                                onCheckedChange={(checked) => handleSelectDomain(d.domain, !!checked)}
                                className="mt-0.5 cursor-pointer h-5 w-5 border-2 border-border hover:border-primary transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                style={{ zIndex: 2 }}
                                aria-label={`Select domain ${d.domain}`}
                              />
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${d.domain}`}
                                alt={d.domain}
                                className="h-8 w-8 rounded bg-muted border border-border flex-shrink-0 shadow-md"
                                style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}
                              />
                              <span className="font-semibold text-lg text-foreground truncate max-w-[180px]" title={d.domain}>{d.domain}</span>
                              <Badge className={`capitalize ml-2 flex-shrink-0 ${getConfidenceBadgeStyles(d.sample.confidence)}`}>{d.sample.confidence} confidence</Badge>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                              <span className="truncate max-w-[120px]" title={d.sample.from}>From: <span className="text-foreground font-medium">{d.sample.from}</span> <span className="text-muted-foreground">({d.sample.senderEmail})</span></span>
                              <span className="truncate max-w-[120px]" title={d.sample.subject}>Subject: <span className="text-foreground font-medium">{d.sample.subject}</span></span>
                              <span className="whitespace-nowrap">{new Date(d.sample.date).toLocaleString()}</span>
                              <span className="text-info font-medium">Type: {getNewsletterType(d.sample)}</span>
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
              <div className="flex flex-col items-center mb-6">
                <Sparkles className="h-10 w-10 text-primary mb-2 animate-fade-in" />
                <h3 className="text-xl font-bold text-primary mb-1 animate-fade-in">Import Complete!</h3>
                <div className="text-sm text-muted-foreground mb-2 animate-fade-in">Here are the newsletters imported from your selected domains.</div>
              </div>
              {importedCounts && importedCounts.length === 0 ? (
                <div className="text-center text-muted-foreground animate-fade-in">No newsletters were imported.</div>
              ) : (
                <div className="space-y-3">
                  {importedCounts && importedCounts.map((item) => (
                    <div key={item.domain} className="flex items-center gap-3 border-b border-border py-2 animate-fade-in">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${item.domain}`}
                        alt={item.domain}
                        className="h-6 w-6 rounded bg-muted border border-border flex-shrink-0 shadow"
                      />
                      <span className="font-medium text-foreground truncate max-w-[120px]" title={item.domain}>{item.domain}</span>
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold ml-2 flex-shrink-0 animate-fade-in" title="Imported newsletters">
                        {item.count} Imported Newsletter{item.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-8 flex justify-end">
                <Button onClick={onClose} className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 animate-fade-in" aria-label="Close results modal">
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 