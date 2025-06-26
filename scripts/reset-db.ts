import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  // List of tables to drop (in order to avoid foreign key issues)
  const tables = [
    'newsletter_rules',
    'categories',
    'newsletters',
    'email_accounts',
    'folders',
    'tags',
    'users',
    'accounts',
    'sessions',
    'verification_tokens',
  ];

  for (const table of tables) {
    try {
      // Use template string for Neon
      await sql([`DROP TABLE IF EXISTS "${table}" CASCADE;`] as any);
      console.log(`Dropped table: ${table}`);
    } catch (err) {
      console.error(`Error dropping table ${table}:`, err);
    }
  }

  console.log('All tables dropped.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Reset DB failed!');
  console.error(err);
  process.exit(1);
}); 