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
    const user = db.prepare('SELECT id, totalPunya, sadhanaStreak, updatedAt FROM Users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
    }

    const validatedData = punyaSyncSchema.parse(req.body);
    let { totalPunya, sadhanaStreak } = validatedData;
    
    // Server-side Anti-Cheat / Rate-Capping:
    // Cap abnormal spikes in totalPunya (max ~10 punya/sec, base allowable delta 150)
    const currentPunya = user.totalPunya || 0;
    const delta = totalPunya - currentPunya;
    if (delta > 0 && user.updatedAt) {
      const lastUpdate = new Date(user.updatedAt).getTime();
      if (!isNaN(lastUpdate)) {
        const elapsedSeconds = Math.max(1, (Date.now() - lastUpdate) / 1000);
        const maxAllowedDelta = Math.max(150, Math.floor(elapsedSeconds * 10));
        if (delta > maxAllowedDelta) {
          totalPunya = currentPunya + maxAllowedDelta;
        }
      }
    }
    
    db.prepare('UPDATE Users SET totalPunya = ?, sadhanaStreak = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(totalPunya, sadhanaStreak, userId);
      
    res.json({ success: true, totalPunya, sadhanaStreak, message: 'Punya synced successfully' });
  } catch (err) {
    next(err);
  }
});

const CHAT_RETENTION_LIMIT = parseInt(process.env.CHAT_RETENTION_LIMIT, 10) || 100; // Retain maximum N messages per user (default 100)

/**
 * GET /api/user/chat-history
 * Retrieves chat history scoped strictly to req.user.id
 * Supports ?limit=50&before=<cursor_id>
 * Ordered chronologically by timestamp / created_at ASC
 */
router.get('/chat-history', (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const before = req.query.before ? parseInt(req.query.before, 10) : null;

    let rows;
    if (before && !isNaN(before)) {
      rows = db.prepare(`
        SELECT id, sender, text, timestamp, timestamp AS created_at 
        FROM ChatHistory 
        WHERE userId = ? AND id < ? 
        ORDER BY id DESC 
        LIMIT ?
      `).all(userId, before, limit);
    } else {
      rows = db.prepare(`
        SELECT id, sender, text, timestamp, timestamp AS created_at 
        FROM ChatHistory 
        WHERE userId = ? 
        ORDER BY id DESC 
        LIMIT ?
      `).all(userId, limit);
    }

    // Reverse to ascending (chronological) order for chat stream
    const history = rows.reverse();
    const hasMore = rows.length === limit;
    const oldestCursor = history.length > 0 ? history[0].id : null;

    res.set('X-Has-More', String(hasMore));
    if (oldestCursor) {
      res.set('X-Next-Cursor', String(oldestCursor));
    }

    res.json(history);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/chat-history
 * Stores a chat message scoped strictly to req.user.id
 * Applies retention policy to prevent DB bloat
 */
router.post('/chat-history', (req, res, next) => {
  try {
    const userId = req.user.id;
    const validatedData = chatHistorySchema.parse(req.body);
    const { sender, text } = validatedData;
    
    const insertResult = db.prepare('INSERT INTO ChatHistory (userId, sender, text) VALUES (?, ?, ?)')
      .run(userId, sender, text);

    // Retention policy: Keep only the most recent N messages for this user
    db.prepare(`
      DELETE FROM ChatHistory 
      WHERE userId = ? 
        AND id NOT IN (
          SELECT id FROM ChatHistory 
          WHERE userId = ? 
          ORDER BY id DESC 
          LIMIT ?
        )
    `).run(userId, userId, CHAT_RETENTION_LIMIT);
      
    res.json({ success: true, id: insertResult.lastInsertRowid });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/user/chat-history
 * Clears chat history scoped strictly to req.user.id
 */
router.delete('/chat-history', (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = db.prepare('DELETE FROM ChatHistory WHERE userId = ?').run(userId);
    res.json({ success: true, message: 'Chat history cleared successfully', deletedCount: result.changes });
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
 * DELETE /api/user/delete & DELETE /api/user/account
 * Permanently and atomically deletes all user rows across all tables:
 * Users, ChatHistory, SadhanaLogs, RefreshTokens, UserPreferences, ConsentRecords, SavedReports, Sessions, AiUsageDaily, SecurityAudit.
 */
const handleDeleteUser = (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT id FROM Users WHERE id = ?').get(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
    }

    // Comprehensive atomic transaction for complete data deletion
    const deleteAllUserData = db.transaction((id) => {
      db.prepare('DELETE FROM ChatHistory WHERE userId = ?').run(id);
      db.prepare('DELETE FROM SadhanaLogs WHERE userId = ?').run(id);
      db.prepare('DELETE FROM RefreshTokens WHERE userId = ?').run(id);
      db.prepare('DELETE FROM UserPreferences WHERE userId = ?').run(id);
      db.prepare('DELETE FROM ConsentRecords WHERE userId = ?').run(id);
      db.prepare('DELETE FROM SavedReports WHERE userId = ?').run(id);
      db.prepare('DELETE FROM Sessions WHERE userId = ?').run(id);
      db.prepare('DELETE FROM AiUsageDaily WHERE userId = ?').run(id);
      db.prepare('DELETE FROM SecurityAudit WHERE userId = ?').run(id);
      return db.prepare('DELETE FROM Users WHERE id = ?').run(id);
    });
    
    deleteAllUserData(userId);
    res.json({ success: true, message: 'User account and all associated data permanently deleted.' });
  } catch (err) {
    next(err);
  }
};

router.delete('/delete', handleDeleteUser);
router.delete('/account', handleDeleteUser);

module.exports = router;
