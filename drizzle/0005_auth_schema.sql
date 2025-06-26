-- Drop all tables
DROP TABLE IF EXISTS "verification_tokens";
DROP TABLE IF EXISTS "sessions";
DROP TABLE IF EXISTS "accounts";
DROP TABLE IF EXISTS "newsletters";
DROP TABLE IF EXISTS "users";

-- Recreate users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY,
  "name" text,
  "email" text NOT NULL UNIQUE,
  "emailVerified" timestamp,
  "image" text,
  "password" varchar(255),
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Recreate newsletters table
CREATE TABLE IF NOT EXISTS "newsletters" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "sender" text NOT NULL,
  "sender_email" text NOT NULL,
  "subject" text NOT NULL,
  "content" text,
  "html_content" text,
  "is_read" boolean DEFAULT false,
  "is_starred" boolean DEFAULT false,
  "is_archived" boolean DEFAULT false,
  "folder" text DEFAULT 'inbox',
  "tags" json,
  "received_at" timestamp DEFAULT now(),
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS "accounts" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "provider_account_id" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "session_token" text NOT NULL UNIQUE,
  "expires" timestamp NOT NULL
);

-- Create verification_tokens table
CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" text NOT NULL,
  "token" text NOT NULL,
  "expires" timestamp NOT NULL,
  PRIMARY KEY ("identifier", "token")
);

-- Drop and re-add tags column as json
ALTER TABLE "newsletters" DROP COLUMN IF EXISTS "tags";
ALTER TABLE "newsletters" ADD COLUMN IF NOT EXISTS "tags" json; 