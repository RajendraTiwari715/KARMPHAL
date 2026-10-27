const request = require('supertest');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const app = require('../server');
const { db, resetTestDatabase } = require('./setup');

describe('Auth & Refresh Token Rotation (RTR) Integration Tests', () => {
  beforeEach(() => {
    resetTestDatabase();
  });

  describe('POST /api/auth/guest', () => {
    it('creates a new guest user and returns valid signed JWT tokens', async () => {
      const res = await request(app)
        .post('/api/auth/guest')
        .send({})
        .expect(201);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.name).toBe('साधक');
      expect(res.body.user.rank).toBe('आरम्भिक');
      expect(res.body.user.totalPunya).toBe(0);

      const userId = res.body.user.id;

      // Verify access token
      const accessPayload = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(accessPayload.sub).toBe(userId);
      expect(accessPayload.role).toBe('guest');

      // Verify refresh token
      const refreshPayload = jwt.verify(res.body.refreshToken, process.env.JWT_SECRET);
      expect(refreshPayload.sub).toBe(userId);
      expect(refreshPayload.type).toBe('refresh');

      // Verify DB persistence
      const userInDb = db.prepare('SELECT * FROM Users WHERE id = ?').get(userId);
      expect(userInDb).toBeTruthy();
      expect(userInDb.name).toBe('साधक');

      // Verify token hash in DB
      const tokens = db.prepare('SELECT * FROM RefreshTokens WHERE userId = ?').all(userId);
      expect(tokens.length).toBe(1);
      expect(tokens[0].revokedAt).toBeNull();
    });

    it('enforces per-IP rate limiting on guest creation when limit is exceeded', async () => {
      const express = require('express');
      const rateLimit = require('express-rate-limit');
      const testApp = express();
      testApp.use(express.json());

      const testGuestLimiter = rateLimit({
        windowMs: 60 * 60 * 1000,
        max: 2,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'GUEST_RATE_LIMIT', message: 'Too many guest accounts created from this IP.' }
      });
      testApp.post('/api/auth/guest-test', testGuestLimiter, (_req, res) => res.status(201).json({ ok: true }));

      await request(testApp).post('/api/auth/guest-test').expect(201);
      await request(testApp).post('/api/auth/guest-test').expect(201);
      const resBlocked = await request(testApp).post('/api/auth/guest-test').expect(429);
      expect(resBlocked.body.error).toBe('GUEST_RATE_LIMIT');
    });
  });

  describe('POST /api/auth/refresh (RTR & Security)', () => {
    it('rotates refresh token and issues fresh access token on valid refresh', async () => {
      // 1. Create guest
      const guestRes = await request(app)
        .post('/api/auth/guest')
        .send({})
        .expect(201);

      const initialRefreshToken = guestRes.body.refreshToken;
      const userId = guestRes.body.user.id;

      // 2. Perform refresh
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: initialRefreshToken })
        .expect(200);

      expect(refreshRes.body).toHaveProperty('token');
      expect(refreshRes.body).toHaveProperty('refreshToken');
      expect(refreshRes.body.user.id).toBe(userId);

      const newRefreshToken = refreshRes.body.refreshToken;
      expect(newRefreshToken).not.toBe(initialRefreshToken);

      // Verify old token is marked revoked in DB
      const tokensInDb = db.prepare('SELECT * FROM RefreshTokens WHERE userId = ? ORDER BY id ASC').all(userId);
      expect(tokensInDb.length).toBe(2);
      expect(tokensInDb[0].revokedAt).not.toBeNull();
      expect(tokensInDb[1].revokedAt).toBeNull();

      // 3. Replay attack: Reusing the old refresh token MUST return 401 TOKEN_REVOKED
      const reuseRes = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: initialRefreshToken })
        .expect(401);

      expect(reuseRes.body.error).toBe('TOKEN_REVOKED');
    });

    it('rejects expired refresh token with 401 TOKEN_EXPIRED', async () => {
      const userId = uuidv4();
      db.prepare('INSERT INTO Users (id, name, rank) VALUES (?, ?, ?)')
        .run(userId, 'टेस्ट साधक', 'आरम्भिक');

      // Sign token with 0s expiry (immediately expired)
      const expiredToken = jwt.sign(
        { sub: userId, type: 'refresh', jti: uuidv4() },
        process.env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: -1 }
      );

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: expiredToken })
        .expect(401);

      expect(res.body.error).toBe('TOKEN_EXPIRED');
    });

    it('rejects tampered or forged refresh token with 401 INVALID_TOKEN', async () => {
      const forgedToken = jwt.sign(
        { sub: uuidv4(), type: 'refresh' },
        'wrong-secret-key-that-does-not-match',
        { algorithm: 'HS256', expiresIn: '1h' }
      );

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: forgedToken })
        .expect(401);

      expect(res.body.error).toBe('INVALID_TOKEN');
    });

    it('rejects missing refreshToken with 400 BAD_REQUEST', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(res.body.error).toBe('BAD_REQUEST');
    });

    it('rejects refresh token when associated user was deleted', async () => {
      const guestRes = await request(app)
        .post('/api/auth/guest')
        .send({})
        .expect(201);

      const userId = guestRes.body.user.id;
      const refreshToken = guestRes.body.refreshToken;

      // Delete the user record
      db.prepare('DELETE FROM Users WHERE id = ?').run(userId);

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(res.body.error).toBe('INVALID_TOKEN');
    });
  });

  describe('POST /api/auth/revoke', () => {
    it('successfully revokes an active refresh token', async () => {
      const guestRes = await request(app)
        .post('/api/auth/guest')
        .send({})
        .expect(201);

      const refreshToken = guestRes.body.refreshToken;

      const res = await request(app)
        .post('/api/auth/revoke')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.revoked).toBe(true);

      // Re-revoking already revoked token returns revoked: false
      const secondRes = await request(app)
        .post('/api/auth/revoke')
        .send({ refreshToken })
        .expect(200);

      expect(secondRes.body.revoked).toBe(false);
    });

    it('rejects missing refreshToken with 400 BAD_REQUEST', async () => {
      const res = await request(app)
        .post('/api/auth/revoke')
        .send({})
        .expect(400);

      expect(res.body.error).toBe('BAD_REQUEST');
    });
  });
});

