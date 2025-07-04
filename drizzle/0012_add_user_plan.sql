ALTER TABLE users
  ADD COLUMN plan text NOT NULL DEFAULT 'pro',
  ADD COLUMN plan_trial_ends_at timestamp,
  ADD COLUMN plan_expires_at timestamp; 