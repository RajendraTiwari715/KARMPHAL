const express = require('express');
const router = express.Router();
const db = require('../database');
const { requireAuth } = require('../middlewares/auth');
const { profileUpdateSchema, punyaSyncSchema, chatHistorySchema } = require('../schemas/user.schema');

// Enforce strict authentication on all user routes (NO optionalAuth, NO default user id '1')
router.use(requireAuth);

/**
 * GET /api/user/profile
 * Fetches user profile scoped strictly to req.user.id
 */
router.get('/profile', (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT id, name, gotra, city, rank, totalPunya, sadhanaStreak, sankalpaActive, updatedAt FROM Users WHERE id = ?').get(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User profile not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/profile
 * Updates user profile scoped strictly to req.user.id
 */
router.post('/profile', (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT id FROM Users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
    }

    const validatedData = profileUpdateSchema.parse(req.body);
    const { name, gotra, city, rank } = validatedData;
    
    // Updates only the record corresponding to req.user.id
    db.prepare('UPDATE Users SET name = COALESCE(?, name), gotra = COALESCE(?, gotra), city = COALESCE(?, city), rank = COALESCE(?, rank), updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(name || null, gotra || null, city || null, rank || null, userId);
      
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/punya
 * Syncs Punya points and streak scoped strictly to req.user.id
 */
router.post('/punya', (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT id FROM Users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
    }

    const validatedData = punyaSyncSchema.parse(req.body);
    const { totalPunya, sadhanaStreak } = validatedData;
    
    db.prepare('UPDATE Users SET totalPunya = ?, sadhanaStreak = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(totalPunya, sadhanaStreak, userId);
      
    res.json({ success: true, message: 'Punya synced successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/user/chat-history
 * Retrieves chat history scoped strictly to req.user.id
 */
router.get('/chat-history', (req, res, next) => {
  try {
    const userId = req.user.id;
    const history = db.prepare('SELECT sender, text, timestamp FROM ChatHistory WHERE userId = ? ORDER BY id ASC').all(userId);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/chat-history
 * Stores a chat message scoped strictly to req.user.id
 */
router.post('/chat-history', (req, res, next) => {
  try {
    const userId = req.user.id;
    const validatedData = chatHistorySchema.parse(req.body);
    const { sender, text } = validatedData;
    
    db.prepare('INSERT INTO ChatHistory (userId, sender, text) VALUES (?, ?, ?)')
      .run(userId, sender, text);
      
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/user/export
 * Exports all user data scoped strictly to req.user.id
 */
router.get('/export', (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = db.prepare('SELECT id, name, gotra, city, rank, totalPunya, sadhanaStreak FROM Users WHERE id = ?').get(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
    }

    const chatHistory = db.prepare('SELECT sender, text, timestamp FROM ChatHistory WHERE userId = ?').all(userId);
    const sadhanaLogs = db.prepare('SELECT * FROM SadhanaLogs WHERE userId = ?').all(userId);
    
    res.json({
      exportDate: new Date().toISOString(),
      profile,
      chatHistory,
      sadhanaLogs
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/user/delete
 * Deletes user account and associated data scoped strictly to req.user.id
 */
router.delete('/delete', (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT id FROM Users WHERE id = ?').get(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
    }

    // Atomic transaction for data deletion
    const deleteTransaction = db.transaction((id) => {
      db.prepare('DELETE FROM ChatHistory WHERE userId = ?').run(id);
      db.prepare('DELETE FROM SadhanaLogs WHERE userId = ?').run(id);
      db.prepare('DELETE FROM Users WHERE id = ?').run(id);
    });
    
    deleteTransaction(userId);
    res.json({ success: true, message: 'User account and data permanently deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
