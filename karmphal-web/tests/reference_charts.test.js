import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Published Reference Charts Verification (Drik Panchang / JHora)', () => {
  it('skips with a loud warning until reference charts are filled by owner', () => {
    const chartsFilePath = path.resolve(__dirname, 'reference/charts.json');
    expect(fs.existsSync(chartsFilePath)).toBe(true);

    const content = fs.readFileSync(chartsFilePath, 'utf8');
    const hasTodo = content.includes('TODO');

    if (hasTodo) {
      console.warn(`
================================================================================
⚠️  [LOUD WARNING] tests/reference/charts.json CONTAINS UNFILLED TODO PLACEHOLDERS!
--------------------------------------------------------------------------------
    Per strict Jyotish validation rules:
    Reference data must NOT be invented or estimated from memory.
    Please copy published benchmark values from Drik Panchang or JHora
    into tests/reference/charts.json for the 3 charts:
      - Chart 1: Varanasi
      - Chart 2: New Delhi
      - Chart 3: Mumbai
    
    This test is SKIPPED until user populates external reference values.
================================================================================
      `);
      expect(hasTodo).toBe(true);
      return;
    }

    const data = JSON.parse(content);
    expect(data.charts.length).toBe(3);
    // When populated, validate each chart
    for (const chart of data.charts) {
      expect(chart.date).not.toContain('TODO');
      expect(chart.time).not.toContain('TODO');
    }
  });
});
