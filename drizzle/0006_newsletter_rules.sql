-- Add new columns to newsletters table
ALTER TABLE "newsletters" ADD COLUMN IF NOT EXISTS "category" text DEFAULT 'uncategorized';
ALTER TABLE "newsletters" ADD COLUMN IF NOT EXISTS "priority" integer DEFAULT 0;
ALTER TABLE "newsletters" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;

-- Create newsletter_rules table
CREATE TABLE IF NOT EXISTS "newsletter_rules" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "condition" json NOT NULL,
  "action" json NOT NULL,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS "categories" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "color" text DEFAULT '#ff385c',
  "icon" text,
  "is_system" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- ALTER TABLE "newsletters" ADD COLUMN IF NOT EXISTS "user_id" integer NOT NULL;
-- ALTER TABLE "newsletters" DROP COLUMN IF EXISTS "tags";
-- ALTER TABLE "newsletters" ADD COLUMN IF NOT EXISTS "tags" json; 