const express = require('express');
const router = express.Router();
const db = require('../database');

// Define a single user ID for now (e.g. single-user local app)
const DEFAULT_USER_ID = 1;

// Initialize a default user if not exists
const initUser = () => {
  const row = db.prepare('SELECT * FROM Users WHERE id = ?').get(DEFAULT_USER_ID);
  if (!row) {
    db.prepare('INSERT INTO Users (id, name, rank, totalPunya, sadhanaStreak) VALUES (?, ?, ?, ?, ?)').run(DEFAULT_USER_ID, 'साधक', 'आरम्भिक', 0, 0);
  }
};
initUser();

// Get User Profile
router.get('/profile', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM Users WHERE id = ?').get(DEFAULT_USER_ID);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update User Profile
router.post('/profile', (req, res) => {
  try {
    const { name, gotra, city, rank } = req.body;
    db.prepare('UPDATE Users SET name = ?, gotra = ?, city = ?, rank = COALESCE(?, rank), updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(name, gotra, city, rank, DEFAULT_USER_ID);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Sync Punya Points
router.post('/punya', (req, res) => {
  try {
    const { totalPunya, sadhanaStreak } = req.body;
    db.prepare('UPDATE Users SET totalPunya = ?, sadhanaStreak = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .run(totalPunya, sadhanaStreak, DEFAULT_USER_ID);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to sync punya' });
  }
});

// Chat History endpoints
router.get('/chat-history', (req, res) => {
  try {
    const history = db.prepare('SELECT sender, text FROM ChatHistory WHERE userId = ? ORDER BY id ASC').all(DEFAULT_USER_ID);
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

router.post('/chat-history', (req, res) => {
  try {
    const { sender, text } = req.body;
    db.prepare('INSERT INTO ChatHistory (userId, sender, text) VALUES (?, ?, ?)')
      .run(DEFAULT_USER_ID, sender, text);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save chat history' });
  }
});

module.exports = router;
