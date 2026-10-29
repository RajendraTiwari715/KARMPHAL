// 1. Fail fast on startup with strict Zod environment validation
const env = require('./config/env');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const db = require('./database');
const logger = require('./utils/logger');
const { errorHandler } = require('./middlewares/errorHandler');

const aiRoutes = require('./routes/ai');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const libraryRoutes = require('./routes/library');

const app = express();
const PORT = env.PORT || 5000;

// State management for graceful shutdown
let isShuttingDown = false;

// Trust Proxy Configuration: env-driven (TRUST_PROXY: false / number / list), default false unless set
function resolveTrustProxy(val) {
  if (!val || val === 'false') return false;
  if (val === 'true') return true;
  if (/^\d+$/.test(val)) return parseInt(val, 10);
  if (val.includes(',')) return val.split(',').map(s => s.trim());
  return val;
}
app.set('trust proxy', resolveTrustProxy(env.TRUST_PROXY));

// Security Headers
app.use(helmet());

// CORS Policy Configuration
// Rules:
// - Capacitor origins ('capacitor://localhost', 'https://localhost') stay allowed.
// - Localhost, 127.0.0.1, 10.0.2.2, and insecure http:// origins allowed ONLY when NODE_ENV != production.
// - Env-driven allowlist via CORS_ORIGINS.
const parsedEnvOrigins = (env.CORS_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const isOriginAllowed = (origin, envOrigins = parsedEnvOrigins, nodeEnv = process.env.NODE_ENV) => {
  // Reject string "null" (sent by sandboxed iframes or privacy exploits)
  if (origin === 'null') return false;

  // Allow non-browser requests (native mobile apps, curl, server-to-server)
  if (!origin) return true;

  // Capacitor native app origins are always allowed in all environments
  if (origin === 'capacitor://localhost' || origin === 'https://localhost') {
    return true;
  }

  const isDevOrTest = nodeEnv !== 'production';
  const isLocalOrInsecure =
    origin.startsWith('http://') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.includes('10.0.2.2');

  // In production, strictly reject any localhost or plain http:// origins
  if (!isDevOrTest && isLocalOrInsecure) {
    return false;
  }

  // Check against env configured CORS_ORIGINS
  if (envOrigins.includes(origin)) {
    return true;
  }

  // In dev / test, also permit default development local origins
  if (isDevOrTest) {
    const devDefaults = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://localhost',
      'http://10.0.2.2:5000'
    ];
    if (devDefaults.includes(origin)) {
      return true;
    }
  }

  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
}));

// Request ID & Structured Logging Middleware (safe - tokens & chat bodies redacted)
app.use(logger.requestMiddleware);

// Graceful rejection when server is draining/shutting down
app.use((req, res, next) => {
  if (isShuttingDown) {
    res.setHeader('Connection', 'close');
    return res.status(503).json({
      error: 'SERVICE_SHUTTING_DOWN',
      message: 'सर्वर बंद हो रहा है, कृपया कुछ समय बाद पुनः प्रयास करें।'
    });
  }
  next();
});

// Selective Body Parsing:
// Skip global 1MB body parser for /api/ai/extract-kundali so its dedicated 10MB parser handles large images.
app.use((req, res, next) => {
  if (req.path === '/api/ai/extract-kundali') {
    return next();
  }
  express.json({ limit: '1mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 200,
  message: { error: 'RATE_LIMIT', message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', globalLimiter);

// Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 30,
  message: { error: 'AUTH_RATE_LIMIT', message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/auth/', authLimiter);

// Health Check Endpoints (No Auth, No Sensitive Data)
const livenessHandler = (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
};
const readinessHandler = (_req, res) => {
  try {
    db.prepare('SELECT 1').get();
    res.status(200).json({ status: 'ready', database: 'connected' });
  } catch (err) {
    logger.error('Readiness probe failed', { error: err.message });
    res.status(503).json({ status: 'unavailable', error: 'Database check failed' });
  }
};

app.get('/health', livenessHandler);
app.get('/api/health', livenessHandler);
app.get('/ready', readinessHandler);
app.get('/api/ready', readinessHandler);

// Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/user', userRoutes);
app.use('/api/library', libraryRoutes);

// Global Error Handler
app.use(errorHandler);

let server = null;

// Graceful Shutdown Implementation
function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  const forceTimeout = setTimeout(() => {
    logger.warn('Graceful shutdown timed out (10s limit). Forcing exit...');
    try {
      db.pragma('wal_checkpoint(TRUNCATE)');
      db.close();
    } catch {}
    setImmediate(() => process.exit(0));
  }, 10000);
  forceTimeout.unref();

  if (server) {
    server.close((err) => {
      if (err) {
        logger.error('Error closing HTTP server', { error: err.message });
      } else {
        logger.info('HTTP server closed cleanly. In-flight requests drained.');
      }

      // SQLite WAL Checkpoint and Close
      try {
        logger.info('Performing SQLite WAL checkpoint (TRUNCATE)...');
        const checkpoint = db.pragma('wal_checkpoint(TRUNCATE)');
        logger.info('SQLite WAL checkpoint completed cleanly', { checkpoint });
      } catch (walErr) {
        logger.error('Error during WAL checkpoint', { error: walErr.message });
      }

      try {
        db.close();
        logger.info('Database connection closed cleanly.');
      } catch (dbErr) {
        logger.error('Error closing database', { error: dbErr.message });
      }

      logger.info('Graceful shutdown complete. Exiting process with code 0.');
      clearTimeout(forceTimeout);
      setImmediate(() => process.exit(0));
    });
  } else {
    try {
      db.pragma('wal_checkpoint(TRUNCATE)');
      db.close();
    } catch {}
    clearTimeout(forceTimeout);
    setImmediate(() => process.exit(0));
  }
}

// Process-level Signal and Error Listeners
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Cross-platform IPC signal listener (enables graceful signal testing on Windows)
if (process.send) {
  process.on('message', (msg) => {
    if (msg === 'SIGTERM' || msg === 'SIGINT') {
      gracefulShutdown(msg);
    }
  });
}

process.on('uncaughtException', (err) => {
  logger.fatal('Uncaught Exception', { error: err.message, stack: err.stack });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason: reason?.message || String(reason) });
});

if (require.main === module) {
  server = app.listen(PORT, () => {
    logger.info(`Backend server running on http://localhost:${PORT}`, {
      port: PORT,
      nodeEnv: process.env.NODE_ENV || 'development'
    });
  });
}

module.exports = app;
module.exports.gracefulShutdown = gracefulShutdown;
module.exports.isOriginAllowed = isOriginAllowed;
