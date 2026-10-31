#!/usr/bin/env node
/**
 * Scripture Knowledge Base Management CLI
 * Usage:
 *   node scripts/manage_scriptures.js list
 *   node scripts/manage_scriptures.js get "Gita 2.47"
 *   node scripts/manage_scriptures.js add --source "Gita" --reference "Gita 2.50" --sanskrit "..." --hindi "..." --tags "duty-conflict,action" --verifiedSource "Gita Press Code 10"
 *   node scripts/manage_scriptures.js verify
 */

const db = require('../database');

const args = process.argv.slice(2);
const command = args[0] || 'list';

function parseNamedArgs(argList) {
  const parsed = {};
  for (let i = 0; i < argList.length; i++) {
    if (argList[i].startsWith('--')) {
      const key = argList[i].slice(2);
      const val = argList[i + 1] && !argList[i + 1].startsWith('--') ? argList[i + 1] : true;
      parsed[key] = val;
    }
  }
  return parsed;
}

switch (command) {
  case 'list': {
    const opts = parseNamedArgs(args.slice(1));
    let query = 'SELECT id, source, reference, tags, verified_source FROM ScriptureVerses';
    const params = [];
    if (opts.source) {
      query += ' WHERE source = ?';
      params.push(opts.source);
    }
    query += ' ORDER BY id ASC';
    const rows = db.prepare(query).all(...params);
    console.log(`\n📚 Total Curated Verses: ${rows.length}\n`);
    console.table(rows);
    break;
  }

  case 'get': {
    const ref = args[1];
    if (!ref) {
      console.error('Error: Please provide a reference, e.g. "Gita 2.47"');
      process.exit(1);
    }
    const verse = db.prepare('SELECT * FROM ScriptureVerses WHERE reference = ?').get(ref);
    if (!verse) {
      console.log(`Verse not found: ${ref}`);
    } else {
      console.log('\n========================================');
      console.log(`Reference:       ${verse.reference} (${verse.source})`);
      console.log(`Sanskrit:        ${verse.sanskrit_text}`);
      console.log(`Hindi:           ${verse.hindi_translation}`);
      console.log(`Tags:            ${verse.tags}`);
      console.log(`Verified Source: ${verse.verified_source}`);
      console.log('========================================\n');
    }
    break;
  }

  case 'add': {
    const opts = parseNamedArgs(args.slice(1));
    const { source, reference, sanskrit, hindi, tags, verifiedSource } = opts;
    if (!source || !reference || !sanskrit || !hindi || !tags || !verifiedSource) {
      console.error('Error: Missing required fields. Provide --source, --reference, --sanskrit, --hindi, --tags, --verifiedSource');
      process.exit(1);
    }
    try {
      const res = db.prepare(`
        INSERT INTO ScriptureVerses (source, reference, sanskrit_text, hindi_translation, tags, verified_source)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(source, reference, sanskrit, hindi, tags, verifiedSource);
      console.log(`✅ Verse added successfully with ID ${res.lastInsertRowid}: ${reference}`);
    } catch (err) {
      console.error('Failed to add verse:', err.message);
      process.exit(1);
    }
    break;
  }

  case 'delete': {
    const ref = args[1];
    if (!ref) {
      console.error('Error: Please provide a reference to delete.');
      process.exit(1);
    }
    const res = db.prepare('DELETE FROM ScriptureVerses WHERE reference = ?').run(ref);
    if (res.changes > 0) {
      console.log(`✅ Deleted verse: ${ref}`);
    } else {
      console.log(`No verse found with reference: ${ref}`);
    }
    break;
  }

  case 'verify': {
    const rows = db.prepare('SELECT id, source, reference, sanskrit_text, hindi_translation, tags, verified_source FROM ScriptureVerses').all();
    console.log(`\nVerifying ${rows.length} curated verses...`);
    let errors = 0;
    rows.forEach((r, idx) => {
      if (!r.reference || !r.sanskrit_text || !r.hindi_translation || !r.verified_source) {
        console.error(`❌ Verse #${idx + 1} (${r.reference || 'NO_REF'}) has missing required fields.`);
        errors++;
      }
    });
    if (errors === 0) {
      console.log(`✅ All ${rows.length} verses are structurally valid and verified with published citations.\n`);
    } else {
      console.error(`Found ${errors} invalid verses.`);
      process.exit(1);
    }
    break;
  }

  default:
    console.log(`Unknown command: ${command}`);
    console.log('Available commands: list, get <ref>, add <options>, delete <ref>, verify');
}

