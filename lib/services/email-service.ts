import { db } from '@/lib/db';
import { emailAccounts, newsletters } from '@/lib/schema';
import { Client } from '@microsoft/microsoft-graph-client';
import { eq } from 'drizzle-orm';
import { google } from 'googleapis';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import { redis } from '@/lib/redis';

interface NewsletterScore {
  score: number;
  reasons: string[];
  confidence: 'low' | 'medium' | 'high';
}

export class EmailService {
  private gmailClient: any;
  private outlookClient: any;

  // Enhanced newsletter detection patterns
  private readonly NEWSLETTER_PATTERNS = {
    // Strong newsletter indicators (must have at least one)
    strongIndicators: [
      /newsletter/i,
      /digest/i,
      /weekly[\s]?update/i,
      /monthly[\s]?update/i,
      /bulletin/i,
      /subscribe/i,
      /subscription/i,
      /unsubscribe/i,
      /opt[\s-]?out/i,
      /email[\s]?preferences/i,
      /manage[\s]?subscription/i,
      /update[\s]?preferences/i,
      /#\d+/i,
      /issue\s*#?\d+/i,
      /edition\s*#?\d+/i,
      /vol\s*\.?\s*\d+/i,
      /week\s+of/i,
      /weekly\s+digest/i,
      /monthly\s+update/i,
      /\[.*newsletter.*\]/i,
      /newsletter\s*[-:]/i             
    ],

    // Newsletter service domains (strong indicator)
    newsletterDomains: [
      'mailchimp.com', 'constantcontact.com', 'aweber.com', 'getresponse.com',
      'campaignmonitor.com', 'sendinblue.com', 'convertkit.com', 'drip.com',
      'activecampaign.com', 'klaviyo.com', 'omnisend.com', 'mailgun.net',
      'sendgrid.net', 'amazonses.com', 'postmarkapp.com', 'mandrill.com',
      'sparkpost.com', 'mailjet.com', 'sendy.co', 'substack.com',
      'beehiiv.com', 'ghost.org', 'buttondown.email', 'revue.twitter.com',
      'medium.com', 'linkedin.com/newsletter', 'substack.com'
    ],

    // Non-newsletter patterns (immediate disqualification)
    nonNewsletter: [
      // Job-related
      /job[\s]?alert/i,
      /job[\s]?opportunity/i,
      /career[\s]?opportunity/i,
      /position[\s]?available/i,
      /hiring/i,
      /recruitment/i,
      /application/i,
      /resume/i,
      /cv/i,
      /interview/i,
      /linkedin[\s]?jobs/i,
      /indeed/i,
      /glassdoor/i,
      /monster/i,
      /careerbuilder/i,
      /ziprecruiter/i,
      
      // Social media and connection
      /connection[\s]?request/i,
      /new[\s]?connection/i,
      /connect[\s]?with/i,
      /follow[\s]?request/i,
      /new[\s]?follower/i,
      /pinterest/i,
      /quora/i,
      /facebook/i,
      /instagram/i,
      /twitter/i,
      /tiktok/i,
      /snapchat/i,
      
      // Transactional
      /booking[\s]?confirmation/i,
      /order[\s]?confirmation/i,
      /invoice/i,
      /receipt/i,
      /verification/i,
      /security[\s]?alert/i,
      /password[\s]?reset/i,
      /deployment/i,
      /build[\s]?failed/i,
      /payment[\s]?confirmation/i,
      /ticket[\s]?confirmation/i,
      /reservation/i,
      /appointment/i,
      /meeting[\s]?invitation/i,
      /calendar[\s]?invite/i
    ],

    // Marketing patterns (secondary indicators)
    marketing: [
      /promotional/i,
      /marketing/i,
      /campaign/i,
      /announcement/i,
      /special[\s]?offer/i,
      /limited[\s]?time/i,
      /exclusive/i
    ],

    // Automated sender patterns
    automated: [
      /no[\s-]?reply/i,
      /do[\s-]?not[\s-]?reply/i,
      /noreply/i,
      /automated/i,
      /system/i,
      /notification/i
    ]
  };

  // Known newsletter domains and services
  private readonly NEWSLETTER_DOMAINS = [
    'mailchimp.com', 'constantcontact.com', 'aweber.com', 'getresponse.com',
    'campaignmonitor.com', 'sendinblue.com', 'convertkit.com', 'drip.com',
    'activecampaign.com', 'klaviyo.com', 'omnisend.com', 'mailgun.net',
    'sendgrid.net', 'amazonses.com', 'postmarkapp.com', 'mandrill.com',
    'sparkpost.com', 'mailjet.com', 'sendy.co', 'substack.com',
    'beehiiv.com', 'ghost.org', 'buttondown.email', 'revue.twitter.com'
    
  ];

  // Personal email domains (likely not newsletters)
  private readonly PERSONAL_DOMAINS = [
    'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'aol.com',
    'icloud.com', 'me.com', 'live.com', 'msn.com', 'protonmail.com'
  ];

  public constructor() {}

  // Add this new method
  private checkNewsletterSender(fromEmail: string): boolean {
    const newsletterSenders = [
      /^newsletter@/i, /^hello@/i, /^hi@/i, /^team@/i,
      /^updates@/i, /^news@/i, /^digest@/i, /^weekly@/i,
      /^monthly@/i, /^community@/i, /^noreply@/i, /^no-reply@/i
    ];
    
    return newsletterSenders.some(pattern => pattern.test(fromEmail));
  }

  // Add content structure scoring
  private analyzeContentStructure(content: string, htmlContent: string): number {
    let structureScore = 0;
    
    // Check for newsletter structures
    const structures = [
      /unsubscribe[\s\S]*?click/gi,     // Unsubscribe instructions
      /view[\s\S]*?browser/gi,          // View in browser links
      /forward[\s\S]*?friend/gi         // Forward to friend
    ];
    
    structures.forEach(pattern => {
      if (pattern.test(htmlContent) || pattern.test(content)) {
        structureScore += 8;
      }
    });
    
    return Math.min(structureScore, 25);
  }

  // Enhanced newsletter detection with scoring system
  private analyzeNewsletterScore(email: any): NewsletterScore {
    let score = 0;
    const reasons: string[] = [];
    
    const content = (email.text || '').toLowerCase();
    const htmlContent = (email.html || '').toLowerCase();
    const subject = (email.subject || '').toLowerCase();
    const fromEmail = (email.from?.value?.[0]?.address || '').toLowerCase();
    const headers = email.headers || {};

    // 1. Non-newsletter exclusion
    if (this.NEWSLETTER_PATTERNS.nonNewsletter.some(pattern => 
        pattern.test(subject) || pattern.test(content))) {
      return { score: 0, reasons: ['Contains non-newsletter patterns'], confidence: 'low' };
    }

    // 2. Modern platform detection (+50)
    const modernPlatforms = [
      'beehiiv.com', 'beehiiv.net', 'substack.com', 'ghost.org', 'mailerlite.com',
      'flodesk.com', 'mailmodo.com', 'mcsv.net', 'list-manage.com'
    ];
    
    if (modernPlatforms.some(domain => fromEmail.includes(domain))) {
      score += 50;
      reasons.push('Modern newsletter platform detected');
    }

    // 3. Enhanced subject patterns (+30)
    const subjectPatterns = [
      /#\d+/i, /issue\s*#?\d+/i, /edition\s*#?\d+/i, /weekly\s+digest/i,
      /monthly\s+update/i, /\[.*newsletter.*\]/i
    ];
    
    if (subjectPatterns.some(pattern => pattern.test(subject))) {
      score += 30;
      reasons.push('Newsletter subject pattern detected');
    }

    // 4. Newsletter sender patterns (+35)
    if (this.checkNewsletterSender(fromEmail)) {
      score += 35;
      reasons.push('Newsletter sender pattern');
    }

    // 5. Strong newsletter indicators (+40)
    const hasStrongIndicator = this.NEWSLETTER_PATTERNS.strongIndicators.some(pattern => {
      if (pattern.test(content) || pattern.test(htmlContent) || pattern.test(subject)) {
        reasons.push('Contains strong newsletter indicator');
        return true;
      }
      return false;
    });
    if (hasStrongIndicator) score += 40;

    // 6. List-Unsubscribe header (+30)
    if (headers.get && headers.get('list-unsubscribe')) {
      score += 30;
      reasons.push('Has List-Unsubscribe header');
    }

    // 7. Additional newsletter headers (+30 max)
    const newsletterHeaders = [
      'list-help', 'list-archive', 'list-subscribe', 
      'precedence', 'x-campaign-id', 'x-mailgun-tag'
    ];

    let headerScore = 0;
    newsletterHeaders.forEach(header => {
      if (headers.get && headers.get(header)) {
        headerScore += 10;
      }
    });

    if (headerScore > 0) {
      score += Math.min(headerScore, 30);
      reasons.push(`Newsletter headers detected (+${Math.min(headerScore, 30)} points)`);
    }

    // 8. Newsletter service domains (+25)
    const senderDomain = this.extractDomain(fromEmail);
    if (this.NEWSLETTER_PATTERNS.newsletterDomains.some(domain => 
        senderDomain.includes(domain) || fromEmail.includes(domain))) {
      score += 25;
      reasons.push('Sent from known newsletter service');
    }

    // 9. Content structure analysis (+25 max)
    const structureScore = this.analyzeContentStructure(content, htmlContent);
    if (structureScore > 0) {
      score += structureScore;
      reasons.push(`Newsletter structure detected (+${structureScore} points)`);
    }

    // 10. Marketing patterns (+15)
    if (this.NEWSLETTER_PATTERNS.marketing.some(pattern => 
        pattern.test(subject) || pattern.test(content))) {
      score += 15;
      reasons.push('Contains marketing language');
    }

    // 11. Automated sender patterns (+10)
    if (this.NEWSLETTER_PATTERNS.automated.some(pattern => pattern.test(fromEmail))) {
      score += 10;
      reasons.push('Automated sender address');
    }

    // 12. Analyze link density (+10 for high density)
    const linkCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
    const htmlLinkCount = (htmlContent.match(/<a\s+[^>]*href/gi) || []).length;
    const totalLinks = Math.max(linkCount, htmlLinkCount);
    
    if (totalLinks > 5) {
      score += 10;
      reasons.push(`High link density (${totalLinks} links)`);
    }

    // 13. Check for HTML-heavy content (+8)
    if (htmlContent && htmlContent.length > content.length * 2) {
      score += 8;
      reasons.push('HTML-heavy content');
    }

    // 14. Personal email domains (-30) - Reduced penalty for preview
    if (fromEmail.includes('gmail.com') || fromEmail.includes('outlook.com') || 
        fromEmail.includes('yahoo.com') || fromEmail.includes('hotmail.com')) {
      score -= 15; // Reduced from -30
      reasons.push('Sent from personal email domain (reduced penalty)');
    }

    // 15. Very short content (-20) - Reduced penalty for preview
    const totalContentLength = content.length + htmlContent.length;
    if (totalContentLength < 100) {
      score -= 10; // Reduced from -20
      reasons.push(`Very short content (${totalContentLength} chars, reduced penalty)`);
    }

    // Determine confidence level
    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (score >= 60) confidence = 'high';
    else if (score >= 40) confidence = 'medium';

    return { score, reasons, confidence };
  }

  public extractDomain(email: string): string {
    if (!email || typeof email !== 'string') {
      return '';
    }
    
    const match = email.match(/@([^>]+)/);
    return match ? match[1].toLowerCase() : '';
  }

  // Enhanced newsletter detection method with higher threshold
  private isNewsletter(email: any, threshold: number = 35): boolean {
    const analysis = this.analyzeNewsletterScore(email);
    
    // Only log confirmed newsletters
    if (analysis.score >= threshold) {
      console.log('📧 Newsletter Found:', {
        subject: email.subject,
        from: email.from?.text || 'Unknown',
        domain: this.extractDomain(email.from?.value?.[0]?.address || ''),
        confidence: analysis.confidence,
        score: analysis.score,
        reasons: analysis.reasons
      });
    }

    return analysis.score >= threshold;
  }

  // Batch processing for better performance
  private async processEmailBatch(emails: any[], batchSize: number = 50): Promise<any[]> {
    const newsletters = [];
    
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (email) => {
          try {
            return await this.processSingleEmail(email);
          } catch (error) {
            console.error(`Error processing email ${email.id}:`, error);
            return null;
          }
        })
      );
      
      newsletters.push(...batchResults.filter(Boolean));
      
      // Add small delay between batches to respect API limits
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return newsletters;
  }

  private async processSingleEmail(email: any): Promise<any | null> {
    const parsed = await simpleParser(email.raw || email.body?.content || '');
    
    if (!this.isNewsletter(parsed)) {
      return null;
    }

    return {
      messageId: email.id,
      parsed,
      analysis: this.analyzeNewsletterScore(parsed)
    };
  }

  // Enhanced Gmail newsletter fetching with better search queries
  private async fetchGmailNewsletters(account: any) {
    const oauth2Client = this.getGmailOAuth2Client();
    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Enhanced search queries for better newsletter detection
    const searchQueries = [
      'category:promotions',
      'category:updates',
      'label:newsletters',
      'has:unsubscribe',
      'has:list-unsubscribe',
      'subject:(newsletter OR digest OR update OR bulletin)',
      'from:(mailchimp.com OR constantcontact.com OR substack.com OR beehiiv.com OR buttondown.email)',
      'from:(noreply OR no-reply OR newsletter)',
      '-category:personal -category:social -category:forums -category:primary',
      'has:list-unsubscribe',
      'from:(newsletter OR digest OR weekly OR monthly)',
      'from:(hello@ OR hi@ OR team@ OR noreply@)',
      'from:(beehiiv.com OR substack.com OR ghost.org)',
      'subject:(#* OR issue OR edition OR weekly)',
      '{unsubscribe newsletter}',
      '{from:(hello@ OR team@) has:list-unsubscribe}'
    ];

    const allMessages = new Set();
    let processedCount = 0;
    
    // Collect messages from all search queries
    for (const query of searchQueries) {
      try {
        const response = await gmail.users.messages.list({
          userId: 'me',
          q: query,
          maxResults: 50
        });

        if (response.data.messages) {
          response.data.messages.forEach(msg => allMessages.add(msg.id));
          console.log(`Found ${response.data.messages.length} messages for query: ${query}`);
        }
      } catch (error) {
        console.warn(`Gmail search query failed: ${query}`, error);
      }
    }

    console.log(`\n📧 Found ${allMessages.size} potential newsletter messages`);

    // Process messages in smaller batches
    const messageIds = Array.from(allMessages);

    for (let i = 0; i < messageIds.length; i += 5) {
      const batch = messageIds.slice(i, i + 5);
      
      for (const messageId of batch) {
        try {
          const email = await gmail.users.messages.get({
            userId: 'me',
            id: messageId as string,
            format: 'full',
          });

          const emailData = this.extractGmailData(email.data);
          
          // Skip if email data is invalid
          if (!emailData || !emailData.from) {
            console.log(`⏭️ Skipping email with invalid data: ${messageId}`);
            continue;
          }
          
          // Add account information to emailData
          emailData.userId = account.userId;
          emailData.emailAccountId = account.id;

          // Parse and analyze the email
          const analysis = this.analyzeNewsletterScore(emailData);
          
          console.log(`📧 Email: "${emailData.subject}" from ${emailData.from?.emailAddress?.address} - Score: ${analysis.score}, Confidence: ${analysis.confidence}`);
          
          if (analysis.score >= 25) {
            // Check if already exists
            const existing = await db.query.newsletters.findFirst({
              where: eq(newsletters.messageId, messageId as string),
            });

            if (!existing) {
              try {
                // Store in database
                await db.insert(newsletters).values({
                  userId: emailData.userId,
                  emailAccountId: emailData.emailAccountId,
                  messageId: messageId as string,
                  title: emailData.subject || '',
                  sender: emailData.from?.text || '',
                  senderEmail: emailData.from?.value?.[0]?.address || '',
                  subject: emailData.subject || '',
                  content: emailData.text || '',
                  htmlContent: emailData.html || '',
                  receivedAt: emailData.date || new Date(),
                  importedAt: new Date(),
                  isRead: false,
                  isStarred: false,
                  isArchived: false,
                });

                // Apply newsletter mode if enabled
                if (account.newsletterMode) {
                  await gmail.users.messages.modify({
                    userId: 'me',
                    id: messageId as string,
                    requestBody: {
                      addLabelIds: ['Label_Newsletters'],
                      removeLabelIds: ['INBOX'],
                    },
                  });
                }

                processedCount++;
                console.log(`✅ Stored newsletter: "${emailData.subject}"`);
              } catch (error) {
                console.error(`Failed to store newsletter ${emailData.subject}: ${messageId}:`, error);
              }
            } else {
              console.log(`⏭️ Newsletter already exists: "${emailData.subject}"`);
            }
          }
        } catch (error) {
          console.error(`Failed to process email ${messageId}:`, error);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n📧 Summary:`);
    console.log(`- Found ${allMessages.size} potential newsletters`);
    console.log(`- Processed ${processedCount} new newsletters`);
  }

  // Make extractGmailData public
  public extractGmailData(gmailMessage: any): any {
    if (!gmailMessage || !gmailMessage.payload) {
      return null;
    }

    const payload = gmailMessage.payload;
    const headers = payload.headers || [];
    
    // Extract headers
    const getHeader = (name: string) => {
      const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : null;
    };

    // Extract body content
    let textContent = '';
    let htmlContent = '';
    
    const extractBody = (part: any) => {
      if (part.body && part.body.data) {
        const content = Buffer.from(part.body.data, 'base64').toString('utf-8');
        if (part.mimeType === 'text/plain') {
          textContent += content;
        } else if (part.mimeType === 'text/html') {
          htmlContent += content;
        }
      }
      
      if (part.parts) {
        part.parts.forEach(extractBody);
      }
    };

    extractBody(payload);

    // Parse sender information
    const fromHeader = getHeader('from') || '';
    const fromMatch = fromHeader.match(/^(.+?)\s*<(.+?)>$/) || fromHeader.match(/^(.+)$/);
    
    const fromData = {
      text: fromHeader,
      value: fromMatch ? [{
        name: fromMatch[1]?.trim() || '',
        address: fromMatch[2]?.trim() || fromMatch[1]?.trim() || ''
      }] : [{ name: '', address: fromHeader }]
    };

    // Create email object similar to what simpleParser would return
    return {
      messageId: gmailMessage.id,
      subject: getHeader('subject') || '',
      from: fromData,
      text: textContent,
      html: htmlContent,
      date: new Date(parseInt(gmailMessage.internalDate) || Date.now()),
      headers: {
        get: (name: string) => getHeader(name)
      }
    };
  }

  // Enhanced Outlook newsletter fetching
  private async fetchOutlookNewsletters(account: any) {
    const client = Client.init({
      authProvider: (done) => {
        done(null, account.accessToken);
      },
    });

    // Use the same search strategy as Gmail but adapted for Outlook
    const searchQueries = [
      // Category-based searches (Outlook equivalent of Gmail categories)
      "categories/any(c:c eq 'promotions')",
      "categories/any(c:c eq 'updates')", 
      "categories/any(c:c eq 'newsletters')",
      
      // Subject-based searches (individual filters to avoid syntax issues)
      "contains(subject,'newsletter')",
      "contains(subject,'digest')",
      "contains(subject,'update')",
      "contains(subject,'bulletin')",
      "contains(subject,'issue')",
      "contains(subject,'edition')",
      "contains(subject,'weekly')",
      
      // Sender-based searches (individual filters)
      "contains(from/emailAddress/address,'mailchimp.com')",
      "contains(from/emailAddress/address,'constantcontact.com')",
      "contains(from/emailAddress/address,'substack.com')",
      "contains(from/emailAddress/address,'beehiiv.com')",
      "contains(from/emailAddress/address,'noreply')",
      "contains(from/emailAddress/address,'no-reply')",
      "contains(from/emailAddress/address,'hello@')",
      "contains(from/emailAddress/address,'team@')",
      "contains(from/emailAddress/address,'ghost.org')",
      
      // Low importance emails (Outlook equivalent of Gmail promotions)
      "importance eq 'low' and hasAttachments eq false",
      
      // Recent emails (last 30 days)
      `receivedDateTime ge ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}`
    ];

    const allMessages = new Map();

    for (const filter of searchQueries) {
      try {
        const messages = await client
          .api('/me/messages')
          .filter(filter)
          .top(100)
          .get();

        messages.value.forEach((msg: any) => allMessages.set(msg.id, msg));
      } catch (error) {
        console.warn(`Outlook search filter failed: ${filter}`, error);
      }
    }

    // Also try searching by categories using a different approach
    try {
      const categoryMessages = await client
        .api('/me/messages')
        .filter("categories/any(c:c eq 'newsletters')")
        .top(100)
        .get();
      
      categoryMessages.value.forEach((msg: any) => allMessages.set(msg.id, msg));
    } catch (error) {
      console.warn('Outlook category search failed, trying alternative approach:', error);
      
      // Fallback: search for emails with specific subjects that are likely newsletters
      try {
        const fallbackMessages = await client
          .api('/me/messages')
          .filter("contains(subject,'newsletter') or contains(subject,'digest') or contains(subject,'update')")
          .top(100)
          .get();
        
        fallbackMessages.value.forEach((msg: any) => allMessages.set(msg.id, msg));
      } catch (fallbackError) {
        console.warn('Outlook fallback search also failed:', fallbackError);
      }
    }

    console.log(`Found ${allMessages.size} potential newsletter messages in Outlook`);

    // Process messages
    const processedNewsletters = [];
    
    for (const [id, message] of allMessages) {
      try {
        const fullMessage = await client
          .api(`/me/messages/${id}`)
          .get();

        const emailData = {
          id,
          body: fullMessage.body,
          subject: fullMessage.subject,
          from: fullMessage.from,
          receivedDateTime: fullMessage.receivedDateTime
        };

        const processedEmail = await this.processSingleEmail(emailData);
        if (processedEmail) {
          processedNewsletters.push(processedEmail);
        }
      } catch (error) {
        console.error(`Error processing Outlook email ${id}:`, error);
      }
    }

    // Save and declutter
    for (const newsletter of processedNewsletters) {
      const existing = await db.query.newsletters.findFirst({
        where: eq(newsletters.messageId, newsletter.messageId),
      });

      if (!existing) {
        if (account.newsletterMode) {
          try {
            await client
              .api(`/me/messages/${newsletter.messageId}/move`)
              .post({
                destinationId: 'newsletters',
              });
          } catch (error) {
            console.warn(`Failed to move Outlook email ${newsletter.messageId}:`, error);
          }
        }

        await db.insert(newsletters).values({
          userId: account.userId,
          emailAccountId: account.id,
          messageId: newsletter.messageId,
          title: newsletter.parsed.subject || '',
          sender: newsletter.parsed.from?.text || '',
          senderEmail: newsletter.parsed.from?.value[0]?.address || '',
          subject: newsletter.parsed.subject || '',
          content: newsletter.parsed.text || '',
          htmlContent: newsletter.parsed.html || '',
          receivedAt: newsletter.parsed.date || new Date(),
          importedAt: new Date(),
          isRead: false,
          isStarred: false,
          isArchived: false,
        });
      }
    }

    console.log(`Processed ${processedNewsletters.length} newsletters for Outlook account`);
  }

  // Rest of the methods remain the same...
  private getGmailOAuth2Client() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  private getOutlookOAuth2Client() {
    return Client.init({
      authProvider: (done) => {
        done(null, process.env.OUTLOOK_ACCESS_TOKEN || '');
      },
    });
  }

  async getGmailAuthUrl(): Promise<string> {
    const oauth2Client = this.getGmailOAuth2Client();
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  async getOutlookAuthUrl(): Promise<string> {
    if (!process.env.OUTLOOK_CLIENT_ID) {
      throw new Error('OUTLOOK_CLIENT_ID is not configured');
    }
    if (!process.env.OUTLOOK_REDIRECT_URI) {
      throw new Error('OUTLOOK_REDIRECT_URI is not configured');
    }

    const scopes = [
      'offline_access',
      'Mail.Read',
      'User.Read',
    ];

    const scopeString = encodeURIComponent(scopes.join(' '));
    const clientId = encodeURIComponent(process.env.OUTLOOK_CLIENT_ID);
    const redirectUri = encodeURIComponent(process.env.OUTLOOK_REDIRECT_URI);

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scopeString}&` +
      `response_mode=query&` +
      `state=outlook`;

    console.log('🔗 Generated Outlook auth URL:', authUrl.substring(0, 100) + '...');
    
    return authUrl;
  }

  async handleGmailCallback(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const oauth2Client = this.getGmailOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    
    return {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiresAt: new Date(tokens.expiry_date!),
    };
  }

  async handleOutlookCallback(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    console.log('🔐 Processing Outlook callback with code:', code.substring(0, 10) + '...');
    
    // Validate environment variables
    if (!process.env.OUTLOOK_CLIENT_ID) {
      throw new Error('OUTLOOK_CLIENT_ID is not configured');
    }
    if (!process.env.OUTLOOK_CLIENT_SECRET) {
      throw new Error('OUTLOOK_CLIENT_SECRET is not configured');
    }
    if (!process.env.OUTLOOK_REDIRECT_URI) {
      throw new Error('OUTLOOK_REDIRECT_URI is not configured');
    }

    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    const tokenData = new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID,
      client_secret: process.env.OUTLOOK_CLIENT_SECRET,
      code,
      redirect_uri: process.env.OUTLOOK_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    console.log('📡 Requesting tokens from Microsoft OAuth endpoint...');
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Token request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // Try to parse error response
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      throw new Error(`Outlook OAuth failed: ${errorData.error || errorData.error_description || response.statusText}`);
    }

    const tokens = await response.json();
    
    if (!tokens.access_token) {
      console.error('❌ No access token in response:', tokens);
      throw new Error('No access token received from Microsoft OAuth');
    }

    console.log('✅ Successfully obtained Outlook tokens');
    
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(Date.now() + (tokens.expires_in || 3600) * 1000),
    };
  }

  async syncNewsletters(accountId: number) {
    const account = await db.query.emailAccounts.findFirst({
      where: eq(emailAccounts.id, accountId),
    });

    if (!account) {
      throw new Error('Account not found');
    }

      if (account.provider === 'gmail') {
      return await this.fetchGmailNewsletters(account);
      } else if (account.provider === 'outlook') {
      return await this.fetchOutlookNewsletters(account);
    } else {
      throw new Error('Unsupported email provider');
    }
  }

  async syncNewslettersFromWhitelistedDomains(accountId: number, whitelistedDomains: string[]) {
    const account = await db.query.emailAccounts.findFirst({
      where: eq(emailAccounts.id, accountId),
    });

    if (!account) {
      throw new Error('Account not found');
    }

    if (whitelistedDomains.length === 0) {
      console.log('No whitelisted domains found, skipping sync');
      return { syncedCount: 0, message: 'No whitelisted domains found' };
    }

    console.log(`🔄 Syncing newsletters from whitelisted domains: ${whitelistedDomains.join(', ')}`);

    let syncedCount = 0;
    let totalProcessed = 0;

    if (account.provider === 'gmail') {
      // If you want to support domain-based sync with Redis, implement similar logic as for emails
      // For now, call the original domain-based method (no Redis progress)
      // const result = await this.fetchGmailNewslettersFromWhitelistedDomains(account, whitelistedDomains, redisKey, progressTTL);
      const result = await this.fetchGmailNewslettersFromWhitelistedEmails(account, whitelistedDomains);
      syncedCount = result.syncedCount;
      totalProcessed = result.totalProcessed;
    } else if (account.provider === 'outlook') {
      // const result = await this.fetchOutlookNewslettersFromWhitelistedDomains(account, whitelistedDomains, redisKey, progressTTL);
      const result = await this.fetchOutlookNewslettersFromWhitelistedEmails(account, whitelistedDomains);
      syncedCount = result.syncedCount;
      totalProcessed = result.totalProcessed;
    } else {
      throw new Error('Unsupported email provider');
    }

    console.log(`✅ Synced ${syncedCount} newsletters from ${totalProcessed} processed emails`);
    return { syncedCount, totalProcessed };
  }

  async syncNewslettersFromWhitelistedEmails(accountId: number, whitelistedEmails: string[]) {
    const account = await db.query.emailAccounts.findFirst({
      where: eq(emailAccounts.id, accountId),
    });

    if (!account) {
      throw new Error('Account not found');
    }

    if (whitelistedEmails.length === 0) {
      console.log('No whitelisted emails found, skipping sync');
      return { 
        syncedCount: 0, 
        message: 'No whitelisted emails found',
        emailResults: [],
        totalEmailsProcessed: 0
      };
    }

    const redisKey = `sync:${account.userId}:${account.id}`;
    const progressTTL = 60 * 60; // 1 hour

    // Initialize progress in Redis
    await redis.set(redisKey, JSON.stringify({
      status: 'syncing',
      syncedCount: 0,
      totalProcessed: 0,
      emailResults: [],
      progress: 0,
      error: null
    }), 'EX', progressTTL);

    let syncedCount = 0;
    let totalProcessed = 0;
    let emailResults: Array<{
      email: string;
      newslettersFound: number;
      status: 'success' | 'error' | 'skipped';
      error?: string;
    }> = [];

    try {
      if (account.provider === 'gmail') {
        const result = await this.fetchGmailNewslettersFromWhitelistedEmails(account, whitelistedEmails, redisKey, progressTTL);
        syncedCount = result.syncedCount;
        totalProcessed = result.totalProcessed;
        emailResults = result.emailResults || [];
      } else if (account.provider === 'outlook') {
        const result = await this.fetchOutlookNewslettersFromWhitelistedEmails(account, whitelistedEmails, redisKey, progressTTL);
        syncedCount = result.syncedCount;
        totalProcessed = result.totalProcessed;
        emailResults = result.emailResults || [];
      } else {
        throw new Error('Unsupported email provider');
      }

      // Final progress update
      await redis.set(redisKey, JSON.stringify({
        status: 'success',
        syncedCount,
        totalProcessed,
        emailResults,
        progress: 100,
        error: null
      }), 'EX', progressTTL);

      console.log(`✅ Synced ${syncedCount} newsletters from ${totalProcessed} processed emails`);
      return { 
        syncedCount, 
        totalProcessed, 
        emailResults,
        totalEmailsProcessed: emailResults.length
      };
    } catch (error) {
      await redis.set(redisKey, JSON.stringify({
        status: 'error',
        syncedCount,
        totalProcessed,
        emailResults,
        progress: 100,
        error: error instanceof Error ? error.message : 'Unknown error'
      }), 'EX', progressTTL);
      console.error('Error syncing newsletters from whitelisted emails:', error);
      throw error;
    }
  }

  // Accept progressTTL as a parameter for correct scoping
  private async fetchGmailNewslettersFromWhitelistedEmails(account: any, whitelistedEmails: string[], redisKey?: string, progressTTL?: number) {
    const client = await this.getGmailClient(account);
    let syncedCount = 0;
    let totalProcessed = 0;
    const emailResults: Array<{
      email: string;
      newslettersFound: number;
      status: 'success' | 'error' | 'skipped';
      error?: string;
    }> = [];

    try {
      // Get recent emails (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const query = `after:${thirtyDaysAgo.toISOString().split('T')[0]}`;

      const response = await client.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 500,
      });

      const messages = response.data.messages || [];
      console.log(`📧 Found ${messages.length} emails to process`);

      // Process emails in batches
      const batchSize = 50;
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        const batchResults = await this.processGmailBatchFromWhitelistedEmails(client, batch, whitelistedEmails, account);
        syncedCount += batchResults.syncedCount;
        totalProcessed += batchResults.totalProcessed;
        if (batchResults.emailResults) {
          emailResults.push(...batchResults.emailResults);
        }
        // Update progress in Redis after each batch
        if (redisKey && progressTTL) {
          const progress = Math.round(((i + batch.length) / messages.length) * 100);
          await redis.set(redisKey, JSON.stringify({
            status: 'syncing',
            syncedCount,
            totalProcessed,
            emailResults,
            progress,
            error: null
          }), 'EX', progressTTL);
        }
      }

      return { syncedCount, totalProcessed, emailResults };
    } catch (error) {
      console.error('Error fetching Gmail newsletters from whitelisted emails:', error);
      throw error;
    }
  }

  private async fetchOutlookNewslettersFromWhitelistedEmails(account: any, whitelistedEmails: string[], redisKey?: string, progressTTL?: number) {
    const client = await this.getOutlookClient(account);
    let syncedCount = 0;
    let totalProcessed = 0;
    const emailResults: Array<{
      email: string;
      newslettersFound: number;
      status: 'success' | 'error' | 'skipped';
      error?: string;
    }> = [];

    try {
      // Get recent emails (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const response = await client.api('/me/messages')
        .filter(`receivedDateTime ge ${thirtyDaysAgo.toISOString()}`)
        .top(500)
        .get();

      const messages = response.value || [];
      console.log(`📧 Found ${messages.length} emails to process`);

      // Process emails in batches
      const batchSize = 50;
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        const batchResults = await this.processOutlookBatchFromWhitelistedEmails(client, batch, whitelistedEmails, account);
        syncedCount += batchResults.syncedCount;
        totalProcessed += batchResults.totalProcessed;
        if (batchResults.emailResults) {
          emailResults.push(...batchResults.emailResults);
        }
        // Update progress in Redis after each batch
        if (redisKey && progressTTL) {
          const progress = Math.round(((i + batch.length) / messages.length) * 100);
          await redis.set(redisKey, JSON.stringify({
            status: 'syncing',
            syncedCount,
            totalProcessed,
            emailResults,
            progress,
            error: null
          }), 'EX', progressTTL);
        }
      }

      return { syncedCount, totalProcessed, emailResults };
    } catch (error) {
      console.error('Error fetching Outlook newsletters from whitelisted emails:', error);
      throw error;
    }
  }

  private async processGmailBatchFromWhitelistedEmails(client: any, messageIds: any[], whitelistedEmails: string[], account: any) {
    let syncedCount = 0;
    let totalProcessed = 0;
    const emailResults: Array<{
      email: string;
      newslettersFound: number;
      status: 'success' | 'error' | 'skipped';
      error?: string;
    }> = [];

    for (const messageId of messageIds) {
      let senderEmail = '';
      try {
        const message = await client.users.messages.get({
          userId: 'me',
          id: messageId.id,
          format: 'full',
        });

        const emailData = this.extractGmailData(message.data);
        
        // Skip if email data is invalid
        if (!emailData || !emailData.from) {
          console.log(`⏭️ Skipping email with invalid data: ${messageId.id}`);
          continue;
        }
        
        // Add account information to emailData
        emailData.userId = account.userId;
        emailData.emailAccountId = account.id;
        
        // Extract sender email from the emailData structure
        senderEmail = emailData.from.value?.[0]?.address || emailData.from.text || '';
        if (!senderEmail) {
          console.log(`⏭️ Skipping email with no sender address: ${messageId.id}`);
          continue;
        }
        
        // Check if sender email is in whitelist
        if (!whitelistedEmails.includes(senderEmail)) {
          console.log(`⏭️ Skipping email from non-whitelisted email: ${senderEmail}`);
          continue;
        }

        totalProcessed++;

        // Check if it's a newsletter
        if (this.isNewsletter(emailData)) {
          // Check if newsletter already exists
          const existingNewsletter = await db.query.newsletters.findFirst({
            where: eq(newsletters.messageId, messageId.id),
          });

          if (!existingNewsletter) {
            // Insert newsletter
            await db.insert(newsletters).values({
              userId: emailData.userId,
              emailAccountId: emailData.emailAccountId,
              messageId: messageId.id,
              title: emailData.subject, // Use subject as title
              subject: emailData.subject,
              sender: emailData.from.text || senderEmail,
              senderEmail: senderEmail,
              content: emailData.text || '',
              htmlContent: emailData.html || '',
              receivedAt: emailData.date,
              isRead: false,
              isStarred: false,
              isArchived: false,
              importedAt: new Date(),
            });
            syncedCount++;
            console.log(`✅ Synced newsletter: ${emailData.subject} from ${senderEmail}`);
            emailResults.push({
              email: senderEmail,
              newslettersFound: 1,
              status: 'success',
            });
          }
        } else {
          // Not a newsletter, mark as skipped
          emailResults.push({
            email: senderEmail,
            newslettersFound: 0,
            status: 'skipped',
          });
        }
      } catch (error) {
        console.error(`Error processing Gmail message ${messageId.id}:`, error);
        emailResults.push({
          email: senderEmail || 'unknown',
          newslettersFound: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { syncedCount, totalProcessed, emailResults };
  }

  private async processOutlookBatchFromWhitelistedEmails(client: any, messages: any[], whitelistedEmails: string[], account: any) {
    let syncedCount = 0;
    let totalProcessed = 0;
    const emailResults: Array<{
      email: string;
      newslettersFound: number;
      status: 'success' | 'error' | 'skipped';
      error?: string;
    }> = [];

    for (const message of messages) {
      let senderEmail = '';
      try {
        // Extract sender email from the message structure
        senderEmail = message.from?.emailAddress?.address || '';
        if (!senderEmail) {
          console.log(`⏭️ Skipping email with no sender address: ${message.id}`);
          continue;
        }
        
        // Check if sender email is in whitelist
        if (!whitelistedEmails.includes(senderEmail)) {
          console.log(`⏭️ Skipping email from non-whitelisted email: ${senderEmail}`);
          continue;
        }

        totalProcessed++;

        // Check if it's a newsletter
        const emailData = {
          subject: message.subject || '',
          from: {
            text: message.from?.emailAddress?.name || senderEmail,
            value: [{
              address: senderEmail,
              name: message.from?.emailAddress?.name || ''
            }]
          },
          text: message.body?.content || '',
          html: message.body?.content || '',
          date: new Date(message.receivedDateTime),
          userId: account.userId,
          emailAccountId: account.id,
        };

        if (this.isNewsletter(emailData)) {
          // Check if newsletter already exists
          const existingNewsletter = await db.query.newsletters.findFirst({
            where: eq(newsletters.messageId, message.id),
          });

          if (!existingNewsletter) {
            // Insert newsletter
            await db.insert(newsletters).values({
              userId: emailData.userId,
              emailAccountId: emailData.emailAccountId,
              messageId: message.id,
              title: emailData.subject,
              subject: emailData.subject,
              sender: emailData.from.text || senderEmail,
              senderEmail: senderEmail,
              content: emailData.text || '',
              htmlContent: emailData.html || '',
              receivedAt: emailData.date,
              isRead: false,
              isStarred: false,
              isArchived: false,
              importedAt: new Date(),
            });
            syncedCount++;
            console.log(`✅ Synced newsletter: ${emailData.subject} from ${senderEmail}`);
            emailResults.push({
              email: senderEmail,
              newslettersFound: 1,
              status: 'success',
            });
          }
        } else {
          // Not a newsletter, mark as skipped
          emailResults.push({
            email: senderEmail,
            newslettersFound: 0,
            status: 'skipped',
          });
        }
      } catch (error) {
        console.error(`Error processing Outlook message ${message.id}:`, error);
        emailResults.push({
          email: senderEmail || 'unknown',
          newslettersFound: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { syncedCount, totalProcessed, emailResults };
  }

  // Add these public methods
  public async getGmailClient(account: any) {
    const oauth2Client = this.getGmailOAuth2Client();
    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });
    return google.gmail({ version: 'v1', auth: oauth2Client });
  }

  public async getOutlookClient(account: any) {
    // Check if token is expired and refresh if needed
    if (account.tokenExpiresAt && new Date() >= new Date(account.tokenExpiresAt)) {
      console.log('🔄 Outlook access token expired, refreshing...');
      await this.refreshAccessToken(account.id);
      
      // Fetch the updated account with new token
      const updatedAccount = await db.query.emailAccounts.findFirst({
        where: eq(emailAccounts.id, account.id),
      });
      
      if (!updatedAccount) {
        throw new Error('Failed to fetch updated account after token refresh');
      }
      
      account = updatedAccount;
    }

    return Client.init({
      authProvider: (done) => {
        done(null, account.accessToken);
      },
    });
  }

  public static async sendPasswordResetEmail(to: string, resetLink: string) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@newsletter.com',
      to,
      subject: 'Reset your password',
      html: `<p>Hello,</p>
        <p>You requested a password reset for your account.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
        <p>Thanks,<br/>The Newsletter Team</p>`
    });
  }

  async refreshAccessToken(accountId: number) {
    const account = await db.query.emailAccounts.findFirst({
      where: eq(emailAccounts.id, accountId),
    });

    if (!account) {
      throw new Error('Email account not found');
    }

    try {
      if (account.provider === 'gmail') {
        const oauth2Client = this.getGmailOAuth2Client();
        oauth2Client.setCredentials({
          refresh_token: account.refreshToken,
        });

        const { credentials } = await oauth2Client.refreshAccessToken();
        
        await db
          .update(emailAccounts)
          .set({
            accessToken: credentials.access_token || '',
            tokenExpiresAt: new Date(credentials.expiry_date!),
          })
          .where(eq(emailAccounts.id, accountId));
      } else if (account.provider === 'outlook') {
        const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.OUTLOOK_CLIENT_ID!,
            client_secret: process.env.OUTLOOK_CLIENT_SECRET!,
            refresh_token: account.refreshToken,
            grant_type: 'refresh_token',
          }),
        });

        const tokens = await response.json();
        
        await db
          .update(emailAccounts)
          .set({
            accessToken: tokens.access_token,
            tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          })
          .where(eq(emailAccounts.id, accountId));
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  async getUserInfo(provider: 'gmail' | 'outlook', accessToken: string) {
    console.log(`👤 Getting user info for ${provider}...`);
    
    if (provider === 'gmail') {
      const oauth2Client = this.getGmailOAuth2Client();
      oauth2Client.setCredentials({ access_token: accessToken });
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const profile = await gmail.users.getProfile({ userId: 'me' });
      console.log('✅ Gmail user info obtained:', profile.data.emailAddress);
      return { email: profile.data.emailAddress! };
    } else if (provider === 'outlook') {
      try {
        const client = Client.init({
          authProvider: (done) => {
            done(null, accessToken);
          },
        });
        
        console.log('📡 Requesting Outlook user info...');
        const user = await client.api('/me').get();
        
        const email = user.mail || user.userPrincipalName;
        if (!email) {
          throw new Error('No email address found in Outlook user info');
        }
        
        console.log('✅ Outlook user info obtained:', email);
        return { email };
      } catch (error) {
        console.error('❌ Error getting Outlook user info:', error);
        throw new Error(`Failed to get Outlook user info: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    throw new Error('Invalid provider');
  }

  // Add this new method
  async previewNewsletters(account: any) {
    try {
      if (account.provider === 'gmail') {
        return await this.previewGmailNewsletters(account);
      } else if (account.provider === 'outlook') {
        return await this.previewOutlookNewsletters(account);
      }
      throw new Error('Unsupported provider');
    } catch (error) {
      console.error('Error previewing newsletters:', error);
      throw error;
    }
  }

  private async previewGmailNewsletters(account: any) {
    const oauth2Client = this.getGmailOAuth2Client();
    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Enhanced search queries for better newsletter detection
    const searchQueries = [
      'category:promotions',
      'category:updates',
      'label:newsletters',
      'has:unsubscribe',
      'has:list-unsubscribe',
      'subject:(newsletter OR digest OR update OR bulletin)',
      'from:(mailchimp.com OR constantcontact.com OR substack.com OR beehiiv.com OR buttondown.email)',
      'from:(noreply OR no-reply OR newsletter)',
      '-category:personal -category:social -category:forums -category:primary',
      'has:list-unsubscribe',
      'from:(newsletter OR digest OR weekly OR monthly)',
      'from:(hello@ OR hi@ OR team@ OR noreply@)',
      'from:(beehiiv.com OR substack.com OR ghost.org)',
      'subject:(#* OR issue OR edition OR weekly)',
      '{unsubscribe newsletter}',
      '{from:(hello@ OR team@) has:list-unsubscribe}'
    ];

    const allMessages = new Set();
    
    // Collect messages from all search queries
    for (const query of searchQueries) {
      try {
        const response = await gmail.users.messages.list({
          userId: 'me',
          q: query,
          maxResults: 50
        });

        if (response.data.messages) {
          response.data.messages.forEach(msg => allMessages.add(msg.id));
        }
      } catch (error) {
        console.warn(`Gmail search query failed: ${query}`, error);
      }
    }

    const newsletters = [];
    const messageIds = Array.from(allMessages);

    for (let i = 0; i < messageIds.length; i += 5) {
      const batch = messageIds.slice(i, i + 5);
      
      for (const messageId of batch) {
        try {
          const email = await gmail.users.messages.get({
            userId: 'me',
            id: messageId as string,
            format: 'full',
          });

          const emailData = this.extractGmailData(email.data);
          
          if (!emailData) {
            continue;
          }

          const analysis = this.analyzeNewsletterScore(emailData);
          
          console.log(`📧 Email: "${emailData.subject}" from ${emailData.from?.emailAddress?.address} - Score: ${analysis.score}, Confidence: ${analysis.confidence}`);
          
          if (analysis.score >= 25) {
            newsletters.push({
              id: messageId,
              subject: emailData.subject,
              from: emailData.from,
              date: emailData.date,
              score: analysis.score,
              confidence: analysis.confidence
            });
            console.log(`✅ Found newsletter: "${emailData.subject}" (Score: ${analysis.score})`);
          }
        } catch (error) {
          console.error(`Failed to process email ${messageId}:`, error);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return newsletters;
  }

  private async previewOutlookNewsletters(account: any) {
    const client = Client.init({
      authProvider: (done) => {
        done(null, account.accessToken);
      },
    });

    console.log('🔍 Starting Outlook newsletter preview search...');

    // Use the same search strategy as Gmail but adapted for Outlook
    const searchQueries = [
      // Category-based searches (Outlook equivalent of Gmail categories)
      "categories/any(c:c eq 'promotions')",
      "categories/any(c:c eq 'updates')", 
      "categories/any(c:c eq 'newsletters')",
      
      // Subject-based searches (individual filters to avoid syntax issues)
      "contains(subject,'newsletter')",
      "contains(subject,'digest')",
      "contains(subject,'update')",
      "contains(subject,'bulletin')",
      "contains(subject,'issue')",
      "contains(subject,'edition')",
      "contains(subject,'weekly')",
      
      // Sender-based searches (individual filters)
      "contains(from/emailAddress/address,'mailchimp.com')",
      "contains(from/emailAddress/address,'constantcontact.com')",
      "contains(from/emailAddress/address,'substack.com')",
      "contains(from/emailAddress/address,'beehiiv.com')",
      "contains(from/emailAddress/address,'noreply')",
      "contains(from/emailAddress/address,'no-reply')",
      "contains(from/emailAddress/address,'hello@')",
      "contains(from/emailAddress/address,'team@')",
      "contains(from/emailAddress/address,'ghost.org')",
      
      // Low importance emails (Outlook equivalent of Gmail promotions)
      "importance eq 'low' and hasAttachments eq false",
      
      // Recent emails (last 30 days)
      `receivedDateTime ge ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}`
    ];

    const allMessages = new Set();
    
    // Collect messages from all search queries (same as Gmail)
    for (const query of searchQueries) {
      try {
        console.log(`🔍 Trying query: ${query}`);
        const response = await client
          .api('/me/messages')
          .filter(query)
          .top(50) // Same as Gmail maxResults: 50
          .get();

        if (response.value) {
          response.value.forEach((msg: any) => allMessages.add(msg.id));
          console.log(`✅ Query found ${response.value.length} messages (total: ${allMessages.size})`);
        }
      } catch (error) {
        console.warn(`❌ Query failed: ${query}`, error);
      }
    }

    const newsletters = [];
    const messageIds = Array.from(allMessages);

    // Process emails in batches of 5 (same as Gmail)
    for (let i = 0; i < messageIds.length; i += 5) {
      const batch = messageIds.slice(i, i + 5);
      
      for (const messageId of batch) {
        try {
          const fullMessage = await client
            .api(`/me/messages/${messageId}`)
            .get();

          // Extract Outlook data in the same format as Gmail data
          const emailData = this.extractOutlookData(fullMessage);
          
          if (!emailData) {
            continue;
          }

          const analysis = this.analyzeNewsletterScore(emailData);
          
          console.log(`📧 Email: "${emailData.subject}" from ${emailData.from?.value?.[0]?.address} - Score: ${analysis.score}, Confidence: ${analysis.confidence}`);
          
          if (analysis.score >= 25) {
            newsletters.push({
              id: messageId,
              subject: emailData.subject,
              from: emailData.from,
              date: emailData.date,
              score: analysis.score,
              confidence: analysis.confidence
            });
            console.log(`✅ Found newsletter: "${emailData.subject}" (Score: ${analysis.score})`);
          }
        } catch (error) {
          console.error(`Failed to process email ${messageId}:`, error);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return newsletters;
  }

  // Add this method to parse Outlook message data
  private extractOutlookData(fullMessage: any) {
    if (!fullMessage) return null;
    return {
      subject: fullMessage.subject || '',
      from: {
        value: [{
          address: fullMessage.from?.emailAddress?.address || '',
          name: fullMessage.from?.emailAddress?.name || ''
        }]
      },
      text: fullMessage.body?.content || '',
      html: fullMessage.body?.content || '',
      date: new Date(fullMessage.receivedDateTime),
    };
  }
}