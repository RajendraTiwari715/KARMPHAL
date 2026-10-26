import { describe, it, expect, beforeEach, vi } from 'vitest';
import { libraryService } from '../src/services/libraryService';
import localforage from 'localforage';

describe('Library Service LRU Cache & Object URL Revocation Tests', () => {
  const inMemoryBlobs = new Map();

  beforeEach(() => {
    inMemoryBlobs.clear();
    libraryService.revokeAllBookUrls();

    vi.spyOn(localforage, 'getItem').mockImplementation(async (key) => {
      return inMemoryBlobs.get(key) || null;
    });

    vi.spyOn(localforage, 'setItem').mockImplementation(async (key, val) => {
      inMemoryBlobs.set(key, val);
      return val;
    });
  });

  it('enforces maximum 3 active blob URLs and revokes evicted URLs', async () => {
    // Populate 6 mock book blobs
    for (let i = 1; i <= 6; i++) {
      const mockBlob = new Blob([`mock-content-for-book-${i}`], { type: 'application/pdf' });
      await localforage.setItem(`book_id_${i}`, mockBlob);
    }

    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');

    // Open books 1, 2, 3
    const url1 = await libraryService.getLocalBookUrl('id_1');
    const url2 = await libraryService.getLocalBookUrl('id_2');
    const url3 = await libraryService.getLocalBookUrl('id_3');

    expect(libraryService.getCachedBlobUrlCount()).toBe(3);
    expect(revokeSpy).not.toHaveBeenCalled();

    // Opening book 4 must evict oldest (id_1) and revoke url1
    await libraryService.getLocalBookUrl('id_4');
    expect(libraryService.getCachedBlobUrlCount()).toBe(3);
    expect(revokeSpy).toHaveBeenCalledWith(url1);

    // Opening book 5 must evict id_2 and revoke url2
    await libraryService.getLocalBookUrl('id_5');
    expect(libraryService.getCachedBlobUrlCount()).toBe(3);
    expect(revokeSpy).toHaveBeenCalledWith(url2);

    // Opening book 6 must evict id_3 and revoke url3
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

    // Now open book_4. The oldest book is book_2 (since book_1 was refreshed).
    // Therefore, book_2 must be evicted, NOT book_1!
    await libraryService.getLocalBookUrl('book_4');
    expect(revokeSpy).toHaveBeenCalledWith(url2);
    expect(revokeSpy).not.toHaveBeenCalledWith(url1);
  });

  it('explicitly revokes book URL with revokeBookUrl', async () => {
    await localforage.setItem('book_single', new Blob(['data']));
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');

    const url = await libraryService.getLocalBookUrl('single');
    expect(libraryService.getCachedBlobUrlCount()).toBe(1);

    libraryService.revokeBookUrl('single');
    expect(revokeSpy).toHaveBeenCalledWith(url);
    expect(libraryService.getCachedBlobUrlCount()).toBe(0);
  });
});
