import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(import.meta.dirname, 'tests/setup.js')],
    include: [
      'tests/render_count.test.jsx',
      'tests/apiClient.test.js',
      'tests/chat_provider.test.jsx',
      'tests/panchang_cities.test.js',
      'tests/library_lru.test.js',
      'tests/error_boundary.test.jsx',
      'tests/pdf_service.test.js',
      'tests/anti_cheat.test.js'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/services/apiClient.js',
        'src/services/ephemerisEngine.js',
        'src/services/japaAntiCheat.js',
        'src/services/libraryService.js',
        'src/services/pdfReportService.js',
        'src/context/ChatProvider.jsx',
        'src/components/ErrorBoundary.jsx'
      ],
      thresholds: {
        lines: 65,
        functions: 50,
        branches: 55,
        statements: 65,
        'src/services/apiClient.js': {
          lines: 80,
          functions: 75,
          branches: 65,
          statements: 75
        },
        'src/services/ephemerisEngine.js': {
          lines: 70,
          branches: 60
        },
        'src/services/libraryService.js': {
          lines: 70,
          branches: 60
        },
        'src/services/pdfReportService.js': {
          lines: 70,
          branches: 60
        },
        'src/context/ChatProvider.jsx': {
          lines: 70,
          branches: 60
        }
      }
    },
    testTimeout: 20000
  }
});
