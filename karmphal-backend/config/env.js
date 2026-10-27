if (process.env.DOTENV_CONFIG_PATH) {
  require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH });
} else {
  require('dotenv').config();
}
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
  CORS_ORIGINS: z.string().min(1, 'CORS_ORIGINS is required'),
  CHAT_RETENTION_LIMIT: z.string().regex(/^\d+$/).default('100'),
  AI_CHAT_RATE_LIMIT_HOUR: z.string().regex(/^\d+$/).default('20'),
  AI_OCR_RATE_LIMIT_HOUR: z.string().regex(/^\d+$/).default('5'),
  AI_DAILY_QUOTA_PER_USER: z.string().regex(/^\d+$/).default('50'),
  AI_MAX_OUTPUT_TOKENS: z.string().regex(/^\d+$/).default('1500'),
  GLOBAL_DAILY_AI_LIMIT: z.string().regex(/^\d+$/).default('1000'),
  GUEST_RATE_LIMIT_HOUR: z.string().regex(/^\d+$/).default('5'),
  LEGACY_MIGRATION_ENABLED: z.string().optional().default('false'),
  TRUST_PROXY: z.string().optional()
});

function validateEnv(rawEnv = process.env) {
  try {
    return envSchema.parse(rawEnv);
  } catch (err) {
    const issues = err.issues || err.errors || [];
    if (err.name === 'ZodError' || issues.length > 0) {
      console.error('====================================================');
      console.error('❌ FATAL STARTUP CONFIGURATION ERROR: Invalid Environment Variables');
      console.error('====================================================');
      const missingOrInvalid = Array.from(new Set(issues.map((e) => e.path.join('.')).filter(Boolean)));
      missingOrInvalid.forEach((name) => {
        console.error(`  - Missing or invalid environment variable: ${name}`);
      });
      console.error('====================================================');
      process.exit(1);
    }
    throw err;
  }
}

let validatedEnv;
if (process.env.NODE_ENV !== 'test_env_isolated') {
  validatedEnv = validateEnv(process.env);
}

module.exports = validatedEnv;
module.exports.envSchema = envSchema;
module.exports.validateEnv = validateEnv;
