const crypto = require('crypto');

/**
 * Redacts sensitive fields, tokens, keys, and large payloads.
 */
function sanitizeData(data) {
  if (!data) return data;
  if (typeof data === 'string') {
    // Redact JWT tokens (3 parts)
    if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(data.trim())) {
      return '[REDACTED_JWT_TOKEN]';
    }
    // Redact Bearer headers
    if (/^Bearer\s+/i.test(data)) {
      return 'Bearer [REDACTED_TOKEN]';
    }
    // Truncate strings longer than 150 chars to avoid leaking chat text or base64
    if (data.length > 150) {
      return data.slice(0, 140) + '... [TRUNCATED]';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  if (typeof data === 'object') {
    const sanitized = {};
    for (const [key, val] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('token') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('key') ||
        lowerKey.includes('auth') ||
        lowerKey.includes('password')
      ) {
        sanitized[key] = '[REDACTED]';
      } else if (lowerKey === 'imagebase64' || lowerKey === 'image') {
        sanitized[key] = '[REDACTED_IMAGE_PAYLOAD]';
      } else if (lowerKey === 'usermessage' || lowerKey === 'text') {
        sanitized[key] = typeof val === 'string' ? `[TEXT_LEN_${val.length}]` : '[REDACTED_TEXT]';
      } else {
        sanitized[key] = sanitizeData(val);
      }
    }
    return sanitized;
  }

  return data;
}

function formatLog(level, message, meta = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitizeData(meta)
  };
  return JSON.stringify(logEntry);
}

const logger = {
  info: (message, meta = {}) => {
    console.log(formatLog('INFO', message, meta));
  },
  warn: (message, meta = {}) => {
    console.warn(formatLog('WARN', message, meta));
  },
  error: (message, meta = {}) => {
    console.error(formatLog('ERROR', message, meta));
  },
  fatal: (message, meta = {}) => {
    console.error(formatLog('FATAL', message, meta));
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatLog('DEBUG', message, meta));
    }
  },
  /**
   * Express middleware for structured request logging with Request ID
   */
  requestMiddleware: (req, res, next) => {
    const startTime = Date.now();
    const reqId = req.headers['x-request-id'] || crypto.randomUUID();
    req.id = reqId;
    res.setHeader('X-Request-Id', reqId);

    res.on('finish', () => {
      const durationMs = Date.now() - startTime;
      const logData = {
        reqId,
        method: req.method,
        url: req.originalUrl || req.url,
        status: res.statusCode,
        durationMs,
        ip: req.ip,
        userId: req.user?.id || 'anonymous'
      };

      if (res.statusCode >= 500) {
        logger.error(`HTTP ${req.method} ${req.url} -> ${res.statusCode}`, logData);
      } else if (res.statusCode >= 400) {
        logger.warn(`HTTP ${req.method} ${req.url} -> ${res.statusCode}`, logData);
      } else {
        logger.info(`HTTP ${req.method} ${req.url} -> ${res.statusCode}`, logData);
      }
    });

    next();
  }
};

module.exports = logger;
