const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

router.post('/guest', (req, res) => {
  try {
    const guestId = uuidv4();
    
    // Initialize user in DB with string ID
    db.prepare('INSERT INTO Users (id, name, rank, totalPunya, sadhanaStreak) VALUES (?, ?, ?, ?, ?)')
      .run(guestId, 'साधक', 'आरम्भिक', 0, 0);

    res.json({ token: guestId, message: 'Guest session created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create guest session' });
  }
});

module.exports = router;
