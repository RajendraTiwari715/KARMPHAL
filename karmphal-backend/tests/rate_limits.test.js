const request = require('supertest');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const app = require('../server');
const geminiService = require('../services/gemini.service');
const { db, resetTestDatabase } = require('./setup');

function createAuthenticatedUser() {
  const userId = uuidv4();
  db.prepare('INSERT INTO Users (id, name, rank) VALUES (?, ?, ?)')
    .run(userId, 'साधक', 'आरम्भिक');

  const token = jwt.sign(
    { sub: userId, role: 'guest' },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' }
  );

  return { userId, token };
}

describe('Rate Limits & Daily AI Quota Integration Tests', () => {
  beforeEach(() => {
    resetTestDatabase();
    vi.restoreAllMocks();
  });

  describe('Daily AI Quota Enforcement (AiUsageDaily)', () => {
    it('blocks requests and returns 429 DAILY_QUOTA_EXCEEDED once quota is exhausted', async () => {
      const { userId, token } = createAuthenticatedUser();
      const today = new Date().toISOString().slice(0, 10);

      // Seed usage to quota maximum (50)
      db.prepare('INSERT INTO AiUsageDaily (userId, date, count) VALUES (?, ?, ?)')
        .run(userId, today, 50);

      // Temporarily enable test simulation of quota check
      process.env.TEST_SIMULATE_DAILY_QUOTA = 'true';

      vi.spyOn(geminiService, 'callGemini').mockResolvedValue({ text: 'उत्तर' });

      try {
        const res = await request(app)
          .post('/api/ai/acharya')
          .set('Authorization', `Bearer ${token}`)
          .send({ userMessage: 'क्या आज का कोटा समाप्त है?' })
          .expect(429);

        expect(res.body.error).toBe('DAILY_QUOTA_EXCEEDED');
        expect(res.body.message).toContain('दैनिक AI कोटा समाप्त हो गया है');
      } finally {
        delete process.env.TEST_SIMULATE_DAILY_QUOTA;
      }
    });

    it('increments usage counter when quota is not yet exhausted', async () => {
      const { userId, token } = createAuthenticatedUser();
      const today = new Date().toISOString().slice(0, 10);

      process.env.TEST_SIMULATE_DAILY_QUOTA = 'true';
      vi.spyOn(geminiService, 'callGemini').mockResolvedValue({ text: 'उत्तर' });

      try {
        await request(app)
          .post('/api/ai/acharya')
          .set('Authorization', `Bearer ${token}`)
          .send({ userMessage: 'पहला प्रश्न' })
          .expect(200);

        const row = db.prepare('SELECT count FROM AiUsageDaily WHERE userId = ? AND date = ?').get(userId, today);
        expect(row.count).toBe(1);
      } finally {
        delete process.env.TEST_SIMULATE_DAILY_QUOTA;
      }
    });

    it('returns friendly 503 GLOBAL_DAILY_LIMIT_REACHED when global daily Gemini limit is reached', async () => {
      const { token } = createAuthenticatedUser();
      const today = new Date().toISOString().slice(0, 10);

      // Seed global usage to cap
      db.prepare('INSERT OR REPLACE INTO AiGlobalDailyUsage (date, count) VALUES (?, ?)')
        .run(today, 1000);

      process.env.TEST_SIMULATE_GLOBAL_QUOTA = 'true';
      vi.spyOn(geminiService, 'callGemini').mockResolvedValue({ text: 'उत्तर' });

      try {
        const res = await request(app)
          .post('/api/ai/acharya')
          .set('Authorization', `Bearer ${token}`)
          .send({ userMessage: 'क्या सर्वर सीमा समाप्त है?' })
          .expect(503);

        expect(res.body.error).toBe('GLOBAL_DAILY_LIMIT_REACHED');
        expect(res.body.message).toContain('दैनिक सर्वर AI अनुरोध सीमा पूर्ण हो चुकी है');
      } finally {
        delete process.env.TEST_SIMULATE_GLOBAL_QUOTA;
      }
    });
  });

  describe('Global & Auth Rate Limiting Standard Headers', () => {
    it('returns standard RateLimit headers on auth endpoints', async () => {
      const res = await request(app)
        .post('/api/auth/guest')
        .send({})
        .expect(201);

      expect(res.headers).toHaveProperty('ratelimit-limit');
      expect(res.headers).toHaveProperty('ratelimit-remaining');
    });
  });
});
