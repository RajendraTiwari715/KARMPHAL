const path = require('path');

const testDbPath = path.resolve(__dirname, 'test_backend.db');

// Set test environment variables BEFORE any application modules load
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-mock-jwt-secret-min-32-chars-key-12345';
process.env.GEMINI_API_KEY = 'mock-gemini-test-key-valid-string';
process.env.DB_PATH = testDbPath;
process.env.CORS_ORIGINS = 'http://localhost:5173,http://127.0.0.1:5173';
process.env.CHAT_RETENTION_LIMIT = '100';
process.env.PORT = '5999';

const db = require('../database');

// Helper to reset DB tables between tests
function resetTestDatabase() {
  const tables = [
    'WellbeingJourneys',
    'SecurityAudit',
    'AiGlobalDailyUsage',
    'AiUsageDaily',
    'Sessions',
    'SavedReports',
    'ConsentRecords',
    'UserPreferences',
    'RefreshTokens',
    'SadhanaLogs',
    'ChatHistory',
    'Users'
  ];
  for (const table of tables) {
    try {
      db.prepare(`DELETE FROM ${table}`).run();
    } catch {}
  }
}

// Ensure clean slate before test run
resetTestDatabase();

module.exports = { db, resetTestDatabase };
