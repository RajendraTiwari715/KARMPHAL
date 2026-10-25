require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/, 'PORT must be a numeric string').default('5000'),
  DB_PATH: z.string().min(1, 'DB_PATH is required').default('./karmphal.db'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters for cryptographic security'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required').refine(
    (key) => !key.includes('your_gemini_api_key_here'),
    'GEMINI_API_KEY cannot be the default placeholder'
  ),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://127.0.0.1:5173'),
  CHAT_RETENTION_LIMIT: z.string().regex(/^\d+$/).default('100'),
  AI_CHAT_RATE_LIMIT_HOUR: z.string().regex(/^\d+$/).default('20'),
  AI_OCR_RATE_LIMIT_HOUR: z.string().regex(/^\d+$/).default('5'),
  AI_DAILY_QUOTA_PER_USER: z.string().regex(/^\d+$/).default('50'),
  AI_MAX_OUTPUT_TOKENS: z.string().regex(/^\d+$/).default('1500'),
  TRUST_PROXY: z.string().optional()
});

let validatedEnv;

try {
  validatedEnv = envSchema.parse(process.env);
} catch (err) {
  if (err.name === 'ZodError') {
    console.error('====================================================');
    console.error('❌ FATAL STARTUP CONFIGURATION ERROR: Invalid Environment Variables');
    console.error('====================================================');
    err.errors.forEach((e) => {
      console.error(`  - ${e.path.join('.')}: ${e.message}`);
    });
    console.error('====================================================');
    process.exit(1);
  }
  throw err;
}

module.exports = validatedEnv;
