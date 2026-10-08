const express = require('express');
const router = express.Router();
const db = require('../database');
const { profileUpdateSchema, punyaSyncSchema, chatHistorySchema } = require('../schemas/user.schema');

// Optional auth for transition period. Eventually will be strictly requireAuth.
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    req.user = { id: authHeader.split(' ')[1] };
  } else {
    req.user = { id: '1' }; // Fallback to DEFAULT_USER_ID = '1'
  }
  next();
};

router.use(optionalAuth);

// Get User Profile
router.get('/profile', (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT * FROM Users WHERE id = ?').get(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User profile not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Update User Profile
router.post('/profile', (req, res, next) => {
  try {
    const userId = req.user.id;
    const validatedData = profileUpdateSchema.parse(req.body);
    const { name, gotra, city, rank } = validatedData;
    
    // Using COALESCE for partial updates
    db.prepare('UPDATE Users SET name = COALESCE(?, name), gotra = COALESCE(?, gotra), city = COALESCE(?, city), rank = COALESCE(?, rank), updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(name || null, gotra || null, city || null, rank || null, userId);
      
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Sync Punya Points
router.post('/punya', (req, res, next) => {
  try {
    const userId = req.user.id;
    const validatedData = punyaSyncSchema.parse(req.body);
    const { totalPunya, sadhanaStreak } = validatedData;
    
    db.prepare('UPDATE Users SET totalPunya = ?, sadhanaStreak = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(totalPunya, sadhanaStreak, userId);
      
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Chat History endpoints
router.get('/chat-history', (req, res, next) => {
  try {
    const userId = req.user.id;
    const history = db.prepare('SELECT sender, text, timestamp FROM ChatHistory WHERE userId = ? ORDER BY id ASC').all(userId);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

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

// Data Export
router.get('/export', (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = db.prepare('SELECT * FROM Users WHERE id = ?').get(userId);
    const chatHistory = db.prepare('SELECT * FROM ChatHistory WHERE userId = ?').all(userId);
    const sadhanaLogs = db.prepare('SELECT * FROM SadhanaLogs WHERE userId = ?').all(userId);
    
    if (!profile) return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
    
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

// Account & Data Deletion
router.delete('/delete', (req, res, next) => {
  try {
    const userId = req.user.id;
    // Perform deletion within a transaction
    const deleteTransaction = db.transaction((id) => {
      db.prepare('DELETE FROM ChatHistory WHERE userId = ?').run(id);
      db.prepare('DELETE FROM SadhanaLogs WHERE userId = ?').run(id);
      db.prepare('DELETE FROM Users WHERE id = ?').run(id);
    });
    
    deleteTransaction(userId);
    res.json({ success: true, message: 'User data permanently deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
