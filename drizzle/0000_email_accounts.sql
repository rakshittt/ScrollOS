CREATE TABLE IF NOT EXISTS "email_accounts" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "access_token" TEXT NOT NULL,
  "refresh_token" TEXT NOT NULL,
  "token_expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "last_synced_at" TIMESTAMP WITH TIME ZONE,
  "sync_enabled" BOOLEAN DEFAULT true,
  "sync_frequency" INTEGER DEFAULT 3600,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_provider_email UNIQUE ("user_id", "provider", "email")
);

CREATE INDEX IF NOT EXISTS "email_accounts_user_id_idx" ON "email_accounts"("user_id");
CREATE INDEX IF NOT EXISTS "email_accounts_provider_idx" ON "email_accounts"("provider");

-- Drop and recreate tags column
ALTER TABLE "newsletters" DROP COLUMN IF EXISTS "tags";
ALTER TABLE "newsletters" ADD COLUMN "tags" json; 