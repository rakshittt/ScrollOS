import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // List of tables to drop (in order to avoid foreign key issues)
  const tables = [
    'newsletter_rules',
    'categories',
    'newsletters',
    'email_accounts',
    'folders',
    'tags',
    'password_resets',
    'user_newsletter_domain_whitelist',
    'users',
    'accounts',
    'sessions',
    'verification_tokens',
    '__drizzle_migrations',
  ];

  console.log('Dropping all tables...\n');

  for (const table of tables) {
    try {
      // Use Pool's query method which supports traditional parameterized queries
      await pool.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
      console.log(`✓ Dropped table: ${table}`);
    } catch (err: any) {
      // Only log errors that aren't about non-existent tables
      if (!err.message?.includes('does not exist')) {
        console.error(`✗ Error dropping table ${table}:`, err.message);
      }
    }
  }

  await pool.end();

  console.log('\n✅ Database reset successfully! All tables have been dropped.');
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Reset DB failed!');
  console.error(err);
  process.exit(1);
});
