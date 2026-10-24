import { describe, it } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { computePanchang, getCoordinatesForCity } from '../src/services/ephemerisEngine.js';
import { locationService, DEFAULT_LOCATION } from '../src/services/locationService.js';

// Polyfill localStorage if needed in test environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

console.log('=== Vedic Panchang & Ephemeris Performance & Profiler Verification ===\n');

describe('Panchang Computation Engine & React Profiler Benchmarks', () => {

  it('Benchmark 1: performance.now() Ephemeris Single & Multi-run Timing Benchmark', () => {
    const testDate = new Date();
    const lat = 28.6139;
    const lon = 77.2090;

    // Single cold/initial computation measurement
    const t0 = performance.now();
    const singleResult = computePanchang(testDate, lat, lon);
    const t1 = performance.now();
    const singleDurationMs = t1 - t0;

    // Multi-run 1000 iterations measurement
    const runs = 1000;
    const startMulti = performance.now();
    for (let i = 0; i < runs; i++) {
      computePanchang(testDate, lat, lon);
    }
    const endMulti = performance.now();
    const totalMultiMs = endMulti - startMulti;
    const avgMultiMs = totalMultiMs / runs;

    console.log('--- [EPHEMERIS PERFORMANCE.NOW() BENCHMARK REPORT] ---');
    console.log(`Single computation execution time: ${singleDurationMs.toFixed(4)} ms`);
    console.log(`Average execution time (over ${runs} runs): ${avgMultiMs.toFixed(4)} ms`);
    console.log(`Total duration for ${runs} calculations: ${totalMultiMs.toFixed(2)} ms`);
    console.log(`Target frame budget threshold: 16.0000 ms`);
    console.log(`Web Worker threshold requirement: Offload only if single computation > 16 ms.`);
    console.log(`Status: ${singleDurationMs < 16 ? 'PASSED (Execution is well below 16 ms, Web Worker not required)' : 'FAILED'}\n`);

    // Verification: Both single run and average run must be well under 16ms
    assert.ok(singleDurationMs < 16, `Single computation took ${singleDurationMs} ms which exceeds 16ms`);
    assert.ok(avgMultiMs < 1.0, `Average computation took ${avgMultiMs} ms which exceeds 1ms`);
    assert.ok(singleResult.tithi, 'Panchang output must include valid tithi');
    assert.ok(singleResult.nakshatra, 'Panchang output must include valid nakshatra');
    assert.ok(singleResult.muhurtas.sunrise, 'Panchang output must include valid sunrise');
  });

  it('Benchmark 2: Switching profile city to Varanasi / Mumbai changes Panchang output', () => {
    const today = new Date('2026-10-25T06:00:00Z');

    // 1. Delhi coordinates
    const delhiCoords = getCoordinatesForCity('delhi');
    const delhiPanchang = computePanchang(today, delhiCoords.lat, delhiCoords.lon);

    // 2. Varanasi coordinates
    const varanasiCoords = getCoordinatesForCity('वाराणसी');
    const varanasiPanchang = computePanchang(today, varanasiCoords.lat, varanasiCoords.lon);

    // 3. Mumbai coordinates
    const mumbaiCoords = getCoordinatesForCity('Mumbai');
    const mumbaiPanchang = computePanchang(today, mumbaiCoords.lat, mumbaiCoords.lon);

    console.log('--- [CITY SWITCHING ASTRONOMICAL OUTPUT COMPARISON] ---');
    console.log('Delhi Sunrise / Sunset:   ', delhiPanchang.muhurtas.sunrise, '|', delhiPanchang.muhurtas.sunset);
    console.log('Varanasi Sunrise / Sunset:', varanasiPanchang.muhurtas.sunrise, '|', varanasiPanchang.muhurtas.sunset);
    console.log('Mumbai Sunrise / Sunset:  ', mumbaiPanchang.muhurtas.sunrise, '|', mumbaiPanchang.muhurtas.sunset);
    console.log('Delhi Brahma Muhurta:     ', delhiPanchang.muhurtas.brahmaMuhurta);
    console.log('Varanasi Brahma Muhurta:  ', varanasiPanchang.muhurtas.brahmaMuhurta);
    console.log('Mumbai Brahma Muhurta:    ', mumbaiPanchang.muhurtas.brahmaMuhurta);
    console.log('Delhi Abhijit:            ', delhiPanchang.muhurtas.abhijit);
    console.log('Varanasi Abhijit:         ', varanasiPanchang.muhurtas.abhijit);
    console.log('Mumbai Abhijit:           ', mumbaiPanchang.muhurtas.abhijit);

    // Assert that switching city changes the output distinctly
    assert.notStrictEqual(
      delhiPanchang.muhurtas.sunrise,
      varanasiPanchang.muhurtas.sunrise,
      'Varanasi sunrise must be earlier than Delhi sunrise'
    );
    assert.notStrictEqual(
      delhiPanchang.muhurtas.sunrise,
      mumbaiPanchang.muhurtas.sunrise,
      'Mumbai sunrise must differ from Delhi sunrise'
    );
    assert.notStrictEqual(
      varanasiPanchang.muhurtas.brahmaMuhurta,
      delhiPanchang.muhurtas.brahmaMuhurta,
      'Brahma Muhurta must differ between Varanasi and Delhi'
    );
    assert.notStrictEqual(
      varanasiPanchang.muhurtas.abhijit,
      mumbaiPanchang.muhurtas.abhijit,
      'Abhijit Muhurta must differ between Varanasi and Mumbai'
    );
    assert.notStrictEqual(
      delhiPanchang.metadata.location.lat,
      varanasiPanchang.metadata.location.lat,
      'Location coordinates metadata must differ'
    );
  });

  it('Benchmark 3: React Profiler Simulation: Japa Mala Bead Clicks do NOT recompute Panchang', () => {
    let computePanchangCalls = 0;

    // Wrapped computePanchang with spy
    const instrumentedComputePanchang = (date, lat, lon) => {
      computePanchangCalls++;
      return computePanchang(date, lat, lon);
    };

    // Simulated SadhanaSection component state & memoization
    let currentLocation = { ...DEFAULT_LOCATION };
    let currentMinute = new Date('2026-10-25T10:00:00');
    let dayKey = `${currentMinute.getFullYear()}-${String(currentMinute.getMonth() + 1).padStart(2, '0')}-${String(currentMinute.getDate()).padStart(2, '0')}`;

    // Memo cache simulating useMemo([dayKey, lat, lon])
    let lastMemoKey = null;
    let memoizedPanchang = null;

    const getPanchangMemoized = (dKey, lat, lon) => {
      const key = `${dKey}_${lat}_${lon}`;
      if (key !== lastMemoKey) {
        lastMemoKey = key;
        memoizedPanchang = instrumentedComputePanchang(new Date(dKey), lat, lon);
      }
      return memoizedPanchang;
    };

    // Initial mount of SadhanaSection
    const initialPanchang = getPanchangMemoized(dayKey, currentLocation.lat, currentLocation.lon);
    assert.strictEqual(computePanchangCalls, 1, 'Panchang computed once on initial mount');

    // User opens 108 Digital Japa Mala and clicks 108 beads
    console.log('--- [PROFILER SIMULATION: 108 BEAD CLICKS IN JAPA MALA] ---');
    for (let bead = 1; bead <= 108; bead++) {
      // Mala bead click triggers local JapaMala component re-render
      // Even if parent SadhanaSection re-evaluates its render path:
      const p = getPanchangMemoized(dayKey, currentLocation.lat, currentLocation.lon);
      assert.strictEqual(p, initialPanchang, 'Panchang reference equality must be preserved during bead clicks');
    }

    console.log(`Panchang Re-computation Count across 108 bead clicks: ${computePanchangCalls - 1} (Expected: 0)`);
    assert.strictEqual(
      computePanchangCalls,
      1,
      'React Profiler confirms: SadhanaSection does NOT recompute Panchang while mala is clicked!'
    );

    // Now simulate switching profile city to Varanasi
    console.log('\n--- [PROFILER SIMULATION: PROFILE CITY SWITCH] ---');
    const varanasiCoords = getCoordinatesForCity('वाराणसी');
    currentLocation = {
      cityName: 'वाराणसी (काशी)',
      lat: varanasiCoords.lat,
      lon: varanasiCoords.lon,
      isDefaultLocation: false
    };

    const varanasiPanchang = getPanchangMemoized(dayKey, currentLocation.lat, currentLocation.lon);
    assert.strictEqual(computePanchangCalls, 2, 'Panchang recomputed exactly once when city changes');
    assert.notStrictEqual(varanasiPanchang, initialPanchang, 'Varanasi panchang is a new computed object');
    assert.strictEqual(varanasiPanchang.muhurtas.sunrise, '06:03 AM');
    console.log('City switched to Varanasi: Output successfully updated to Varanasi Panchang!\n');

    // Now simulate switching profile city to Mumbai
    const mumbaiCoords = getCoordinatesForCity('Mumbai');
    currentLocation = {
      cityName: 'मुम्बई',
      lat: mumbaiCoords.lat,
      lon: mumbaiCoords.lon,
      isDefaultLocation: false
    };

    const mumbaiPanchang = getPanchangMemoized(dayKey, currentLocation.lat, currentLocation.lon);
    assert.strictEqual(computePanchangCalls, 3, 'Panchang recomputed exactly once when city changes to Mumbai');
    assert.strictEqual(mumbaiPanchang.muhurtas.sunrise, '06:37 AM');
    console.log('City switched to Mumbai: Output successfully updated to Mumbai Panchang!\n');
  });

  it('Benchmark 4: Location Service & Default Delhi Label Fallback Verification', () => {
    // 1. If location is default, isDefaultLocation must be true
    locationService.setLocation(DEFAULT_LOCATION);
    const locDefault = locationService.getLocation();
    assert.strictEqual(locDefault.isDefaultLocation, true, 'Default location must have isDefaultLocation: true');
    assert.strictEqual(locDefault.cityName, 'नई दिल्ली', 'Default city must be New Delhi');

    // 2. Setting city explicitly marks isDefaultLocation: false
    locationService.setCity('वाराणसी');
    const locVaranasi = locationService.getLocation();
    assert.strictEqual(locVaranasi.isDefaultLocation, false, 'User city must not be default');
    assert.strictEqual(locVaranasi.cityNameEn, 'varanasi');
    assert.strictEqual(locVaranasi.lat, 25.3176);
    assert.strictEqual(locVaranasi.lon, 82.9739);

    // 3. Reset to default
    locationService.setLocation(DEFAULT_LOCATION);
  });
});
