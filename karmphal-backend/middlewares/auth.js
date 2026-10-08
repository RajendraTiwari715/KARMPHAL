const { v4: uuidv4 } = require('uuid');

// Simple guest mode token middleware
// In a real app, use JWT. For this SQLite setup, we'll map tokens to User IDs if we had a Token table.
// To keep it simple and migrate from existing DEFAULT_USER_ID, we'll accept a bearer token as the UUID guest ID.

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing or invalid authentication token.' });
  }

  const token = authHeader.split(' ')[1];
  
  // Basic validation that it's a uuid or known format
  if (!token || token.trim().length < 10) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid authentication token.' });
  }

  // Attach to request
  req.user = { id: token }; // Using the UUID as the user ID directly in DB for guest mode
  next();
};

module.exports = { requireAuth };
