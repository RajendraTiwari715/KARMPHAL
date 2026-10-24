import localforage from 'localforage';
import { SACRED_BOOKS } from '../data/sacredBooks.js';

// Configure localforage for IndexedDB storage
localforage.config({
  name: 'SanatanLibrary',
  storeName: 'books_cache',
  description: 'Stores downloaded PDFs for offline reading'
});

// Maximum number of simultaneous local blob URLs kept in memory (cache at most 2-3 blob URLs)
const MAX_CACHED_BLOB_URLS = 3;

/**
 * LRU Cache for Object URLs: identifier -> { url: string, timestamp: number }
 * Ensures old blob URLs are revoked with URL.revokeObjectURL to avoid memory leaks.
 */
const blobUrlCache = new Map();

export const libraryService = {
  async searchBooks(query = '') {
    const q = query.toLowerCase().trim();
    if (!q) return SACRED_BOOKS;
    
    return SACRED_BOOKS.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.summary.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
    );
  },

  /**
   * Get the direct PDF URL for a book from Internet Archive
   * @param {string} identifier 
   */
  async getPdfUrl(identifier) {
    try {
      const response = await fetch(`https://archive.org/metadata/${identifier}`);
      const data = await response.json();
      
      const pdfFile = data.files.find(f => f.name.endsWith('.pdf'));
      if (pdfFile) {
        return `https://archive.org/download/${identifier}/${pdfFile.name}`;
      }
      return null;
    } catch (error) {
      console.error('Failed to get PDF URL:', error);
      return null;
    }
  },

  /**
   * Download a PDF and save it to IndexedDB
   * @param {string} identifier 
   * @param {Function} onProgress 
   */
  async downloadAndCacheBook(identifier) {
    try {
      const pdfUrl = await this.getPdfUrl(identifier);
      if (!pdfUrl) throw new Error('PDF not found for this book');

      // Fetch the blob
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Network response was not ok');

      const blob = await response.blob();
      
      // Save to IndexedDB
      await localforage.setItem(`book_${identifier}`, blob);
      return true;
    } catch (error) {
      console.error('Failed to download book:', error);
      throw error;
    }
  },

  /**
   * Check if a book is already downloaded
   * @param {string} identifier 
   */
  async isBookDownloaded(identifier) {
    try {
      const blob = await localforage.getItem(`book_${identifier}`);
      return blob !== null;
    } catch {
      return false;
    }
  },

  /**
   * Get the local Blob URL for a downloaded book with LRU cache & automatic revocation.
   * Caches at most 2-3 blob URLs to prevent unbounded memory growth.
   * @param {string} identifier 
   */
  async getLocalBookUrl(identifier) {
    try {
      // 1. If already cached in active blob URLs, return cached URL and refresh timestamp
      if (blobUrlCache.has(identifier)) {
        const cached = blobUrlCache.get(identifier);
        cached.timestamp = Date.now();
        return cached.url;
      }

      // 2. Fetch blob from localforage (IndexedDB)
      const blob = await localforage.getItem(`book_${identifier}`);
      if (!blob) return null;

      // 3. Enforce maximum cache limit (at most 2-3 blob URLs)
      if (blobUrlCache.size >= MAX_CACHED_BLOB_URLS) {
        let oldestId = null;
        let oldestTime = Infinity;
        for (const [id, entry] of blobUrlCache.entries()) {
          if (entry.timestamp < oldestTime) {
            oldestTime = entry.timestamp;
            oldestId = id;
          }
        }
        if (oldestId) {
          const evicted = blobUrlCache.get(oldestId);
          try {
            URL.revokeObjectURL(evicted.url);
          } catch (e) {
            console.warn('[LibraryService] Error revoking evicted object URL:', e);
          }
          blobUrlCache.delete(oldestId);
        }
      }

      // 4. Create new object URL and cache it
      const newUrl = URL.createObjectURL(blob);
      blobUrlCache.set(identifier, { url: newUrl, timestamp: Date.now() });
      return newUrl;
    } catch (error) {
      console.error('Failed to get local book:', error);
      return null;
    }
  },

  /**
   * Explicitly revoke a specific book's object URL when closing or switching books
   * @param {string} identifier
   */
  revokeBookUrl(identifier) {
    if (blobUrlCache.has(identifier)) {
      const entry = blobUrlCache.get(identifier);
      try {
        URL.revokeObjectURL(entry.url);
      } catch (e) {
        console.warn('[LibraryService] Error revoking object URL:', e);
      }
      blobUrlCache.delete(identifier);
      return true;
    }
    return false;
  },

  /**
   * Revoke all cached blob URLs (e.g. on unmount or memory cleanup)
   */
  revokeAllBookUrls() {
    for (const [, entry] of blobUrlCache.entries()) {
      try {
        URL.revokeObjectURL(entry.url);
      } catch (e) {
        console.warn('[LibraryService] Error revoking object URL:', e);
      }
    }
    blobUrlCache.clear();
  },

  /**
   * Get count of currently active cached blob URLs
   */
  getCachedBlobUrlCount() {
    return blobUrlCache.size;
  },

  /**
   * Delete a downloaded book and revoke its active blob URL
   * @param {string} identifier 
   */
  async deleteBook(identifier) {
    this.revokeBookUrl(identifier);
    await localforage.removeItem(`book_${identifier}`);
  }
};
