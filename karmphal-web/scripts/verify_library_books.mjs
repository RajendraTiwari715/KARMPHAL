import assert from 'node:assert';
import { SACRED_BOOKS } from '../src/data/sacredBooks.js';

console.log('=== Sanatan Scripture Library Integrity & URL Verification Script ===\n');

async function verifyLibrary() {
  console.log(`Total books configured: ${SACRED_BOOKS.length}\n`);

  // 1. Verify Uniqueness of IDs
  const idSet = new Set();
  const duplicates = [];

  for (const book of SACRED_BOOKS) {
    if (idSet.has(book.id)) {
      duplicates.push(book.id);
    }
    idSet.add(book.id);
  }

  assert.strictEqual(
    duplicates.length,
    0,
    `Duplicate Internet Archive IDs detected: ${duplicates.join(', ')}`
  );
  console.log(`✅ ID Uniqueness Check: All ${SACRED_BOOKS.length} book IDs are strictly distinct and unique.\n`);

  // 2. Verify Schema Fields
  for (const book of SACRED_BOOKS) {
    assert.ok(book.id && typeof book.id === 'string', `Missing ID for book ${book.title}`);
    assert.ok(book.title && typeof book.title === 'string', `Missing Title for book ${book.id}`);
    assert.ok(book.author && typeof book.author === 'string', `Missing Author for book ${book.id}`);
    assert.ok(book.language && typeof book.language === 'string', `Missing Language for book ${book.id}`);
    assert.ok(book.sourceUrl.startsWith('https://archive.org/details/'), `Invalid Source URL for ${book.id}`);
    assert.ok(book.coverUrl.startsWith('https://archive.org/services/img/'), `Invalid Cover URL for ${book.id}`);
  }
  console.log('✅ Data Typing & Schema Check: All books have valid title, author, language, sourceUrl, and coverUrl.\n');

  // 3. Verify Live Resolution on Internet Archive
  console.log('Resolving metadata and PDF existence via Internet Archive API...');
  let failureCount = 0;

  for (const book of SACRED_BOOKS) {
    const metaUrl = `https://archive.org/metadata/${book.id}`;
    try {
      const response = await fetch(metaUrl);
      if (!response.ok) {
        console.error(`❌ [${book.id}] HTTP error ${response.status} when fetching metadata`);
        failureCount++;
        continue;
      }

      const data = await response.json();
      if (!data.metadata) {
        console.error(`❌ [${book.id}] No metadata object returned from Internet Archive`);
        failureCount++;
        continue;
      }

      const pdfFiles = (data.files || []).filter(
        f => f.name && f.name.toLowerCase().endsWith('.pdf')
      );

      if (pdfFiles.length === 0) {
        console.error(`❌ [${book.id}] No downloadable PDF file found in item`);
        failureCount++;
        continue;
      }

      const iaTitle = data.metadata.title;
      console.log(`✔ [${book.id}] Resolves OK | IA Title: "${Array.isArray(iaTitle) ? iaTitle[0] : iaTitle}" | PDF: "${pdfFiles[0].name}" (${Math.round((pdfFiles[0].size || 0) / (1024 * 1024))} MB)`);
    } catch (err) {
      console.error(`❌ [${book.id}] Fetch failed: ${err.message}`);
      failureCount++;
    }
  }

  if (failureCount > 0) {
    console.error(`\n❌ VERIFICATION FAILED: ${failureCount} books failed to resolve properly.`);
    process.exit(1);
  }

  console.log('\n🎉 ALL SCRIPTURE LIBRARY IDENTIFIERS ARE UNIQUE AND RESOLVE TO VALID PDFS!');
}

verifyLibrary().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
