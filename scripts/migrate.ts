import * as dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

async function main() {
  console.log('Running migrations...');
  
  // Dynamic imports after dotenv is loaded
  const { db } = await import('@/lib/db');
  const { migrate } = await import('drizzle-orm/neon-http/migrator');
  
  await migrate(db, { migrationsFolder: 'drizzle' });
  
  console.log('✅ Migrations completed successfully!');
  
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Migration failed!');
  console.error(err);
  process.exit(1);
});
