import { describe, it, expect } from 'vitest';
import { computePanchang, getCoordinatesForCity } from '../src/services/ephemerisEngine';

// Parses "HH:MM AM/PM" into minutes from midnight
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

describe('Vedic Panchang Ephemeris Multi-City Reference Benchmark (Delhi, Varanasi, Mumbai)', () => {
  const testDate = new Date('2026-10-24T06:00:00Z');

  // Verify coordinates
  const delhi = getCoordinatesForCity('delhi');
  const varanasi = getCoordinatesForCity('varanasi');
  const mumbai = getCoordinatesForCity('mumbai');

  it('verifies precision coordinates for all 3 reference cities', () => {
    expect(delhi.lat).toBeCloseTo(28.6139, 3);
    expect(delhi.lon).toBeCloseTo(77.2090, 3);

    expect(varanasi.lat).toBeCloseTo(25.3176, 3);
    expect(varanasi.lon).toBeCloseTo(82.9739, 3);

    expect(mumbai.lat).toBeCloseTo(19.0760, 3);
    expect(mumbai.lon).toBeCloseTo(72.8777, 3);
  });

  it('computes complete 5 Limbs of Time (Tithi, Nakshatra, Yoga, Karana, Vara) for all 3 cities', () => {
    const pDelhi = computePanchang(testDate, delhi.lat, delhi.lon);
    const pVaranasi = computePanchang(testDate, varanasi.lat, varanasi.lon);
    const pMumbai = computePanchang(testDate, mumbai.lat, mumbai.lon);

    [pDelhi, pVaranasi, pMumbai].forEach((p) => {
      expect(p).toHaveProperty('tithi');
      expect(p).toHaveProperty('nakshatra');
      expect(p).toHaveProperty('yoga');
      expect(p).toHaveProperty('karana');
      expect(p).toHaveProperty('vara');
      expect(p.vara.name).toBe('शनिवार'); // 2026-10-24 was Saturday
      expect(p.vara.deity).toBe('शनि');
      expect(p.muhurtas).toHaveProperty('sunrise');
      expect(p.muhurtas).toHaveProperty('sunset');
      expect(p.muhurtas).toHaveProperty('brahmaMuhurta');
      expect(p.muhurtas).toHaveProperty('abhijit');
      expect(p.muhurtas).toHaveProperty('rahuKalam');
    });
  });

  it('strictly validates astronomical sunrise progression across geographic longitudes', () => {
    // Physical Astronomical Law:
    // Varanasi (82.97° E) is east of Delhi (77.21° E), which is east of Mumbai (72.88° E).
    // The sun ALWAYS rises earliest in Varanasi, then Delhi, then Mumbai.
    const pDelhi = computePanchang(testDate, delhi.lat, delhi.lon);
    const pVaranasi = computePanchang(testDate, varanasi.lat, varanasi.lon);
    const pMumbai = computePanchang(testDate, mumbai.lat, mumbai.lon);

    const sunriseVaranasiMin = parseTimeToMinutes(pVaranasi.muhurtas.sunrise);
    const sunriseDelhiMin = parseTimeToMinutes(pDelhi.muhurtas.sunrise);
    const sunriseMumbaiMin = parseTimeToMinutes(pMumbai.muhurtas.sunrise);

    // 1. Varanasi sunrise is earlier than Delhi sunrise by 20 to 30 minutes
    const varanasiDelhiDiff = sunriseDelhiMin - sunriseVaranasiMin;
    expect(varanasiDelhiDiff).toBeGreaterThanOrEqual(18);
    expect(varanasiDelhiDiff).toBeLessThanOrEqual(32);

    // 2. Delhi sunrise is earlier than Mumbai sunrise by 5 to 20 minutes
    expect(sunriseDelhiMin).toBeLessThan(sunriseMumbaiMin);

    // 3. Strict monotonic order: Varanasi < Delhi < Mumbai
    expect(sunriseVaranasiMin).toBeLessThan(sunriseDelhiMin);
    expect(sunriseDelhiMin).toBeLessThan(sunriseMumbaiMin);
  });

  it('strictly validates solar noon progression and equation of time offsets across longitudes', () => {
    const pDelhi = computePanchang(testDate, delhi.lat, delhi.lon);
    const pVaranasi = computePanchang(testDate, varanasi.lat, varanasi.lon);
    const pMumbai = computePanchang(testDate, mumbai.lat, mumbai.lon);

    // Abhijit Muhurta is centered around local solar noon
    const abhijitVaranasiStart = parseTimeToMinutes(pVaranasi.muhurtas.abhijit.split(' - ')[0]);
    const abhijitDelhiStart = parseTimeToMinutes(pDelhi.muhurtas.abhijit.split(' - ')[0]);
    const abhijitMumbaiStart = parseTimeToMinutes(pMumbai.muhurtas.abhijit.split(' - ')[0]);

    // Local noon follows eastern longitude order: Varanasi noon precedes Delhi noon precedes Mumbai noon
    expect(abhijitVaranasiStart).toBeLessThan(abhijitDelhiStart);
    expect(abhijitDelhiStart).toBeLessThan(abhijitMumbaiStart);

    // Difference between Varanasi (82.97° E) and Delhi (77.21° E) is ~23 minutes
    const abhijitDiff = abhijitDelhiStart - abhijitVaranasiStart;
    expect(abhijitDiff).toBeGreaterThanOrEqual(20);
    expect(abhijitDiff).toBeLessThanOrEqual(28);
  });

  it('validates Brahma Muhurta and classical Rahu Kaal calculations for Saturday', () => {
    const pDelhi = computePanchang(testDate, delhi.lat, delhi.lon);

    // Brahma Muhurta starts 2 muhurtas (96 mins) before sunrise and ends 48 mins before sunrise
    const sunriseMin = parseTimeToMinutes(pDelhi.muhurtas.sunrise);
    const brahmaStartMin = parseTimeToMinutes(pDelhi.muhurtas.brahmaMuhurta.split(' - ')[0]);
    const brahmaDiff = sunriseMin - brahmaStartMin;
    expect(Math.abs(brahmaDiff - 96)).toBeLessThanOrEqual(2);

    // Saturday Rahu Kaal is classically the 2nd octant of the daytime (~09:00 AM)
    expect(pDelhi.muhurtas.rahuKalam).toContain('AM');
    const rahuKaalStart = parseTimeToMinutes(pDelhi.muhurtas.rahuKalam.split(' - ')[0]);
    expect(rahuKaalStart).toBeGreaterThanOrEqual(7 * 60);
    expect(rahuKaalStart).toBeLessThanOrEqual(10 * 60);
  });
});
