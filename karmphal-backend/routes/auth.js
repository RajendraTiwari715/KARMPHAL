const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

/**
 * POST /api/auth/guest
 * Creates a unique guest user in SQLite and returns a cryptographically signed JWT (HS256, 30d expiry)
 */
router.post('/guest', (req, res, next) => {
  try {
    const userId = uuidv4();
    
    // Create new isolated user row
    db.prepare('INSERT INTO Users (id, name, rank, totalPunya, sadhanaStreak) VALUES (?, ?, ?, ?, ?)')
      .run(userId, 'साधक', 'आरम्भिक', 0, 0);

    // Sign access token with 30-day expiry using HS256
    const token = jwt.sign(
      { sub: userId, role: 'guest' },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '30d' }
    );

    // Optional refresh token with 90-day expiry
    const refreshToken = jwt.sign(
      { sub: userId, type: 'refresh' },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '90d' }
    );

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
 * Exchanges a valid refresh token for a fresh 30-day access token
 */
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'refreshToken is required' });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (payload.type !== 'refresh' || !payload.sub) {
      return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid refresh token payload' });
    }

    // Verify user still exists in DB
    const user = db.prepare('SELECT id, name, rank, totalPunya, sadhanaStreak FROM Users WHERE id = ?').get(payload.sub);
    if (!user) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User associated with token no longer exists' });
    }

    const newAccessToken = jwt.sign(
      { sub: user.id, role: 'guest' },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '30d' }
    );

    res.json({ token: newAccessToken, user });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'TOKEN_EXPIRED', message: 'Refresh token expired. Please create a new session.' });
    }
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid refresh token.' });
  }
});

module.exports = router;
