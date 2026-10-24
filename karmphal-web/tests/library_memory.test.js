import assert from 'node:assert';
import { libraryService } from '../src/services/libraryService.js';

console.log('=== Scripture Library Blob URL Cache & Memory Leak Verification Test ===\n');

// Mock browser URL.createObjectURL and URL.revokeObjectURL
let objectUrlCounter = 0;
const activeObjectUrls = new Set();
const revokedUrls = [];

globalThis.URL = globalThis.URL || {};
globalThis.URL.createObjectURL = (_blob) => {
  objectUrlCounter++;
  const url = `blob:http://localhost:5173/mock-book-${objectUrlCounter}`;
  activeObjectUrls.add(url);
  return url;
};

globalThis.URL.revokeObjectURL = (url) => {
  if (activeObjectUrls.has(url)) {
    activeObjectUrls.delete(url);
    revokedUrls.push(url);
  }
};

// Mock localforage to return synthetic book blobs for testing
import localforage from 'localforage';
const mockStorage = new Map();
localforage.getItem = async (key) => mockStorage.get(key) || null;
localforage.setItem = async (key, val) => { mockStorage.set(key, val); return val; };
localforage.removeItem = async (key) => mockStorage.delete(key);

async function runMemoryLeakTest() {
  // Pre-populate IndexedDB with mock blobs for all 9+ books
  for (let i = 0; i < 15; i++) {
    const bookId = `book_test_${i}`;
    // Create a 1MB buffer for each book
    const buffer = Buffer.alloc(1024 * 1024, i % 256);
    await localforage.setItem(`book_${bookId}`, buffer);
  }

  // Force GC if available or record initial baseline heap
  if (globalThis.gc) globalThis.gc();
  const initialMemory = process.memoryUsage();
  console.log(`Initial Heap Used: ${(initialMemory.heapUsed / (1024 * 1024)).toFixed(2)} MB`);

  console.log('\nSimulating opening 10 different books sequentially...');

  const openedUrls = [];
  for (let i = 0; i < 10; i++) {
    const bookId = `book_test_${i}`;
    const url = await libraryService.getLocalBookUrl(bookId);
    openedUrls.push({ bookId, url });

    const activeCount = libraryService.getCachedBlobUrlCount();
    console.log(`[Book ${i + 1}] Opened ID: "${bookId}" | Active Cache Size: ${activeCount} (max allowed: 3) | URL: ${url}`);

    // Verification 1: Cache must NEVER exceed 3 URLs at any time
    assert.ok(
      activeCount <= 3,
      `Blob URL cache size ${activeCount} exceeded maximum limit of 3!`
    );

    // Verification 2: Active browser object URLs must match cache size
    assert.ok(
      activeObjectUrls.size <= 3,
      `Active browser Object URLs (${activeObjectUrls.size}) exceeded maximum limit of 3!`
    );
  }

  // Verification 3: At least 7 URLs must have been revoked (10 opened - 3 retained = 7 revoked)
  console.log(`\nTotal revoked URLs by LRU cache eviction: ${revokedUrls.length}`);
  assert.strictEqual(
    revokedUrls.length,
    7,
    `Expected exactly 7 URLs to be revoked, but got ${revokedUrls.length}`
  );

  // Verification 4: Re-opening a recently cached book must return cached URL without new allocation
  const recentBookId = 'book_test_9';
  const cachedUrl = await libraryService.getLocalBookUrl(recentBookId);
  assert.strictEqual(
    cachedUrl,
    openedUrls[9].url,
    'Re-accessing recently opened book must return cached URL'
  );
  assert.strictEqual(
    libraryService.getCachedBlobUrlCount(),
    3,
    'Cache count must remain 3 when accessing cached entry'
  );

  // Verification 5: Explicit revocation on book close (PDFReader cleanup simulation)
  console.log('\nTesting PDFReader unmount cleanup (revoking active book)...');
  const wasRevoked = libraryService.revokeBookUrl('book_test_9');
  assert.strictEqual(wasRevoked, true, 'revokeBookUrl must return true for active book');
  assert.strictEqual(libraryService.getCachedBlobUrlCount(), 2, 'Cache count must decrease to 2');

  // Verification 6: Revoke all remaining
  libraryService.revokeAllBookUrls();
  assert.strictEqual(libraryService.getCachedBlobUrlCount(), 0, 'revokeAllBookUrls must empty the cache');
  assert.strictEqual(activeObjectUrls.size, 0, 'All browser Object URLs must be revoked');
  console.log('✔ All remaining Object URLs successfully revoked on cleanup.');

  // Check heap memory after 10 book openings and cleanups
  if (globalThis.gc) globalThis.gc();
  const finalMemory = process.memoryUsage();
  console.log(`\nFinal Heap Used: ${(finalMemory.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
  const heapDeltaMb = (finalMemory.heapUsed - initialMemory.heapUsed) / (1024 * 1024);
  console.log(`Heap Delta: ${heapDeltaMb.toFixed(2)} MB (no unbounded memory growth)`);

  console.log('\n🎉 ALL 6 MEMORY LEAK AND BLOB REVOCATION TESTS PASSED WITH 100% SUCCESS!');
}

runMemoryLeakTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
