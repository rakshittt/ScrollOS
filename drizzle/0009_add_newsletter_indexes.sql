-- Add indexes for better newsletter query performance
-- Only add indexes, don't create tables that already exist

-- Newsletter table indexes
CREATE INDEX IF NOT EXISTS idx_newsletters_user_id ON newsletters(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_sender_email ON newsletters(sender_email);
CREATE INDEX IF NOT EXISTS idx_newsletters_user_id_sender_email ON newsletters(user_id, sender_email);
CREATE INDEX IF NOT EXISTS idx_newsletters_user_id_category_id ON newsletters(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_user_id_is_starred ON newsletters(user_id, is_starred);
CREATE INDEX IF NOT EXISTS idx_newsletters_user_id_is_archived ON newsletters(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_newsletters_user_id_email_account_id ON newsletters(user_id, email_account_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_received_at ON newsletters(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletters_priority_received_at ON newsletters(priority DESC, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletters_user_id_priority_received_at ON newsletters(user_id, priority DESC, received_at DESC);

-- Whitelist table indexes
CREATE INDEX IF NOT EXISTS idx_user_newsletter_email_whitelist_user_id ON user_newsletter_email_whitelist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_newsletter_email_whitelist_email ON user_newsletter_email_whitelist(email);
CREATE INDEX IF NOT EXISTS idx_user_newsletter_email_whitelist_user_id_email ON user_newsletter_email_whitelist(user_id, email); 