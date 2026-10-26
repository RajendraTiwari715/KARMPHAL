const request = require('supertest');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const app = require('../server');
const { db, resetTestDatabase } = require('./setup');

function createTestUser(overrides = {}) {
  const userId = overrides.id || uuidv4();
  db.prepare(`
    INSERT INTO Users (id, name, gotra, city, rank, totalPunya, sadhanaStreak, sankalpaActive, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    overrides.name || 'साधक',
    overrides.gotra || 'कश्यप',
    overrides.city || 'वाराणसी',
    overrides.rank || 'आरम्भिक',
    overrides.totalPunya ?? 100,
    overrides.sadhanaStreak ?? 5,
    overrides.sankalpaActive ?? 1,
    overrides.updatedAt || new Date().toISOString()
  );

  const token = jwt.sign(
    { sub: userId, role: 'guest' },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' }
  );

  return { userId, token };
}

describe('User Routes & Account Deletion Cascade Integration Tests', () => {
  beforeEach(() => {
    resetTestDatabase();
  });

  describe('GET /api/user/profile', () => {
    it('returns user profile when authenticated', async () => {
      const { userId, token } = createTestUser({ name: 'रुद्र', city: 'हरिद्वार' });

      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.id).toBe(userId);
      expect(res.body.name).toBe('रुद्र');
      expect(res.body.city).toBe('हरिद्वार');
      expect(res.body.totalPunya).toBe(100);
    });

    it('rejects unauthenticated request with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .get('/api/user/profile')
        .expect(401);

      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('returns 404 NOT_FOUND if user record is missing in DB', async () => {
      const ghostId = uuidv4();
      const ghostToken = jwt.sign({ sub: ghostId }, process.env.JWT_SECRET);

      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${ghostToken}`)
        .expect(404);

      expect(res.body.error).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/user/profile', () => {
    it('updates user profile fields with validation', async () => {
      const { userId, token } = createTestUser();

      const res = await request(app)
        .post('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'नारायण',
          gotra: 'वशिष्ठ',
          city: 'अयोध्या'
        })
        .expect(200);

      expect(res.body.success).toBe(true);

      const updated = db.prepare('SELECT * FROM Users WHERE id = ?').get(userId);
      expect(updated.name).toBe('नारायण');
      expect(updated.gotra).toBe('वशिष्ठ');
      expect(updated.city).toBe('अयोध्या');
    });

    it('rejects invalid payload types', async () => {
      const { token } = createTestUser();

      const res = await request(app)
        .post('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 12345 // name must be string
        })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/user/punya (Anti-Cheat / Rate-Capping)', () => {
    it('updates punya cleanly when delta is within normal rate limit', async () => {
      const { token } = createTestUser({ totalPunya: 50 });

      const res = await request(app)
        .post('/api/user/punya')
        .set('Authorization', `Bearer ${token}`)
        .send({
          totalPunya: 100, // delta = 50 <= 150 allowable base delta
          sadhanaStreak: 6
        })
        .expect(200);

      expect(res.body.totalPunya).toBe(100);
      expect(res.body.sadhanaStreak).toBe(6);
    });

    it('caps suspicious spikes when delta exceeds maximum allowable rate', async () => {
      const { token } = createTestUser({ totalPunya: 50 });

      // Simulate abnormal jump (+500,000 points in 1 second)
      const res = await request(app)
        .post('/api/user/punya')
        .set('Authorization', `Bearer ${token}`)
        .send({
          totalPunya: 500050,
          sadhanaStreak: 10
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      // Base allowable delta is 150, so capped to 50 + 150 = 200
      expect(res.body.totalPunya).toBeLessThanOrEqual(250);
      expect(res.body.totalPunya).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Chat History Pagination & Pruning', () => {
    it('paginates chat history with cursor (before) and headers', async () => {
      const { userId, token } = createTestUser();

      // Insert 15 messages
      for (let i = 1; i <= 15; i++) {
        db.prepare('INSERT INTO ChatHistory (userId, sender, text) VALUES (?, ?, ?)')
          .run(userId, i % 2 === 0 ? 'model' : 'user', `सन्देश क्रमांक ${i}`);
      }

      // 1. Fetch first page of 5 messages
      const page1 = await request(app)
        .get('/api/user/chat-history?limit=5')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(page1.body.length).toBe(5);
      expect(page1.headers['x-has-more']).toBe('true');
      const oldestCursor = parseInt(page1.headers['x-next-cursor'], 10);
      expect(oldestCursor).toBeGreaterThan(0);

      // 2. Fetch older messages before cursor
      const page2 = await request(app)
        .get(`/api/user/chat-history?limit=5&before=${oldestCursor}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(page2.body.length).toBe(5);
      expect(page2.body[page2.body.length - 1].id).toBeLessThan(oldestCursor);
    });

    it('enforces retention pruning: prunes oldest messages beyond retention limit', async () => {
      const { userId, token } = createTestUser();

      // Insert 105 messages through API
      for (let i = 1; i <= 105; i++) {
        await request(app)
          .post('/api/user/chat-history')
          .set('Authorization', `Bearer ${token}`)
          .send({ sender: 'user', text: `मन्त्र जप सन्देश ${i}` })
          .expect(200);
      }

      // Check DB count for this user
      const countRow = db.prepare('SELECT COUNT(*) as cnt FROM ChatHistory WHERE userId = ?').get(userId);
      // Retention limit is 100, so exactly 100 messages must be retained
      expect(countRow.cnt).toBe(100);

      // Verify oldest message retained is message 6 (messages 1-5 pruned)
      const oldestMsg = db.prepare('SELECT text FROM ChatHistory WHERE userId = ? ORDER BY id ASC LIMIT 1').get(userId);
      expect(oldestMsg.text).toBe('मन्त्र जप सन्देश 6');
    });

    it('clears chat history with DELETE /api/user/chat-history', async () => {
      const { userId, token } = createTestUser();
      const otherUser = createTestUser();

      db.prepare('INSERT INTO ChatHistory (userId, sender, text) VALUES (?, ?, ?)').run(userId, 'user', 'सन्देश १');
      db.prepare('INSERT INTO ChatHistory (userId, sender, text) VALUES (?, ?, ?)').run(otherUser.userId, 'user', 'अन्य सन्देश');

      const res = await request(app)
        .delete('/api/user/chat-history')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.deletedCount).toBe(1);

      // Verify user's history is gone, other user's history is preserved
      const userCount = db.prepare('SELECT COUNT(*) as cnt FROM ChatHistory WHERE userId = ?').get(userId);
      expect(userCount.cnt).toBe(0);

      const otherCount = db.prepare('SELECT COUNT(*) as cnt FROM ChatHistory WHERE userId = ?').get(otherUser.userId);
      expect(otherCount.cnt).toBe(1);
    });
  });

  describe('GET /api/user/export', () => {
    it('exports all user profile, chat history, and sadhana logs', async () => {
      const { userId, token } = createTestUser({ name: 'विष्णु' });
      db.prepare('INSERT INTO ChatHistory (userId, sender, text) VALUES (?, ?, ?)').run(userId, 'user', 'नमस्ते आचार्य');
      db.prepare('INSERT INTO SadhanaLogs (userId, type, details) VALUES (?, ?, ?)').run(userId, 'japa', 'गायत्री १०८');

      const res = await request(app)
        .get('/api/user/export')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('exportDate');
      expect(res.body.profile.name).toBe('विष्णु');
      expect(res.body.chatHistory.length).toBe(1);
      expect(res.body.sadhanaLogs.length).toBe(1);
    });
  });

  describe('DELETE /api/user/account & /delete (Account Deletion Cascade)', () => {
    it('atomically deletes user and cascades across ALL 10 related SQLite tables', async () => {
      const { userId, token } = createTestUser({ name: 'साधक विलोपन' });
      const otherUser = createTestUser({ name: 'सुरक्षित साधक' });

      // Populate data across all 10 tables for Target User
      db.prepare('INSERT INTO ChatHistory (userId, sender, text) VALUES (?, ?, ?)').run(userId, 'user', 'अलविदा');
      db.prepare('INSERT INTO SadhanaLogs (userId, type, details) VALUES (?, ?, ?)').run(userId, 'mala', '१०८ जप');
      db.prepare('INSERT INTO RefreshTokens (userId, tokenHash, expiresAt) VALUES (?, ?, ?)').run(userId, 'hash-token-123', '2030-01-01');
      db.prepare('INSERT INTO UserPreferences (userId, language) VALUES (?, ?)').run(userId, 'hi');
      db.prepare('INSERT INTO ConsentRecords (userId, consentType, granted) VALUES (?, ?, ?)').run(userId, 'analytics', 1);
      db.prepare('INSERT INTO SavedReports (userId, type, title, data) VALUES (?, ?, ?, ?)').run(userId, 'kundali', 'मेरी कुण्डली', '{}');
      db.prepare('INSERT INTO Sessions (id, userId, provider) VALUES (?, ?, ?)').run(uuidv4(), userId, 'guest');
      db.prepare('INSERT INTO AiUsageDaily (userId, date, count) VALUES (?, ?, ?)').run(userId, '2026-10-26', 12);
      db.prepare('INSERT INTO SecurityAudit (userId, action, details) VALUES (?, ?, ?)').run(userId, 'login', 'सत्र आरम्भ');

      // Populate data for Other User (must NOT be touched)
      db.prepare('INSERT INTO ChatHistory (userId, sender, text) VALUES (?, ?, ?)').run(otherUser.userId, 'user', 'स्थायी सन्देश');
      db.prepare('INSERT INTO SadhanaLogs (userId, type, details) VALUES (?, ?, ?)').run(otherUser.userId, 'mala', '१०८ जप');
      db.prepare('INSERT INTO RefreshTokens (userId, tokenHash, expiresAt) VALUES (?, ?, ?)').run(otherUser.userId, 'other-hash-456', '2030-01-01');
      db.prepare('INSERT INTO UserPreferences (userId, language) VALUES (?, ?)').run(otherUser.userId, 'sa');
      db.prepare('INSERT INTO ConsentRecords (userId, consentType, granted) VALUES (?, ?, ?)').run(otherUser.userId, 'analytics', 1);
      db.prepare('INSERT INTO SavedReports (userId, type, title, data) VALUES (?, ?, ?, ?)').run(otherUser.userId, 'kundali', 'अन्य कुण्डली', '{}');
      db.prepare('INSERT INTO Sessions (id, userId, provider) VALUES (?, ?, ?)').run(uuidv4(), otherUser.userId, 'guest');
      db.prepare('INSERT INTO AiUsageDaily (userId, date, count) VALUES (?, ?, ?)').run(otherUser.userId, '2026-10-26', 5);
      db.prepare('INSERT INTO SecurityAudit (userId, action, details) VALUES (?, ?, ?)').run(otherUser.userId, 'login', 'सत्र आरम्भ');

      // Execute Account Deletion Cascade via DELETE /api/user/account
      const res = await request(app)
        .delete('/api/user/account')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('permanently deleted');

      // Verify Target User is completely wiped from ALL 10 tables
      expect(db.prepare('SELECT COUNT(*) as c FROM Users WHERE id = ?').get(userId).c).toBe(0);
      expect(db.prepare('SELECT COUNT(*) as c FROM ChatHistory WHERE userId = ?').get(userId).c).toBe(0);
      expect(db.prepare('SELECT COUNT(*) as c FROM SadhanaLogs WHERE userId = ?').get(userId).c).toBe(0);
      expect(db.prepare('SELECT COUNT(*) as c FROM RefreshTokens WHERE userId = ?').get(userId).c).toBe(0);
      expect(db.prepare('SELECT COUNT(*) as c FROM UserPreferences WHERE userId = ?').get(userId).c).toBe(0);
      expect(db.prepare('SELECT COUNT(*) as c FROM ConsentRecords WHERE userId = ?').get(userId).c).toBe(0);
      expect(db.prepare('SELECT COUNT(*) as c FROM SavedReports WHERE userId = ?').get(userId).c).toBe(0);
      expect(db.prepare('SELECT COUNT(*) as c FROM Sessions WHERE userId = ?').get(userId).c).toBe(0);
      expect(db.prepare('SELECT COUNT(*) as c FROM AiUsageDaily WHERE userId = ?').get(userId).c).toBe(0);
      expect(db.prepare('SELECT COUNT(*) as c FROM SecurityAudit WHERE userId = ?').get(userId).c).toBe(0);

      // Verify Other User's data is 100% INTACT
      expect(db.prepare('SELECT COUNT(*) as c FROM Users WHERE id = ?').get(otherUser.userId).c).toBe(1);
      expect(db.prepare('SELECT COUNT(*) as c FROM ChatHistory WHERE userId = ?').get(otherUser.userId).c).toBe(1);
      expect(db.prepare('SELECT COUNT(*) as c FROM SadhanaLogs WHERE userId = ?').get(otherUser.userId).c).toBe(1);
      expect(db.prepare('SELECT COUNT(*) as c FROM RefreshTokens WHERE userId = ?').get(otherUser.userId).c).toBe(1);
      expect(db.prepare('SELECT COUNT(*) as c FROM UserPreferences WHERE userId = ?').get(otherUser.userId).c).toBe(1);
      expect(db.prepare('SELECT COUNT(*) as c FROM ConsentRecords WHERE userId = ?').get(otherUser.userId).c).toBe(1);
      expect(db.prepare('SELECT COUNT(*) as c FROM SavedReports WHERE userId = ?').get(otherUser.userId).c).toBe(1);
      expect(db.prepare('SELECT COUNT(*) as c FROM Sessions WHERE userId = ?').get(otherUser.userId).c).toBe(1);
      expect(db.prepare('SELECT COUNT(*) as c FROM AiUsageDaily WHERE userId = ?').get(otherUser.userId).c).toBe(1);
      expect(db.prepare('SELECT COUNT(*) as c FROM SecurityAudit WHERE userId = ?').get(otherUser.userId).c).toBe(1);
    });

    it('returns 404 NOT_FOUND when attempting to delete non-existent user', async () => {
      const nonExistentToken = jwt.sign({ sub: uuidv4(), role: 'guest' }, process.env.JWT_SECRET);

      const res = await request(app)
        .delete('/api/user/account')
        .set('Authorization', `Bearer ${nonExistentToken}`)
        .expect(404);

      expect(res.body.error).toBe('NOT_FOUND');
    });
  });
});
