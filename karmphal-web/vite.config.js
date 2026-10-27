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
    modulePreload: {
      resolveDependencies(filename, deps) {
        return deps.filter(dep => 
          !dep.includes('vendor-markdown') &&
          !dep.includes('vendor-pdf') &&
          !dep.includes('vendor-pdfjs') &&
          !dep.includes('AcharyaMarkdown') &&
          !dep.includes('PDFReader') &&
          !dep.includes('KundaliPrintReport')
        );
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('\\react\\') || id.includes('\\react-dom\\')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('@capacitor')) return 'vendor-capacitor';
            if (id.includes('pdfjs-dist')) return 'vendor-pdfjs';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
            return 'vendor-common';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
