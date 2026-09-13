const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'karmphal.db');
const db = new Database(dbPath, { verbose: console.log });

// Initialize Tables
db.exec(`
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
`);

module.exports = db;
