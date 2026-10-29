import { describe, it, expect } from 'vitest';
import * as Astronomy from 'astronomy-engine';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  computePlanetaryPositions,
  calculateLahiriAyanamsa
} from '../src/services/ephemerisEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function angularDifference(deg1, deg2) {
  let diff = Math.abs(deg1 - deg2) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

describe('Ephemeris Engine Verification & Astronomical Accuracy Benchmark', () => {

  /**
   * TEST 1: Internal Integration & Transcription Check (ephemerisEngine.js vs astronomy-engine)
   * -----------------------------------------------------------------------------------------
   * NOTE ON ACCURACY VS INTEGRATION:
   * ephemerisEngine.js calls astronomy-engine internally for tropical planetary longitudes.
   * Therefore, comparing (sidereal + ayanamsa) against direct astronomy-engine will yield
   * ~0.000000° deviation. This test confirms that ephemerisEngine.js correctly passes date
   * objects and unwraps coordinate structures without transcription or arithmetic bugs.
   * It validates integration fidelity, NOT independent astronomical correctness.
   */
  describe('Part 1: ephemerisEngine Integration & Transcription Fidelity (200 Dates)', () => {
    it('verifies ephemerisEngine correctly wraps astronomy-engine without transcription errors', () => {
      const minTime = new Date('1900-01-01T00:00:00Z').getTime();
      const maxTime = new Date('2100-01-01T00:00:00Z').getTime();

      let seed = 123456789;
      function seededRandom() {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      }

      const SAMPLE_COUNT = 200;
      const stats = {
        Sun: { max: 0, sum: 0, name: 'सूर्य' },
        Moon: { max: 0, sum: 0, name: 'चन्द्र' },
        Mars: { max: 0, sum: 0, name: 'मंगल', body: Astronomy.Body.Mars },
        Mercury: { max: 0, sum: 0, name: 'बुध', body: Astronomy.Body.Mercury },
        Jupiter: { max: 0, sum: 0, name: 'गुरु', body: Astronomy.Body.Jupiter },
        Venus: { max: 0, sum: 0, name: 'शुक्र', body: Astronomy.Body.Venus },
        Saturn: { max: 0, sum: 0, name: 'शनि', body: Astronomy.Body.Saturn }
      };

      for (let i = 0; i < SAMPLE_COUNT; i++) {
        const randomTime = minTime + seededRandom() * (maxTime - minTime);
        const date = new Date(randomTime);
        const ayanamsa = calculateLahiriAyanamsa(date);
        const enginePlanets = computePlanetaryPositions(date);
        const astroTime = Astronomy.MakeTime(date);

        // 1. Sun
        const directSun = (Astronomy.SunPosition(astroTime).elon % 360 + 360) % 360;
        const engineSun = (enginePlanets.find(p => p.name === 'सूर्य').longitude + ayanamsa) % 360;
        const diffSun = angularDifference(directSun, engineSun);
        stats.Sun.max = Math.max(stats.Sun.max, diffSun);
        stats.Sun.sum += diffSun;

        // 2. Moon
        const directMoon = (Astronomy.EclipticGeoMoon(astroTime).lon % 360 + 360) % 360;
        const engineMoon = (enginePlanets.find(p => p.name === 'चन्द्र').longitude + ayanamsa) % 360;
        const diffMoon = angularDifference(directMoon, engineMoon);
        stats.Moon.max = Math.max(stats.Moon.max, diffMoon);
        stats.Moon.sum += diffMoon;

        // 3. Planets
        for (const [, planetStat] of Object.entries(stats)) {
          if (!planetStat.body) continue;
          const geoVec = Astronomy.GeoVector(planetStat.body, astroTime, true);
          const directTrop = (Astronomy.Ecliptic(geoVec).elon % 360 + 360) % 360;
          const engineSidereal = enginePlanets.find(p => p.name === planetStat.name).longitude;
          const engineTrop = (engineSidereal + ayanamsa) % 360;
          const diff = angularDifference(directTrop, engineTrop);
          planetStat.max = Math.max(planetStat.max, diff);
          planetStat.sum += diff;
        }
      }

      console.log('\n========================================================================================');
      console.log('📋 EPHEMERIS ENGINE INTERNAL INTEGRATION FIDELITY CHECK (200 RANDOM DATES: 1900–2100)');
      console.log('   (Validates ephemerisEngine correctly interfaces astronomy-engine without wrapper bugs)');
      console.log('========================================================================================');
      console.log('| Celestial Body | Samples | Max Deviation (deg) | Mean Deviation (deg) | Wrapper Integrity |');
      console.log('|:---|:---:|:---:|:---:|:---:|');

      for (const [key, s] of Object.entries(stats)) {
        const mean = s.sum / SAMPLE_COUNT;
        // Floating point consistency threshold (1e-4 deg)
        expect(s.max).toBeLessThan(1e-4);
        console.log(
          `| ${key.padEnd(14)} | ${SAMPLE_COUNT.toString().padStart(7)} | ${s.max.toFixed(6).padStart(19)} | ${mean.toFixed(6).padStart(20)} | ✅ 100% MATCH |`
        );
      }
      console.log('========================================================================================\n');
    });
  });

  /**
   * TEST 2: Real Independent Accuracy Benchmark (astronomy-engine Raw vs NASA JPL Horizons DE441)
   * --------------------------------------------------------------------------------------------
   * Independent Source: NASA Jet Propulsion Laboratory (JPL) Horizons On-Line Ephemeris System
   * Coordinate Frame: Geocentric Apparent Ecliptic Longitude (QUANTITIES=31, CENTER=500@399)
   * Ephemeris: JPL DE441 high-precision numerical integration
   * Stated Astronomy Engine Accuracy: Within ±1 arcminute (±0.0167° / 60 arcseconds) of NOVAS/JPL
   */
  describe('Part 2: Real Independent Benchmark: Raw astronomy-engine vs NASA JPL Horizons (10 Dates)', () => {
    it('verifies raw astronomy-engine against NASA JPL Horizons across 10 deterministic dates within ±1 arcminute', () => {
      const fixturePath = path.resolve(__dirname, 'reference/jpl_horizons_10dates.json');
      expect(fs.existsSync(fixturePath)).toBe(true);

      const benchmarkData = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
      const samples = benchmarkData.samples;
      expect(samples.length).toBe(10);

      const BODIES = [
        { name: 'Sun', getAstro: (t) => (Astronomy.SunPosition(t).elon % 360 + 360) % 360 },
        { name: 'Moon', getAstro: (t) => (Astronomy.EclipticGeoMoon(t).lon % 360 + 360) % 360 },
        { name: 'Mars', getAstro: (t) => (Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Mars, t, true)).elon % 360 + 360) % 360 },
        { name: 'Venus', getAstro: (t) => (Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Venus, t, true)).elon % 360 + 360) % 360 },
        { name: 'Jupiter', getAstro: (t) => (Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Jupiter, t, true)).elon % 360 + 360) % 360 },
        { name: 'Saturn', getAstro: (t) => (Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Saturn, t, true)).elon % 360 + 360) % 360 }
      ];

      // ±1 arcminute threshold = 1/60 degree = 0.016667 degrees (60 arcseconds)
      const THRESHOLD_ARCMIN = 1.0;

      const bodyStats = {};
      for (const b of BODIES) {
        bodyStats[b.name] = { maxDeg: 0, sumDeg: 0, maxArcmin: 0, maxArcsec: 0, count: 0 };
      }

      console.log('\n=========================================================================================================');
      console.log('🔭 REAL INDEPENDENT BENCHMARK: RAW astronomy-engine vs NASA JPL HORIZONS API (DE441)');
      console.log('   (10 Deterministic Dates Spanning 1925 to 2075 — Measuring Actual Non-Zero Deviations)');
      console.log('=========================================================================================================');

      for (const sample of samples) {
        const date = new Date(sample.dateUtc);
        const astroTime = Astronomy.MakeTime(date);

        for (const b of BODIES) {
          const jplLon = sample.bodies[b.name].jplLon;
          const astroLon = b.getAstro(astroTime);
          const diffDeg = angularDifference(astroLon, jplLon);
          const diffArcmin = diffDeg * 60;
          const diffArcsec = diffDeg * 3600;

          // Verify deviation is within the library's stated ±1 arcminute tolerance
          expect(diffArcmin).toBeLessThanOrEqual(THRESHOLD_ARCMIN);

          const s = bodyStats[b.name];
          s.count++;
          s.sumDeg += diffDeg;
          if (diffDeg > s.maxDeg) {
            s.maxDeg = diffDeg;
            s.maxArcmin = diffArcmin;
            s.maxArcsec = diffArcsec;
          }
        }
      }

      console.log('| Celestial Body | Samples | Max Diff (deg) | Max Diff (arcmin) | Max Diff (arcsec) | Mean Diff (arcmin) | Limit (±1\') | Pass |');
      console.log('|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|');

      for (const b of BODIES) {
        const s = bodyStats[b.name];
        const meanArcmin = (s.sumDeg / s.count) * 60;
        const pass = s.maxArcmin <= THRESHOLD_ARCMIN;
        console.log(
          `| ${b.name.padEnd(14)} | ${s.count.toString().padStart(7)} | ${s.maxDeg.toFixed(6).padStart(14)} | ${s.maxArcmin.toFixed(4).padStart(17)} | ${s.maxArcsec.toFixed(2).padStart(17)} | ${meanArcmin.toFixed(4).padStart(18)} | <= 1.0'     | ${pass ? '✅ PASS' : '❌ FAIL'} |`
        );
        expect(pass).toBe(true);
      }
      console.log('=========================================================================================================\n');
    });
  });
});
