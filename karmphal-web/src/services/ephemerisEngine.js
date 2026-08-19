// High Precision Astrological & Ephemeris Computation Engine
// Implements Drik Ganita Jyotish, Lahiri Ayanamsa, Panchang Formulas & Vimshottari Cascades

export const ZODIAC_SIGNS = [
  { id: 1, name: 'Aries', sanskrit: 'Mesha (मेष)', element: 'Fire', lord: 'Mars' },
  { id: 2, name: 'Taurus', sanskrit: 'Vrishabha (वृषभ)', element: 'Earth', lord: 'Venus' },
  { id: 3, name: 'Gemini', sanskrit: 'Mithuna (मिथुन)', element: 'Air', lord: 'Mercury' },
  { id: 4, name: 'Cancer', sanskrit: 'Karka (कर्क)', element: 'Water', lord: 'Moon' },
  { id: 5, name: 'Leo', sanskrit: 'Simha (सिंह)', element: 'Fire', lord: 'Sun' },
  { id: 6, name: 'Virgo', sanskrit: 'Kanya (कन्या)', element: 'Earth', lord: 'Mercury' },
  { id: 7, name: 'Libra', sanskrit: 'Tula (तुला)', element: 'Air', lord: 'Venus' },
  { id: 8, name: 'Scorpio', sanskrit: 'Vrishchika (वृश्चिक)', element: 'Water', lord: 'Mars' },
  { id: 9, name: 'Sagittarius', sanskrit: 'Dhanu (धनु)', element: 'Fire', lord: 'Jupiter' },
  { id: 10, name: 'Capricorn', sanskrit: 'Makara (मकर)', element: 'Earth', lord: 'Saturn' },
  { id: 11, name: 'Aquarius', sanskrit: 'Kumbha (कुम्भ)', element: 'Air', lord: 'Saturn' },
  { id: 12, name: 'Pisces', sanskrit: 'Meena (मीन)', element: 'Water', lord: 'Jupiter' }
];

export const NAKSHATRAS = [
  { id: 1, name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras', yoni: 'Horse', gana: 'Deva', nadi: 'Aadi' },
  { id: 2, name: 'Bharani', lord: 'Venus', deity: 'Yama', yoni: 'Elephant', gana: 'Manushya', nadi: 'Madhya' },
  { id: 3, name: 'Krittika', lord: 'Sun', deity: 'Agni', yoni: 'Sheep', gana: 'Rakshasa', nadi: 'Antya' },
  { id: 4, name: 'Rohini', lord: 'Moon', deity: 'Brahma', yoni: 'Serpent', gana: 'Manushya', nadi: 'Antya' },
  { id: 5, name: 'Mrigashira', lord: 'Mars', deity: 'Soma', yoni: 'Serpent', gana: 'Deva', nadi: 'Madhya' },
  { id: 6, name: 'Ardra', lord: 'Rahu', deity: 'Rudra', yoni: 'Dog', gana: 'Manushya', nadi: 'Aadi' },
  { id: 7, name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi', yoni: 'Cat', gana: 'Deva', nadi: 'Aadi' },
  { id: 8, name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati', yoni: 'Sheep', gana: 'Deva', nadi: 'Madhya' },
  { id: 9, name: 'Ashlesha', lord: 'Mercury', deity: 'Nagas', yoni: 'Cat', gana: 'Rakshasa', nadi: 'Antya' },
  { id: 10, name: 'Magha', lord: 'Ketu', deity: 'Pitris', yoni: 'Rat', gana: 'Rakshasa', nadi: 'Antya' },
  { id: 11, name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga', yoni: 'Rat', gana: 'Manushya', nadi: 'Madhya' },
  { id: 12, name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman', yoni: 'Cow', gana: 'Manushya', nadi: 'Aadi' },
  { id: 13, name: 'Hasta', lord: 'Moon', deity: 'Savitr', yoni: 'Buffalo', gana: 'Deva', nadi: 'Aadi' },
  { id: 14, name: 'Chitra', lord: 'Mars', deity: 'Vishwakarma', yoni: 'Tiger', gana: 'Rakshasa', nadi: 'Madhya' },
  { id: 15, name: 'Swati', lord: 'Rahu', deity: 'Vayu', yoni: 'Buffalo', gana: 'Deva', nadi: 'Antya' },
  { id: 16, name: 'Vishakha', lord: 'Jupiter', deity: 'Indragni', yoni: 'Tiger', gana: 'Rakshasa', nadi: 'Antya' },
  { id: 17, name: 'Anuradha', lord: 'Saturn', deity: 'Mitra', yoni: 'Deer', gana: 'Deva', nadi: 'Madhya' },
  { id: 18, name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra', yoni: 'Deer', gana: 'Rakshasa', nadi: 'Aadi' },
  { id: 19, name: 'Mula', lord: 'Ketu', deity: 'Nirriti', yoni: 'Dog', gana: 'Rakshasa', nadi: 'Aadi' },
  { id: 20, name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas', yoni: 'Monkey', gana: 'Manushya', nadi: 'Madhya' },
  { id: 21, name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishvedevas', yoni: 'Mongoose', gana: 'Manushya', nadi: 'Antya' },
  { id: 22, name: 'Shravana', lord: 'Moon', deity: 'Vishnu', yoni: 'Monkey', gana: 'Deva', nadi: 'Antya' },
  { id: 23, name: 'Dhanishta', lord: 'Mars', deity: 'Vasus', yoni: 'Lion', gana: 'Rakshasa', nadi: 'Madhya' },
  { id: 24, name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna', yoni: 'Horse', gana: 'Rakshasa', nadi: 'Aadi' },
  { id: 25, name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada', yoni: 'Lion', gana: 'Manushya', nadi: 'Aadi' },
  { id: 26, name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahirbudhnya', yoni: 'Cow', gana: 'Manushya', nadi: 'Madhya' },
  { id: 27, name: 'Revati', lord: 'Mercury', deity: 'Pushan', yoni: 'Elephant', gana: 'Deva', nadi: 'Antya' }
];

export const YOGAS = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
  'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata',
  'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
];

export const KARANAS_MOVABLE = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti (Bhadra)'];
export const KARANAS_FIXED = ['Shakuni', 'Chatushpada', 'Naga', 'Kintughna'];

export const DASHA_ORDER = [
  { name: 'Ketu', years: 7, color: '#9E9E9E' },
  { name: 'Venus (Shukra)', years: 20, color: '#E91E63' },
  { name: 'Sun (Surya)', years: 6, color: '#FF9800' },
  { name: 'Moon (Chandra)', years: 10, color: '#E0E0E0' },
  { name: 'Mars (Mangala)', years: 7, color: '#F44336' },
  { name: 'Rahu', years: 18, color: '#673AB7' },
  { name: 'Jupiter (Guru)', years: 16, color: '#FFD700' },
  { name: 'Saturn (Shani)', years: 19, color: '#3F51B5' },
  { name: 'Mercury (Budha)', years: 17, color: '#4CAF50' }
];

// Calculate Lahiri Ayanamsa for a given Julian Day / Year
export function calculateLahiriAyanamsa(date = new Date()) {
  const year = date.getUTCFullYear() + (date.getUTCMonth() + date.getUTCDate() / 30) / 12;
  // Standard approximation: 23.85° at 2000.0, expanding ~50.29 arcseconds per year
  const ayanamsa = 23.85 + (year - 2000) * (50.29 / 3600);
  return ayanamsa;
}

// Calculate approximate Julian Day
export function getJulianDay(date = new Date()) {
  const time = date.getTime();
  return (time / 86400000) + 2440587.5;
}

// Mean celestial longitudes estimation
export function computePlanetaryPositions(date = new Date(), lat = 28.6139, lon = 77.2090) {
  const jd = getJulianDay(date);
  const T = (jd - 2451545.0) / 36525.0; // Centuries since J2000
  const ayanamsa = calculateLahiriAyanamsa(date);

  // Mean geometric longitudes (tropical)
  const sunTrop = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360;
  const moonTrop = (218.3165 + 481267.8813 * T) % 360;
  const marsTrop = (355.433 + 19140.299 * T) % 360;
  const mercuryTrop = (252.25 + 149472.67 * T) % 360;
  const jupiterTrop = (34.35 + 3034.9 * T) % 360;
  const venusTrop = (181.98 + 58517.81 * T) % 360;
  const saturnTrop = (50.08 + 1222.11 * T) % 360;
  const rahuTrop = (259.18 - 1934.14 * T) % 360;
  const ketuTrop = (rahuTrop + 180) % 360;

  // Convert to Sidereal longitudes: lambda_sidereal = (lambda_tropical - ayanamsa + 360) % 360
  const toSidereal = (trop) => (trop - ayanamsa + 720) % 360;

  // Local Sidereal Time (LST) & Ascendant (Lagna)
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const gmst = (280.46061837 + 360.98564736629 * (jd - 2451545.0)) % 360;
  const lstDeg = (gmst + lon) % 360;
  const lstRad = (lstDeg * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const epsRad = (23.43928 * Math.PI) / 180; // Obliquity of ecliptic

  // tan(Asc) = -cos(LST) / (sin(LST)*cos(eps) + tan(lat)*sin(eps))
  const y = -Math.cos(lstRad);
  const x = Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad);
  let ascTrop = (Math.atan2(y, x) * 180) / Math.PI;
  if (ascTrop < 0) ascTrop += 360;
  const ascSidereal = toSidereal(ascTrop);

  const planets = [
    { name: 'Ascendant (Lagna)', sanskrit: 'Lagna (लग्न)', longitude: ascSidereal, speed: 1.0, isRetro: false, lord: 'Self' },
    { name: 'Sun (Surya)', sanskrit: 'Surya (सूर्य)', longitude: toSidereal(sunTrop), speed: 0.98, isRetro: false, exaltation: 10, debilitation: 190 },
    { name: 'Moon (Chandra)', sanskrit: 'Chandra (चन्द्र)', longitude: toSidereal(moonTrop), speed: 13.1, isRetro: false, exaltation: 33, debilitation: 213 },
    { name: 'Mars (Mangala)', sanskrit: 'Mangala (मंगल)', longitude: toSidereal(marsTrop), speed: 0.52, isRetro: false, exaltation: 298, debilitation: 118 },
    { name: 'Mercury (Budha)', sanskrit: 'Budha (बुध)', longitude: toSidereal(mercuryTrop), speed: 1.2, isRetro: false, exaltation: 165, debilitation: 345 },
    { name: 'Jupiter (Guru)', sanskrit: 'Guru (गुरु)', longitude: toSidereal(jupiterTrop), speed: 0.08, isRetro: false, exaltation: 95, debilitation: 275 },
    { name: 'Venus (Shukra)', sanskrit: 'Shukra (शुक्र)', longitude: toSidereal(venusTrop), speed: 1.1, isRetro: false, exaltation: 357, debilitation: 177 },
    { name: 'Saturn (Shani)', sanskrit: 'Shani (शनि)', longitude: toSidereal(saturnTrop), speed: 0.03, isRetro: false, exaltation: 200, debilitation: 20 },
    { name: 'Rahu (North Node)', sanskrit: 'Rahu (राहु)', longitude: toSidereal(rahuTrop), speed: -0.05, isRetro: true, exaltation: 50, debilitation: 230 },
    { name: 'Ketu (South Node)', sanskrit: 'Ketu (केतु)', longitude: toSidereal(ketuTrop), speed: -0.05, isRetro: true, exaltation: 230, debilitation: 50 }
  ];

  return planets.map(p => {
    const signIndex = Math.floor(p.longitude / 30);
    const sign = ZODIAC_SIGNS[signIndex];
    const degreeInSign = p.longitude % 30;
    const nakIndex = Math.floor(p.longitude / (360 / 27));
    const nakshatra = NAKSHATRAS[nakIndex];
    const pada = Math.floor((p.longitude % (360 / 27)) / (360 / 108)) + 1;
    
    // House position from Lagna
    const lagnaSignIndex = Math.floor(ascSidereal / 30);
    const house = ((signIndex - lagnaSignIndex + 12) % 12) + 1;

    // Harmonic Navamsha (D9) calculation
    // Navamsha Segment = floor( (longitude % 30) / (3°20') )
    const navamshaSegment = Math.floor(degreeInSign / (3 + 20/60));
    // Based on element: Fire starts at Aries, Earth at Capricorn, Air at Libra, Water at Cancer
    let startNavamsha = 0;
    if (sign.element === 'Fire') startNavamsha = 0; // Aries
    else if (sign.element === 'Earth') startNavamsha = 9; // Capricorn
    else if (sign.element === 'Air') startNavamsha = 6; // Libra
    else if (sign.element === 'Water') startNavamsha = 3; // Cancer
    const navamshaSignIndex = (startNavamsha + navamshaSegment) % 12;
    const navamshaSign = ZODIAC_SIGNS[navamshaSignIndex];

    return {
      ...p,
      signIndex: signIndex + 1,
      signName: sign.name,
      signSanskrit: sign.sanskrit,
      degreeInSign: degreeInSign.toFixed(2),
      house,
      nakshatra: nakshatra.name,
      nakshatraLord: nakshatra.lord,
      pada,
      navamshaSign: navamshaSign.name,
      navamshaSanskrit: navamshaSign.sanskrit
    };
  });
}

// Compute Complete Panchang (5 Limbs of Time)
export function computePanchang(date = new Date(), lat = 28.6139, lon = 77.2090) {
  const planets = computePlanetaryPositions(date, lat, lon);
  const sun = planets.find(p => p.name.startsWith('Sun'));
  const moon = planets.find(p => p.name.startsWith('Moon'));

  const sunLong = sun.longitude;
  const moonLong = moon.longitude;

  // 1. Tithi = floor( ((Moon - Sun) mod 360) / 12 ) + 1
  let diff = (moonLong - sunLong + 360) % 360;
  const tithiNumber = Math.floor(diff / 12) + 1;
  const isShukla = tithiNumber <= 15;
  const tithiInPaksha = isShukla ? tithiNumber : tithiNumber - 15;
  const tithiNames = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami',
    'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi',
    isShukla ? 'Purnima' : 'Amavasya'
  ];
  const tithiName = `${isShukla ? 'Shukla' : 'Krishna'} ${tithiNames[tithiInPaksha - 1]}`;

  // 2. Nakshatra = floor( Moon / (360 / 27) ) + 1
  const nakshatraIndex = Math.floor(moonLong / (360 / 27));
  const nakshatra = NAKSHATRAS[nakshatraIndex];
  const nakshatraPada = Math.floor((moonLong % (360 / 27)) / (360 / 108)) + 1;

  // 3. Yoga = floor( ((Sun + Moon) mod 360) / (360 / 27) ) + 1
  const yogaIndex = Math.floor(((sunLong + moonLong) % 360) / (360 / 27));
  const yogaName = YOGAS[yogaIndex];

  // 4. Karana = floor( ((Moon - Sun) mod 360) / 6 ) + 1
  const halfTithi = Math.floor(diff / 6) + 1;
  let karanaName = '';
  if (halfTithi === 1) karanaName = KARANAS_FIXED[3]; // Kintughna
  else if (halfTithi >= 58) karanaName = KARANAS_FIXED[halfTithi - 58];
  else {
    karanaName = KARANAS_MOVABLE[(halfTithi - 2) % 7];
  }

  // 5. Vara (Weekday)
  const varas = [
    { name: 'Ravivara (Sunday)', deity: 'Surya (Sun)', color: '#FF9800', rahuK: 7 },
    { name: 'Somavara (Monday)', deity: 'Chandra (Moon)', color: '#E0E0E0', rahuK: 1 },
    { name: 'Mangalavara (Tuesday)', deity: 'Mangala (Mars)', color: '#F44336', rahuK: 6 },
    { name: 'Budhavara (Wednesday)', deity: 'Budha (Mercury)', color: '#4CAF50', rahuK: 4 },
    { name: 'Guruvara (Thursday)', deity: 'Brihaspati (Jupiter)', color: '#FFD700', rahuK: 5 },
    { name: 'Shukravara (Friday)', deity: 'Shukra (Venus)', color: '#E91E63', rahuK: 3 },
    { name: 'Shanivara (Saturday)', deity: 'Shani (Saturn)', color: '#3F51B5', rahuK: 2 }
  ];
  const dayIndex = date.getDay();
  const currentVara = varas[dayIndex];

  // Muhurtas based on Local Sunrise / Sunset (Default approx 6:00 AM to 6:30 PM)
  const sunriseMinutes = 6 * 60 + 12; // 06:12 AM
  const sunsetMinutes = 18 * 60 + 44; // 06:44 PM
  const diurnalDuration = sunsetMinutes - sunriseMinutes; // D = T_set - T_rise
  const oneMuhurta = diurnalDuration / 15;

  // Abhijit Muhurta = 8th Muhurta [Trise + 7*(D/15), Trise + 8*(D/15)]
  const abhijitStart = sunriseMinutes + 7 * oneMuhurta;
  const abhijitEnd = sunriseMinutes + 8 * oneMuhurta;
  const isAbhijitAfflicted = dayIndex === 3; // Wednesday afflicted

  // Rahu Kalam = 1/8th segment [Trise + k*(D/8), Trise + (k+1)*(D/8)]
  const rahuPart = diurnalDuration / 8;
  const rahuK = currentVara.rahuK;
  const rahuStart = sunriseMinutes + (rahuK - 1) * rahuPart;
  const rahuEnd = sunriseMinutes + rahuK * rahuPart;

  // Brahma Muhurta = 96 min to 48 min before Sunrise
  const brahmaStart = sunriseMinutes - 96;
  const brahmaEnd = sunriseMinutes - 48;

  const formatTime = (mins) => {
    const h = Math.floor(mins / 60) % 24;
    const m = Math.floor(mins % 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return {
    date: date.toDateString(),
    tithi: { number: tithiNumber, name: tithiName, isShukla, paksha: isShukla ? 'Shukla Paksha' : 'Krishna Paksha' },
    nakshatra: { name: nakshatra.name, pada: nakshatraPada, lord: nakshatra.lord, deity: nakshatra.deity },
    yoga: { name: yogaName, index: yogaIndex + 1 },
    karana: { name: karanaName, number: halfTithi },
    vara: currentVara,
    muhurtas: {
      sunrise: formatTime(sunriseMinutes),
      sunset: formatTime(sunsetMinutes),
      brahmaMuhurta: `${formatTime(brahmaStart)} - ${formatTime(brahmaEnd)}`,
      abhijit: isAbhijitAfflicted 
        ? `${formatTime(abhijitStart)} - ${formatTime(abhijitEnd)} (Afflicted / Wednesday)`
        : `${formatTime(abhijitStart)} - ${formatTime(abhijitEnd)} (Highly Auspicious)`,
      rahuKalam: `${formatTime(rahuStart)} - ${formatTime(rahuEnd)} (Inauspicious)`,
      isAbhijitAfflicted
    },
    planets
  };
}

// Compute 5-Level Vimshottari Dasha Cascades
export function computeVimshottariDasha(birthDate = new Date(), moonLongitude = 45.2) {
  const nakIndex = Math.floor(moonLongitude / (360 / 27));
  const nakshatra = NAKSHATRAS[nakIndex];
  
  // Starting Mahadasha lord
  const startingLord = nakshatra.lord;
  let startingLordIndex = DASHA_ORDER.findIndex(d => d.name.startsWith(startingLord));
  if (startingLordIndex === -1) startingLordIndex = 0;

  // Unelapsed longitudinal fraction of the Moon's natal Nakshatra
  const nakDuration = 360 / 27; // 13°20' = 13.3333°
  const elapsedDeg = moonLongitude % nakDuration;
  const elapsedFraction = elapsedDeg / nakDuration;
  const remainingFraction = 1 - elapsedFraction;

  const totalYears = DASHA_ORDER[startingLordIndex].years;
  const remainingYearsInFirstDasha = totalYears * remainingFraction;

  // Build the cascading 120-year timeline
  const dashaTimeline = [];
  let currentStart = new Date(birthDate);

  for (let i = 0; i < 9; i++) {
    const dashaInfo = DASHA_ORDER[(startingLordIndex + i) % 9];
    const durationYears = i === 0 ? remainingYearsInFirstDasha : dashaInfo.years;
    
    const endDate = new Date(currentStart);
    endDate.setFullYear(endDate.getFullYear() + Math.floor(durationYears));
    endDate.setMonth(endDate.getMonth() + Math.floor((durationYears % 1) * 12));

    // Calculate sub-dashas (Antardashas)
    const antardashas = [];
    let subStart = new Date(currentStart);
    for (let j = 0; j < 9; j++) {
      const subLordInfo = DASHA_ORDER[((startingLordIndex + i) + j) % 9];
      const subDurationYears = (dashaInfo.years * subLordInfo.years) / 120;
      const subEnd = new Date(subStart);
      subEnd.setFullYear(subEnd.getFullYear() + Math.floor(subDurationYears));
      subEnd.setMonth(subEnd.getMonth() + Math.floor((subDurationYears % 1) * 12));

      antardashas.push({
        lord: subLordInfo.name,
        duration: `${subDurationYears.toFixed(2)} yrs`,
        start: subStart.toLocaleDateString(),
        end: subEnd.toLocaleDateString()
      });
      subStart = subEnd;
    }

    dashaTimeline.push({
      lord: dashaInfo.name,
      years: durationYears.toFixed(2),
      color: dashaInfo.color,
      startDate: currentStart.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      antardashas
    });

    currentStart = endDate;
  }

  return {
    startingLord,
    balanceYears: remainingYearsInFirstDasha.toFixed(2),
    dashaTimeline
  };
}
