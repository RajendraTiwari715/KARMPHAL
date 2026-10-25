require('dotenv').config();

// Fail fast on startup if JWT_SECRET is missing or insecure
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length < 16) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is missing or insecure (minimum 16 characters required). Exiting.');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');

require('./database');
const { errorHandler } = require('./middlewares/errorHandler');

const aiRoutes = require('./routes/ai');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Proxy Configuration: safely resolve real client IP via patched proxy-addr for rate limiting
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : process.env.TRUST_PROXY);
} else if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security Middlewares
app.use(helmet());

// Strict CORS Allowlist
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'capacitor://localhost',
  'http://localhost',
  'https://localhost',
  'http://10.0.2.2:5000'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.BACKEND_URL) {
  allowedOrigins.push(process.env.BACKEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, curl, native Capacitor, unit tests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Payload size limits
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 200, // High ceiling for test suites
  message: { error: 'RATE_LIMIT', message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Auth Rate Limiting on /api/auth/*
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 30, // Max 30 attempts per 15 minutes
  message: { error: 'AUTH_RATE_LIMIT', message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/', authLimiter);

// Request Logging (Safe - no tokens or PII)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/user', userRoutes);

// Safe Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

// Only listen if run directly (allows importing app in tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
