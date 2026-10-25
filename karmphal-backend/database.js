const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'karmphal.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath, {
  verbose: process.env.DEBUG_SQL === 'true' ? console.log : null
});

// Production SQLite Pragmas:
// - foreign_keys: Enforces integrity and cascading deletes
// - journal_mode = WAL: Concurrent readers and writers without blocking
// - busy_timeout = 5000: Waits up to 5s on lock contention instead of failing with SQLITE_BUSY
// - synchronous = NORMAL: Recommended with WAL for high performance and power-loss safety
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
db.pragma('synchronous = NORMAL');

// Initialize Migrations Table
db.exec(`
  CREATE TABLE IF NOT EXISTS Migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration Definitions
const migrations = [
  {
    name: '001_initial_schema',
    up: `
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        gotra TEXT,
        city TEXT,
        rank TEXT,
        totalPunya INTEGER DEFAULT 0,
        sadhanaStreak INTEGER DEFAULT 0,
        sankalpaActive INTEGER DEFAULT 0,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS ChatHistory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        sender TEXT,
        text TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS SadhanaLogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        type TEXT,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: '002_migrate_user_id_to_uuid_and_fks',
    up: `
      PRAGMA foreign_keys = OFF;

      -- Create new Users table with TEXT id
      CREATE TABLE Users_new (
        id TEXT PRIMARY KEY,
        name TEXT,
        gotra TEXT,
        city TEXT,
        rank TEXT,
        totalPunya INTEGER DEFAULT 0,
        sadhanaStreak INTEGER DEFAULT 0,
        sankalpaActive INTEGER DEFAULT 0,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO Users_new SELECT CAST(id AS TEXT), name, gotra, city, rank, totalPunya, sadhanaStreak, sankalpaActive, updatedAt FROM Users;
      DROP TABLE Users;
      ALTER TABLE Users_new RENAME TO Users;

      -- Create new ChatHistory table with Foreign Key
      CREATE TABLE ChatHistory_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT,
        sender TEXT,
        text TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
      );
      INSERT INTO ChatHistory_new SELECT id, CAST(userId AS TEXT), sender, text, timestamp FROM ChatHistory;
      DROP TABLE ChatHistory;
      ALTER TABLE ChatHistory_new RENAME TO ChatHistory;

      -- Create new SadhanaLogs table with Foreign Key
      CREATE TABLE SadhanaLogs_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT,
        type TEXT,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
      );
      INSERT INTO SadhanaLogs_new SELECT id, CAST(userId AS TEXT), type, details, timestamp FROM SadhanaLogs;
      DROP TABLE SadhanaLogs;
      ALTER TABLE SadhanaLogs_new RENAME TO SadhanaLogs;

      PRAGMA foreign_keys = ON;
    `
  },
  {
    name: '003_add_privacy_and_security_entities',
    up: `
      CREATE TABLE IF NOT EXISTS UserPreferences (
        userId TEXT PRIMARY KEY,
        language TEXT DEFAULT 'hi',
        notificationsEnabled INTEGER DEFAULT 1,
        shareAnalytics INTEGER DEFAULT 0,
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ConsentRecords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT,
        consentType TEXT,
        granted INTEGER,
        ipAddress TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS SecurityAudit (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT,
        action TEXT,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS SavedReports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT,
        type TEXT,
        title TEXT,
        data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
      );

      -- Sessions / Auth Provider mapping table
      CREATE TABLE IF NOT EXISTS Sessions (
        id TEXT PRIMARY KEY,
        userId TEXT,
        provider TEXT,
        expiresAt DATETIME,
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
      );
    `
  },
  {
    name: '004_refresh_tokens_and_rotation',
    up: `
      CREATE TABLE IF NOT EXISTS RefreshTokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        tokenHash TEXT NOT NULL UNIQUE,
        expiresAt DATETIME NOT NULL,
        revokedAt DATETIME DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON RefreshTokens(tokenHash);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON RefreshTokens(userId);

      -- Core Production Indexes
      CREATE INDEX IF NOT EXISTS idx_chathistory_user_id_desc ON ChatHistory(userId, id DESC);
      CREATE INDEX IF NOT EXISTS idx_sadhanalogs_user_id_desc ON SadhanaLogs(userId, id DESC);
      CREATE INDEX IF NOT EXISTS idx_sadhanalogs_user_type ON SadhanaLogs(userId, type);
      CREATE INDEX IF NOT EXISTS idx_savedreports_user ON SavedReports(userId);
      CREATE INDEX IF NOT EXISTS idx_consentrecords_user ON ConsentRecords(userId);
      CREATE INDEX IF NOT EXISTS idx_securityaudit_user ON SecurityAudit(userId);
    `
  },
  {
    name: '005_production_performance_indexes_and_usage',
    up: `
      -- Idempotent performance indexes for existing databases
      CREATE INDEX IF NOT EXISTS idx_chathistory_user_id_desc ON ChatHistory(userId, id DESC);
      CREATE INDEX IF NOT EXISTS idx_sadhanalogs_user_id_desc ON SadhanaLogs(userId, id DESC);
      CREATE INDEX IF NOT EXISTS idx_sadhanalogs_user_type ON SadhanaLogs(userId, type);
      CREATE INDEX IF NOT EXISTS idx_savedreports_user ON SavedReports(userId);
      CREATE INDEX IF NOT EXISTS idx_consentrecords_user ON ConsentRecords(userId);
      CREATE INDEX IF NOT EXISTS idx_securityaudit_user ON SecurityAudit(userId);
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON Sessions(userId);

      -- AI Daily Quota Tracking Table
      CREATE TABLE IF NOT EXISTS AiUsageDaily (
        userId TEXT NOT NULL,
        date TEXT NOT NULL,
        count INTEGER DEFAULT 0,
        PRIMARY KEY (userId, date),
        FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_aiusagedaily_user_date ON AiUsageDaily(userId, date);
    `
  }
];

// Run migrations inside a transaction
const runMigrations = (targetDb = db) => {
  const getApplied = targetDb.prepare('SELECT name FROM Migrations').all().map(r => r.name);
  
  for (const migration of migrations) {
    if (!getApplied.includes(migration.name)) {
      // Run the migration
      targetDb.exec(migration.up);
      // Mark as applied
      targetDb.prepare('INSERT INTO Migrations (name) VALUES (?)').run(migration.name);
    }
  }
};

try {
  runMigrations(db);
} catch (err) {
  console.error('[Migrations] Fatal Error during migrations:', err);
  process.exit(1);
}

module.exports = db;
module.exports.runMigrations = runMigrations;
