import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config();

export default defineConfig({
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: 'public',
  },
  verbose: true,
  strict: true,
});
