import { sql } from 'drizzle-orm';
import { 
  integer, 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  boolean,
  json,
  varchar,
  primaryKey
} from 'drizzle-orm/pg-core';

export const newsletters = pgTable('newsletters', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  emailAccountId: integer('email_account_id').references(() => emailAccounts.id),
  messageId: text('message_id'),
  title: text('title').notNull(),
  sender: text('sender').notNull(),
  senderEmail: text('sender_email').notNull(),
  subject: text('subject').notNull(),
  content: text('content').notNull(),
  htmlContent: text('html_content'),
  isRead: boolean('is_read').default(false),
  isStarred: boolean('is_starred').default(false),
  isArchived: boolean('is_archived').default(false),
  tags: json('tags').$type<string[]>(),
  category: text('category').default('uncategorized'),
  categoryId: integer('category_id').references(() => categories.id),
  priority: integer('priority').default(0),
  folder: text('folder').default('inbox'),
  receivedAt: timestamp('received_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  password: varchar('password', { length: 255 }),
  twoFactorSecret: text('two_factor_secret'),
  twoFactorBackupCodes: json('two_factor_backup_codes').$type<string[]>(),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const folders = pgTable('folders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  color: text('color').default('#ff385c'),
  icon: text('icon').default('inbox'),
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color').default('#ff385c'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  sessionToken: text('session_token').notNull().unique(),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
}, (vt) => ({
  compoundKey: primaryKey(vt.identifier, vt.token),
}));

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  color: text('color').default('#ff385c'),
  icon: text('icon'),
  isSystem: boolean('is_system').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const newsletterRules = pgTable('newsletter_rules', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  condition: json('condition').notNull(),
  action: json('action').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const emailAccounts = pgTable('email_accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  provider: text('provider').notNull(), // 'gmail' or 'outlook'
  email: text('email').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  tokenExpiresAt: timestamp('token_expires_at').notNull(),
  lastSyncedAt: timestamp('last_synced_at'),
  syncEnabled: boolean('sync_enabled').default(true),
  syncFrequency: integer('sync_frequency').default(3600), // in seconds
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  readingPreferences: json('reading_preferences').$type<{
    fontSize: number;
    lineHeight: number;
    maxWidth: number;
    readingMode: 'normal' | 'focus' | 'distraction-free';
    readingTheme: 'light' | 'dark' | 'sepia';
    autoSaveProgress: boolean;
    showReadingProgress: boolean;
    enableKeyboardShortcuts: boolean;
    autoMarkAsRead: boolean;
  }>(),
  appearanceSettings: json('appearance_settings').$type<{
    theme: 'light' | 'dark' | 'system';
    accentColor: string;
    borderRadius: 'none' | 'small' | 'medium' | 'large';
    animations: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    compactMode: boolean;
    showSidebar: boolean;
    sidebarCollapsed: boolean;
  }>(),
  notificationSettings: json('notification_settings').$type<{
    emailNotifications: boolean;
    browserNotifications: boolean;
    pushNotifications: boolean;
    notificationFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    quietHours: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    categories: Record<string, boolean>;
    soundEnabled: boolean;
    desktopNotifications: boolean;
    mobileNotifications: boolean;
    digestEnabled: boolean;
    digestFrequency: 'daily' | 'weekly';
    digestTime: string;
  }>(),
  securitySettings: json('security_settings').$type<{
    twoFactorAuth: boolean;
    loginNotifications: boolean;
    suspiciousActivityAlerts: boolean;
    dataEncryption: boolean;
    autoLogout: boolean;
    autoLogoutMinutes: number;
    sessionTimeout: boolean;
    sessionTimeoutHours: number;
    privacyMode: boolean;
    dataSharing: boolean;
    analytics: boolean;
    marketingEmails: boolean;
    thirdPartyAccess: boolean;
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const passwordResets = pgTable('password_resets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userNewsletterDomainWhitelist = pgTable('user_newsletter_domain_whitelist', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  domain: text('domain').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Newsletter = typeof newsletters.$inferSelect;
export type NewNewsletter = typeof newsletters.$inferInsert;
export type Folder = typeof folders.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type EmailAccount = typeof emailAccounts.$inferSelect;
export type NewEmailAccount = typeof emailAccounts.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
export type NewUserNewsletterDomainWhitelist = typeof userNewsletterDomainWhitelist.$inferInsert;
export type UserNewsletterDomainWhitelist = typeof userNewsletterDomainWhitelist.$inferSelect;
