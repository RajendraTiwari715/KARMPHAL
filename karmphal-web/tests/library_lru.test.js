import { describe, it, expect, beforeEach, vi } from 'vitest';
import { libraryService } from '../src/services/libraryService';
import localforage from 'localforage';
import { SACRED_BOOKS } from '../src/data/sacredBooks';

describe('Library Service LRU Cache & Methods Unit Tests', () => {
  const inMemoryBlobs = new Map();

  beforeEach(() => {
    inMemoryBlobs.clear();
    libraryService.revokeAllBookUrls();
    vi.restoreAllMocks();

    vi.spyOn(localforage, 'getItem').mockImplementation(async (key) => {
      return inMemoryBlobs.get(key) || null;
    });

    vi.spyOn(localforage, 'setItem').mockImplementation(async (key, val) => {
      inMemoryBlobs.set(key, val);
      return val;
    });

    vi.spyOn(localforage, 'removeItem').mockImplementation(async (key) => {
      inMemoryBlobs.delete(key);
      return true;
    });
  });

  describe('searchBooks', () => {
    it('returns all books when query is empty or whitespace', async () => {
      const all1 = await libraryService.searchBooks('');
      expect(all1).toEqual(SACRED_BOOKS);
      const all2 = await libraryService.searchBooks('   ');
      expect(all2).toEqual(SACRED_BOOKS);
    });

    it('filters books by title, summary, or author case-insensitively', async () => {
      const byTitle = await libraryService.searchBooks('गीता');
      expect(byTitle.length).toBeGreaterThan(0);
      expect(byTitle.some(b => b.title.includes('गीता'))).toBe(true);

      const byAuthor = await libraryService.searchBooks('वेदव्यास');
      expect(byAuthor.length).toBeGreaterThan(0);
      expect(byAuthor.some(b => b.author.includes('वेदव्यास'))).toBe(true);

      const bySummary = await libraryService.searchBooks('कर्मयोग');
      expect(Array.isArray(bySummary)).toBe(true);
      expect(bySummary.length).toBeGreaterThan(0);
    });
  });

  describe('getPdfUrl', () => {
    it('fetches metadata and returns direct download link when pdf file exists', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        json: async () => ({
          files: [
            { name: 'cover.jpg' },
            { name: 'bhagavad_gita.pdf' }
          ]
        })
      });

      const url = await libraryService.getPdfUrl('gita_identifier');
      expect(url).toBe('https://archive.org/download/gita_identifier/bhagavad_gita.pdf');
    });

    it('returns null when metadata contains no PDF file', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        json: async () => ({
          files: [{ name: 'audio.mp3' }]
        })
      });

      const url = await libraryService.getPdfUrl('audio_only');
      expect(url).toBeNull();
    });

    it('returns null when fetch fails or network throws error', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('DNS lookup failed'));
      const url = await libraryService.getPdfUrl('invalid_id');
      expect(url).toBeNull();
    });
  });

  describe('downloadAndCacheBook', () => {
    it('throws error when PDF url cannot be resolved', async () => {
      vi.spyOn(libraryService, 'getPdfUrl').mockResolvedValueOnce(null);
      await expect(libraryService.downloadAndCacheBook('missing_pdf')).rejects.toThrow(
        'PDF not found for this book'
      );
    });

    it('throws error when network fetch for PDF blob fails', async () => {
      vi.spyOn(libraryService, 'getPdfUrl').mockResolvedValueOnce('https://archive.org/download/test.pdf');
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(libraryService.downloadAndCacheBook('bad_network')).rejects.toThrow(
        'Network response was not ok'
      );
    });

    it('downloads and saves blob to localforage cache on success', async () => {
      const mockBlob = new Blob(['pdf-raw-bytes'], { type: 'application/pdf' });
      vi.spyOn(libraryService, 'getPdfUrl').mockResolvedValueOnce('https://archive.org/download/test.pdf');
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob
      });

      const result = await libraryService.downloadAndCacheBook('success_book');
      expect(result).toBe(true);
      expect(inMemoryBlobs.has('book_success_book')).toBe(true);
      expect(inMemoryBlobs.get('book_success_book')).toBe(mockBlob);
    });
  });

  describe('isBookDownloaded', () => {
    it('returns true when book is present in cache', async () => {
      inMemoryBlobs.set('book_gita', new Blob(['data']));
      const exists = await libraryService.isBookDownloaded('gita');
      expect(exists).toBe(true);
    });

    it('returns false when book is missing from cache', async () => {
      const exists = await libraryService.isBookDownloaded('unknown_book');
      expect(exists).toBe(false);
    });

    it('returns false when localforage throws an error', async () => {
      vi.spyOn(localforage, 'getItem').mockRejectedValueOnce(new Error('DB corrupted'));
      const exists = await libraryService.isBookDownloaded('corrupted_book');
      expect(exists).toBe(false);
    });
  });

  describe('deleteBook', () => {
    it('removes item from storage and revokes any active object URL', async () => {
      const mockBlob = new Blob(['data']);
      inMemoryBlobs.set('book_del', mockBlob);
      await libraryService.getLocalBookUrl('del');
      expect(libraryService.getCachedBlobUrlCount()).toBe(1);

      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
      await libraryService.deleteBook('del');

      expect(revokeSpy).toHaveBeenCalled();
      expect(inMemoryBlobs.has('book_del')).toBe(false);
      expect(libraryService.getCachedBlobUrlCount()).toBe(0);
    });
  });

  describe('LRU Cache & Blob URL Management', () => {
    it('returns null if book blob is not downloaded yet', async () => {
      const url = await libraryService.getLocalBookUrl('not_downloaded');
      expect(url).toBeNull();
    });

    it('handles exception in getLocalBookUrl and returns null', async () => {
      vi.spyOn(localforage, 'getItem').mockRejectedValueOnce(new Error('Storage failure'));
      const url = await libraryService.getLocalBookUrl('error_book');
      expect(url).toBeNull();
    });

    it('enforces maximum 3 active blob URLs and revokes evicted URLs', async () => {
      for (let i = 1; i <= 6; i++) {
        const mockBlob = new Blob([`mock-content-for-book-${i}`], { type: 'application/pdf' });
        await localforage.setItem(`book_id_${i}`, mockBlob);
      }

      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');

      const url1 = await libraryService.getLocalBookUrl('id_1');
      const url2 = await libraryService.getLocalBookUrl('id_2');
      const url3 = await libraryService.getLocalBookUrl('id_3');

      expect(libraryService.getCachedBlobUrlCount()).toBe(3);
      expect(revokeSpy).not.toHaveBeenCalled();

      await libraryService.getLocalBookUrl('id_4');
      expect(libraryService.getCachedBlobUrlCount()).toBe(3);
      expect(revokeSpy).toHaveBeenCalledWith(url1);

      await libraryService.getLocalBookUrl('id_5');
      expect(libraryService.getCachedBlobUrlCount()).toBe(3);
      expect(revokeSpy).toHaveBeenCalledWith(url2);

      await libraryService.getLocalBookUrl('id_6');
      expect(libraryService.getCachedBlobUrlCount()).toBe(3);
      expect(revokeSpy).toHaveBeenCalledWith(url3);
    });

    it('updates LRU timestamp on cache hit to prevent recently accessed book from eviction', async () => {
      for (let i = 1; i <= 4; i++) {
        await localforage.setItem(`book_book_${i}`, new Blob([`data-${i}`]));
      }

      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');

      const url1 = await libraryService.getLocalBookUrl('book_1');
      await new Promise(r => setTimeout(r, 5));
      const url2 = await libraryService.getLocalBookUrl('book_2');
      await new Promise(r => setTimeout(r, 5));
      await libraryService.getLocalBookUrl('book_3');

      // Re-access book_1 to make it most recently used
      await new Promise(r => setTimeout(r, 5));
      const reaccessedUrl1 = await libraryService.getLocalBookUrl('book_1');
      expect(reaccessedUrl1).toBe(url1);

      // Now open book_4. The oldest book is book_2.
      await libraryService.getLocalBookUrl('book_4');
      expect(revokeSpy).toHaveBeenCalledWith(url2);
      expect(revokeSpy).not.toHaveBeenCalledWith(url1);
    });

    it('explicitly revokes book URL with revokeBookUrl and returns false for unknown id', async () => {
      await localforage.setItem('book_single', new Blob(['data']));
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');

      const url = await libraryService.getLocalBookUrl('single');
      expect(libraryService.getCachedBlobUrlCount()).toBe(1);

      const revoked = libraryService.revokeBookUrl('single');
      expect(revoked).toBe(true);
      expect(revokeSpy).toHaveBeenCalledWith(url);
      expect(libraryService.getCachedBlobUrlCount()).toBe(0);

      const revokedAgain = libraryService.revokeBookUrl('non_existent');
      expect(revokedAgain).toBe(false);
    });

    it('safely handles error during revokeObjectURL', async () => {
      await localforage.setItem('book_err', new Blob(['data']));
      await libraryService.getLocalBookUrl('err');

      vi.spyOn(URL, 'revokeObjectURL').mockImplementationOnce(() => {
        throw new Error('Revoke failed');
      });

      expect(() => libraryService.revokeBookUrl('err')).not.toThrow();
      expect(libraryService.getCachedBlobUrlCount()).toBe(0);
    });
  });
});

