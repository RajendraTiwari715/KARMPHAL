import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pdfjs-dist')) return 'vendor-pdfjs';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
            if (
              id.includes('react-markdown') ||
              id.includes('remark') ||
              id.includes('rehype') ||
              id.includes('micromark') ||
              id.includes('unified') ||
              id.includes('unist') ||
              id.includes('vfile') ||
              id.includes('mdast') ||
              id.includes('hast')
            ) {
              return 'vendor-markdown';
            }
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('@capacitor')) return 'vendor-capacitor';
            return 'vendor-common';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
