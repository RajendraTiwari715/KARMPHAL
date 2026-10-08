import assert from 'node:assert';
import { 
  computePlanetaryPositions, 
  getJulianDay, 
  calculateLahiriAyanamsa,
  getCoordinatesForCity,
  EPHEMERIS_METADATA 
} from '../src/services/ephemerisEngine.js';

import { calculateAshtakoot } from '../src/services/ashtakootEngine.js';

// Polyfill for ES modules if needed, but since we are running via node, it might require package.json type module.
// We will test if the engine runs correctly with edge cases.

console.log('--- karmphal Ephemeris Engine Tests ---');
console.log('Engine Version:', EPHEMERIS_METADATA.engineVersion);

try {
  // Test 1: Julian Day Calculation (J2000 epoch check)
  // J2000.0 is exactly 2000-01-01T12:00:00Z -> JD 2451545.0
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const jd2000 = getJulianDay(j2000);
  assert.ok(Math.abs(jd2000 - 2451545.0) < 0.001, 'Julian Day at J2000 should be 2451545.0');
  console.log('✅ Julian Day Calculation Passed');

  // Test 2: Ayanamsa (Around 23.85 at J2000)
  const ayanamsa2000 = calculateLahiriAyanamsa(j2000);
  assert.ok(Math.abs(ayanamsa2000 - 23.85) < 0.1, 'Ayanamsa should be ~23.85 at J2000');
  console.log('✅ Ayanamsa Calculation Passed');

  // Test 3: Leap Year (Feb 29, 2024)
  const leapDate = new Date('2024-02-29T12:00:00Z');
  const leapPlanets = computePlanetaryPositions(leapDate, 28.6139, 77.2090);
  assert.ok(leapPlanets.length === 10, 'Should return 10 celestial bodies');
  const leapSun = leapPlanets.find(p => p.name === 'सूर्य');
  assert.ok(leapSun.longitude > 0 && leapSun.longitude < 360, 'Sun longitude valid');
  console.log('✅ Leap Year Boundary Calculation Passed');

  // Test 4: Missing or invalid location (Should fallback to Delhi)
  const fallbackCoords = getCoordinatesForCity('SomeRandomCityXYZ');
  assert.strictEqual(fallbackCoords.lat, 28.6139, 'Fallback latitude is Delhi');
  console.log('✅ Location Fallback Passed');

  // Test 5: Ashtakoot Score Calculation
  const groom = { nakshatraId: 4 /* Rohini */, pada: 2, rashiId: 2 /* Taurus */, marsHouse: 1 };
  const bride = { nakshatraId: 13 /* Hasta */, pada: 1, rashiId: 6 /* Virgo */, marsHouse: 4 };
  const milan = calculateAshtakoot(groom, bride);
  assert.ok(milan.totalScore >= 0 && milan.totalScore <= 36, 'Score must be between 0 and 36');
  assert.strictEqual(milan.maxScore, 36, 'Max score should be exposed');
  assert.ok(milan.manglik.status.includes('Both charts possess Kuja Dosha') || milan.manglik.status.includes('Single Manglik'), 'Manglik Dosha detected');
  console.log('✅ Ashtakoot Engine Calculations Passed');

  console.log('----------------------------------------');
  console.log('🎯 ALL ASTROLOGICAL TESTS PASSED SUCESSFULLY');
} catch (err) {
  console.error('❌ Test Failed:', err.message);
  process.exit(1);
}
