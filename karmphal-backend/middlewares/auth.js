const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Validates cryptographically signed JWTs (HS256) and binds subject to req.user = { id: payload.sub }.
 * Rejects missing, malformed, forged, or expired tokens with strict 401 Unauthorized status codes.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Missing or malformed Authorization header. Expected Bearer <token>.'
    });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Empty Bearer token provided.'
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    if (!payload.sub) {
      return res.status(401).json({
        error: 'INVALID_TOKEN',
        message: 'Token subject is missing.'
      });
    }

    req.user = {
      id: String(payload.sub),
      role: payload.role || 'user'
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired. Please refresh your session.'
      });
    }
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Invalid or forged authentication token signature.'
    });
  }
};

module.exports = { requireAuth };
