import { describe, it, expect } from 'vitest';
import * as Astronomy from 'astronomy-engine';
import {
  computePlanetaryPositions,
  calculateLahiriAyanamsa
} from '../src/services/ephemerisEngine.js';

function angularDifference(deg1, deg2) {
  let diff = Math.abs(deg1 - deg2) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

describe('Astro Accuracy: 200 Random Dates Cross-Check (1900–2100)', () => {
  it('cross-checks engine tropical longitudes against direct astronomy-engine across 200 random dates', () => {
    // Epoch range: 1900-01-01 to 2100-01-01
    const minTime = new Date('1900-01-01T00:00:00Z').getTime();
    const maxTime = new Date('2100-01-01T00:00:00Z').getTime();

    // Deterministic pseudo-random number generator (LCCG) to make tests 100% reproducible
    let seed = 123456789;
    function seededRandom() {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    }

    const SAMPLE_COUNT = 200;
    const stats = {
      Sun: { max: 0, sum: 0, target: 0.05, name: 'सूर्य' },
      Moon: { max: 0, sum: 0, target: 0.05, name: 'चन्द्र' },
      Mars: { max: 0, sum: 0, target: 0.10, name: 'मंगल', body: Astronomy.Body.Mars },
      Mercury: { max: 0, sum: 0, target: 0.10, name: 'बुध', body: Astronomy.Body.Mercury },
      Jupiter: { max: 0, sum: 0, target: 0.10, name: 'गुरु', body: Astronomy.Body.Jupiter },
      Venus: { max: 0, sum: 0, target: 0.10, name: 'शुक्र', body: Astronomy.Body.Venus },
      Saturn: { max: 0, sum: 0, target: 0.10, name: 'शनि', body: Astronomy.Body.Saturn }
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
    console.log('📊 ASTRONOMY ENGINE INDEPENDENT CROSS-CHECK (200 RANDOM DATES: 1900–2100)');
    console.log('========================================================================================');
    console.log('| Celestial Body | Samples | Max Deviation (deg) | Mean Deviation (deg) | Target Limit | Pass |');
    console.log('|:---|:---:|:---:|:---:|:---:|:---:|');

    for (const [key, s] of Object.entries(stats)) {
      const mean = s.sum / SAMPLE_COUNT;
      const passed = s.max <= s.target;
      console.log(
        `| ${key.padEnd(14)} | ${SAMPLE_COUNT.toString().padStart(7)} | ${s.max.toFixed(6).padStart(19)} | ${mean.toFixed(6).padStart(20)} | <= ${s.target.toFixed(2)}° | ${passed ? '✅ PASS' : '❌ FAIL'} |`
      );
      expect(s.max).toBeLessThanOrEqual(s.target);
    }
    console.log('========================================================================================\n');
  });
});
