const { defineConfig } = require('vitest/config');
const path = require('path');

module.exports = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    fileParallelism: false,
    setupFiles: [path.resolve(__dirname, 'tests/setup.js')],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['routes/**/*.js', 'middlewares/**/*.js', 'services/**/*.js'],
      exclude: ['node_modules/**', 'tests/**', 'smoke.test.js', 'production_hardening.test.js'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
        'routes/**/*.js': {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80
        },
        'services/**/*.js': {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80
        }
      }
    },
    testTimeout: 15000
  }
});
