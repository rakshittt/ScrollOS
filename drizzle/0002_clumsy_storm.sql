ALTER TABLE "newsletters" ADD COLUMN IF NOT EXISTS "user_id" integer NOT NULL;
ALTER TABLE "newsletters" DROP COLUMN IF EXISTS "tags";
ALTER TABLE "newsletters" ADD COLUMN IF NOT EXISTS "tags" json;