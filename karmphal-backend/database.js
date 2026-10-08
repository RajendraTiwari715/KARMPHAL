const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'karmphal.db');
const db = new Database(dbPath, { verbose: console.log });

// Enforce foreign keys and WAL mode for better concurrency and reliability
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

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
  }
];

// Run migrations inside a transaction
const runMigrations = () => {
  // Can't wrap PRAGMA foreign_keys = OFF inside standard BEGIN/COMMIT block reliably in some sqlite versions,
  // so we execute them sequentially. better-sqlite3 handles PRAGMA outside of explicit transactions.
  
  const getApplied = db.prepare('SELECT name FROM Migrations').all().map(r => r.name);
  
  for (const migration of migrations) {
    if (!getApplied.includes(migration.name)) {
      console.log(`[Migrations] Applying migration: ${migration.name}`);
      
      // Run the migration
      db.exec(migration.up);
      
      // Mark as applied
      db.prepare('INSERT INTO Migrations (name) VALUES (?)').run(migration.name);
      console.log(`[Migrations] Successfully applied: ${migration.name}`);
    }
  }
};

try {
  runMigrations();
} catch (err) {
  console.error('[Migrations] Fatal Error during migrations:', err);
  process.exit(1);
}

module.exports = db;
