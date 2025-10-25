// Manual migration script for TokenBlacklist table
// Run with: node scripts/migrate-token-blacklist.js

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

try {
  console.log('🔧 Creating TokenBlacklist table...');

  // Create table
  db.exec(`
    CREATE TABLE IF NOT EXISTS "TokenBlacklist" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "token" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "reason" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "expiresAt" DATETIME NOT NULL
    );
  `);

  // Create indexes
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS "TokenBlacklist_token_key"
    ON "TokenBlacklist"("token");
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS "TokenBlacklist_token_idx"
    ON "TokenBlacklist"("token");
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS "TokenBlacklist_expiresAt_idx"
    ON "TokenBlacklist"("expiresAt");
  `);

  console.log('✅ TokenBlacklist table created successfully!');

  // Verify
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='TokenBlacklist'").all();
  console.log('📋 Verification:', tables.length > 0 ? 'Table exists' : 'Table not found');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
