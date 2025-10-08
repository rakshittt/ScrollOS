-- Migration: Add user_newsletter_domain_whitelist table
CREATE TABLE user_newsletter_domain_whitelist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  domain TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Optional: Add index for fast lookup
CREATE INDEX idx_user_newsletter_domain_whitelist_user_id ON user_newsletter_domain_whitelist(user_id);
CREATE INDEX idx_user_newsletter_domain_whitelist_domain ON user_newsletter_domain_whitelist(domain); 