const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const db = require('../database');

// Configurable guest registration limiter (per-IP, default 5/hour)
const GUEST_RATE_LIMIT_HOUR = parseInt(process.env.GUEST_RATE_LIMIT_HOUR || '5', 10);
const guestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'test' && !process.env.TEST_FORCE_GUEST_LIMIT ? 1000 : GUEST_RATE_LIMIT_HOUR,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'GUEST_RATE_LIMIT',
    message: `Too many guest accounts created from this IP. Limit is ${GUEST_RATE_LIMIT_HOUR} per hour.`
  }
});

/**
 * Computes a SHA-256 hash of a token for secure database storage.
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Parses duration string (e.g. '1s', '5m', '30d') to milliseconds.
 */
function parseDurationMs(durationStr = '90d') {
  if (typeof durationStr === 'number') return durationStr;
  const match = String(durationStr).match(/^(\d+)([smhd])$/);
  if (!match) return 90 * 24 * 60 * 60 * 1000;
  const val = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === 's') return val * 1000;
  if (unit === 'm') return val * 60 * 1000;
  if (unit === 'h') return val * 60 * 60 * 1000;
  if (unit === 'd') return val * 24 * 60 * 60 * 1000;
  return 90 * 24 * 60 * 60 * 1000;
}

/**
 * POST /api/auth/guest
 * Creates a unique guest user in SQLite, generates signed JWT access & refresh tokens,
 * and records the SHA-256 hash of the refresh token in the database.
 */
router.post('/guest', guestLimiter, (req, res, next) => {
  try {
    const userId = uuidv4();
    const accessExpiry = req.body?.expiresIn || '30d';
    const refreshExpiry = req.body?.refreshExpiresIn || '90d';
    
    // Create new isolated user row
    db.prepare('INSERT INTO Users (id, name, rank, totalPunya, sadhanaStreak) VALUES (?, ?, ?, ?, ?)')
      .run(userId, 'साधक', 'आरम्भिक', 0, 0);

    // Sign access token using HS256
    const token = jwt.sign(
      { sub: userId, role: 'guest' },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: accessExpiry }
    );

    // Sign refresh token with unique jti
    const refreshToken = jwt.sign(
      { sub: userId, type: 'refresh', jti: uuidv4() },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: refreshExpiry }
    );

    // Store only SHA-256 hash in DB
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + parseDurationMs(refreshExpiry)).toISOString();
    db.prepare('INSERT INTO RefreshTokens (userId, tokenHash, expiresAt) VALUES (?, ?, ?)')
      .run(userId, tokenHash, expiresAt);

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: userId,
        name: 'साधक',
        rank: 'आरम्भिक',
        totalPunya: 0,
        sadhanaStreak: 0
      },
      message: 'Guest session created successfully'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/refresh
 * Exchanges a valid refresh token for a fresh access token.
 * Enforces Refresh Token Rotation (RTR): invalidates the old refresh token,
 * issues a new refresh token, and stores only its SHA-256 hash.
 */
router.post('/refresh', (req, res) => {
  const { refreshToken, expiresIn, refreshExpiresIn } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'refreshToken is required' });
  }

  try {
    // 1. Verify JWT signature & structure
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (payload.type !== 'refresh' || !payload.sub) {
      return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid refresh token payload' });
    }

    // 2. Compute SHA-256 hash and check against DB
    const tokenHash = hashToken(refreshToken);
    const stored = db.prepare('SELECT id, userId, expiresAt, revokedAt FROM RefreshTokens WHERE tokenHash = ?').get(tokenHash);

    if (!stored) {
      return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Refresh token not recognized or already rotated' });
    }

    if (stored.revokedAt) {
      return res.status(401).json({ error: 'TOKEN_REVOKED', message: 'Refresh token has been revoked' });
    }

    if (new Date(stored.expiresAt) <= new Date()) {
      return res.status(401).json({ error: 'TOKEN_EXPIRED', message: 'Refresh token has expired' });
    }

    // 3. Verify user still exists in DB
    const user = db.prepare('SELECT id, name, rank, totalPunya, sadhanaStreak FROM Users WHERE id = ?').get(stored.userId);
    if (!user) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User associated with token no longer exists' });
    }

    // 4. Invalidate old refresh token (Rotation)
    db.prepare('UPDATE RefreshTokens SET revokedAt = CURRENT_TIMESTAMP WHERE id = ?').run(stored.id);

    // 5. Generate new access token
    const newAccessExpiry = expiresIn || '30d';
    const newAccessToken = jwt.sign(
      { sub: user.id, role: 'guest' },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: newAccessExpiry }
    );

    // 6. Generate new rotated refresh token & store its hash
    const newRefreshExpiry = refreshExpiresIn || '90d';
    const newRefreshToken = jwt.sign(
      { sub: user.id, type: 'refresh', jti: uuidv4() },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: newRefreshExpiry }
    );

    const newTokenHash = hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + parseDurationMs(newRefreshExpiry)).toISOString();
    db.prepare('INSERT INTO RefreshTokens (userId, tokenHash, expiresAt) VALUES (?, ?, ?)')
      .run(user.id, newTokenHash, newExpiresAt);

    res.json({ token: newAccessToken, refreshToken: newRefreshToken, user });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'TOKEN_EXPIRED', message: 'Refresh token expired. Please create a new session.' });
    }
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid or tampered refresh token.' });
  }
});

/**
 * POST /api/auth/revoke & POST /api/auth/logout
 * Revokes a refresh token by recording revokedAt timestamp.
 */
router.post(['/revoke', '/logout'], (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'refreshToken is required' });
    }
    const tokenHash = hashToken(refreshToken);
    const result = db.prepare('UPDATE RefreshTokens SET revokedAt = CURRENT_TIMESTAMP WHERE tokenHash = ? AND revokedAt IS NULL').run(tokenHash);

    res.json({
      success: true,
      message: 'Refresh token revoked successfully',
      revoked: result.changes > 0
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.guestLimiter = guestLimiter;

