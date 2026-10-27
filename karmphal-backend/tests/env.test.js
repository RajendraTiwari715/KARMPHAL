const { spawnSync } = require('child_process');
const path = require('path');

describe('Environment Variable Validation (config/env.js)', () => {
  it('exits with code 1, clean message with variable names only, and no TypeError when critical vars are missing', () => {
    const envJsPath = path.resolve(__dirname, '../config/env.js');

    // Run node with clean environment omitting JWT_SECRET, GEMINI_API_KEY, and CORS_ORIGINS
    const result = spawnSync(
      process.execPath,
      ['-e', `require('${envJsPath.replace(/\\/g, '\\\\')}')`],
      {
        env: {
          NODE_ENV: 'production',
          DOTENV_CONFIG_PATH: path.resolve(__dirname, 'does_not_exist.env'),
          PATH: process.env.PATH,
          SystemRoot: process.env.SystemRoot
        },
        encoding: 'utf8'
      }
    );

    expect(result.status).toBe(1);

    const stderr = result.stderr;
    expect(stderr).toContain('FATAL STARTUP CONFIGURATION ERROR: Invalid Environment Variables');
    expect(stderr).toContain('Missing or invalid environment variable: JWT_SECRET');
    expect(stderr).toContain('Missing or invalid environment variable: GEMINI_API_KEY');
    expect(stderr).toContain('Missing or invalid environment variable: CORS_ORIGINS');

    // Crucial: Must NOT throw or contain any TypeError (e.g. from err.errors being undefined)
    expect(stderr).not.toContain('TypeError');
    expect(stderr).not.toContain('undefined');

    // Crucial: Must NEVER leak secret values
    expect(stderr).not.toContain('abb1b2019a00844a');
    expect(stderr).not.toContain('AQ.Ab8RN');
  });

  it('validates successfully when all required variables are supplied', () => {
    const { validateEnv } = require('../config/env');
    const valid = validateEnv({
      NODE_ENV: 'production',
      PORT: '5000',
      DB_PATH: './test.db',
      JWT_SECRET: 'test-mock-jwt-secret-for-unit-test',
      GEMINI_API_KEY: 'test-mock-gemini-key',
      CORS_ORIGINS: 'https://karmphal.app,https://localhost'
    });

    expect(valid.JWT_SECRET).toBe('test-mock-jwt-secret-for-unit-test');
    expect(valid.CORS_ORIGINS).toBe('https://karmphal.app,https://localhost');
    expect(valid.GLOBAL_DAILY_AI_LIMIT).toBe('1000');
    expect(valid.GUEST_RATE_LIMIT_HOUR).toBe('5');
    expect(valid.LEGACY_MIGRATION_ENABLED).toBe('false');
  });

  it('ensures every variable in envSchema appears in .env.example and DEPLOYMENT.md', () => {
    const fs = require('fs');
    const { envSchema } = require('../config/env');
    const schemaKeys = Object.keys(envSchema.shape);

    const envExamplePath = path.resolve(__dirname, '../.env.example');
    const deploymentMdPath = path.resolve(__dirname, '../../DEPLOYMENT.md');

    const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
    const deploymentMdContent = fs.readFileSync(deploymentMdPath, 'utf8');

    for (const key of schemaKeys) {
      expect(
        envExampleContent,
        `Expected ${key} from envSchema to appear in karmphal-backend/.env.example`
      ).toContain(key);

      expect(
        deploymentMdContent,
        `Expected ${key} from envSchema to appear in DEPLOYMENT.md`
      ).toContain(key);
    }
  });
});
