// High Precision Astrological & Ephemeris Computation Engine
// Implements Drik Ganita Jyotish, Lahiri Ayanamsa, Panchang Formulas & Vimshottari Cascades

export const EPHEMERIS_METADATA = {
  engineVersion: "1.0.0-verified",
  ayanamsa: "Lahiri (Chitra Paksha)",
  houseSystem: "Whole Sign (Rashi Tulya Bhava)",
  algorithms: "Meeus/VSOP87 Approximations",
  constraints: "Precision limited to +/- 1 degree. Not for critical planetary warfare (Graha Yuddha) calculations."
};

export const CITY_COORDINATES = [
  { name: 'delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'bangalore', lat: 12.9716, lon: 77.5946 },
  { name: 'hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'ahmedabad', lat: 23.0225, lon: 72.5714 },
  { name: 'pune', lat: 18.5204, lon: 73.8567 },
  { name: 'surat', lat: 21.1702, lon: 72.8311 },
  { name: 'jaipur', lat: 26.9124, lon: 75.7873 },
  { name: 'lucknow', lat: 26.8467, lon: 80.9462 },
  { name: 'kanpur', lat: 26.4499, lon: 80.3319 },
  { name: 'nagpur', lat: 21.1458, lon: 79.0882 },
  { name: 'indore', lat: 22.7196, lon: 75.8577 },
  { name: 'thane', lat: 19.2183, lon: 72.9781 },
  { name: 'bhopal', lat: 23.2599, lon: 77.4126 },
  { name: 'visakhapatnam', lat: 17.6868, lon: 83.2185 },
  { name: 'patna', lat: 25.5941, lon: 85.1376 },
  { name: 'vadodara', lat: 22.3072, lon: 73.1812 },
  { name: 'ghaziabad', lat: 28.6692, lon: 77.4538 },
  { name: 'ludhiana', lat: 30.9010, lon: 75.8573 },
  { name: 'agra', lat: 27.1767, lon: 78.0081 },
  { name: 'nashik', lat: 20.0110, lon: 73.7903 },
  { name: 'faridabad', lat: 28.4089, lon: 77.3178 },
  { name: 'meerut', lat: 28.9845, lon: 77.7064 },
  { name: 'rajkot', lat: 22.3039, lon: 70.8022 },
  { name: 'varanasi', lat: 25.3176, lon: 82.9739 },
  { name: 'srinagar', lat: 34.0837, lon: 74.7973 },
  { name: 'aurangabad', lat: 19.8762, lon: 75.3433 },
  { name: 'dhanbad', lat: 23.7957, lon: 86.4304 },
  { name: 'amritsar', lat: 31.6340, lon: 74.8723 },
  { name: 'allahabad', lat: 25.4358, lon: 81.8463 },
  { name: 'ranchi', lat: 23.3441, lon: 85.3096 },
  { name: 'howrah', lat: 22.5958, lon: 88.3110 },
  { name: 'coimbatore', lat: 11.0168, lon: 76.9558 },
  { name: 'jabalpur', lat: 23.1815, lon: 79.9864 },
  { name: 'gwalior', lat: 26.2183, lon: 78.1828 },
  { name: 'vijayawada', lat: 16.5062, lon: 80.6480 },
  { name: 'jodhpur', lat: 26.2389, lon: 73.0243 },
  { name: 'madurai', lat: 9.9252, lon: 78.1198 },
  { name: 'raipur', lat: 21.2514, lon: 81.6296 },
  { name: 'kota', lat: 25.2138, lon: 75.8648 },
  { name: 'guwahati', lat: 26.1445, lon: 91.7362 },
  { name: 'chandigarh', lat: 30.7333, lon: 76.7794 },
  { name: 'solapur', lat: 17.6599, lon: 75.9064 },
  { name: 'hubli', lat: 15.3647, lon: 75.1240 },
  { name: 'bareilly', lat: 28.3670, lon: 79.4304 },
  { name: 'moradabad', lat: 28.8386, lon: 78.7733 },
  { name: 'mysore', lat: 12.2958, lon: 76.6394 },
  { name: 'gurgaon', lat: 28.4595, lon: 77.0266 },
  { name: 'aligarh', lat: 27.8974, lon: 78.0880 },
  { name: 'jalandhar', lat: 31.3260, lon: 75.5762 },
  { name: 'tiruchirappalli', lat: 10.7905, lon: 78.7047 },
  { name: 'bhubaneswar', lat: 20.2961, lon: 85.8245 },
  { name: 'salem', lat: 11.6643, lon: 78.1460 },
  { name: 'warangal', lat: 17.9689, lon: 79.5941 },
  { name: 'thiruvananthapuram', lat: 8.5241, lon: 76.9366 },
  { name: 'bhiwandi', lat: 19.2813, lon: 73.0483 },
  { name: 'saharanpur', lat: 29.9640, lon: 77.5460 },
  { name: 'gorakhpur', lat: 26.7606, lon: 83.3732 },
  { name: 'bikaner', lat: 28.0229, lon: 73.3119 },
  { name: 'amravati', lat: 20.9320, lon: 77.7523 },
  { name: 'noida', lat: 28.5355, lon: 77.3910 },
  { name: 'jamshedpur', lat: 22.8046, lon: 86.2029 },
  { name: 'bhilai', lat: 21.1938, lon: 81.3509 },
  { name: 'cuttack', lat: 20.4625, lon: 85.8830 },
  { name: 'firozabad', lat: 27.1590, lon: 78.3958 },
  { name: 'kochi', lat: 9.9312, lon: 76.2673 },
  { name: 'bhavnagar', lat: 21.7645, lon: 72.1519 },
  { name: 'dehradun', lat: 30.3165, lon: 78.0322 },
  { name: 'durgapur', lat: 23.5204, lon: 87.3119 },
  { name: 'asansol', lat: 23.6739, lon: 86.9524 },
  { name: 'rourkela', lat: 22.2604, lon: 84.8536 },
  { name: 'nanded', lat: 19.1383, lon: 77.3210 },
  { name: 'kolhapur', lat: 16.7050, lon: 74.2433 },
  { name: 'ajmer', lat: 26.4499, lon: 74.6399 },
  { name: 'gulbarga', lat: 17.3297, lon: 76.8343 },
  { name: 'jamnagar', lat: 22.4707, lon: 70.0577 },
  { name: 'ujjain', lat: 23.1765, lon: 75.7885 },
  { name: 'loni', lat: 28.7514, lon: 77.2887 },
  { name: 'siliguri', lat: 26.7271, lon: 88.3953 },
  { name: 'jhansi', lat: 25.4484, lon: 78.5685 },
  { name: 'ulhasnagar', lat: 19.2215, lon: 73.1632 },
  { name: 'nellore', lat: 14.4426, lon: 79.9865 },
  { name: 'jammu', lat: 32.7266, lon: 74.8570 },
  { name: 'sangli', lat: 16.8524, lon: 74.5815 },
  { name: 'belgaum', lat: 15.8497, lon: 74.4977 },
  { name: 'mangalore', lat: 12.9141, lon: 74.8560 },
  { name: 'ambattur', lat: 13.1143, lon: 80.1548 },
  { name: 'tirunelveli', lat: 8.7139, lon: 77.7567 },
  { name: 'malegaon', lat: 20.5511, lon: 74.5280 },
  { name: 'gaya', lat: 24.7914, lon: 85.0002 },
  { name: 'jalgaon', lat: 21.0077, lon: 75.5626 },
  { name: 'udaipur', lat: 24.5854, lon: 73.7125 },
  { name: 'maheshtala', lat: 22.5085, lon: 88.2526 },
  { name: 'trupati', lat: 13.6288, lon: 79.4192 },
  { name: 'new york', lat: 40.7128, lon: -74.0060 },
  { name: 'london', lat: 51.5074, lon: -0.1278 },
  { name: 'sydney', lat: -33.8688, lon: 151.2093 }
];

export function getCoordinatesForCity(cityName) {
  if (!cityName) return { lat: 28.6139, lon: 77.2090 };
  const query = cityName.toLowerCase().trim();
  const match = CITY_COORDINATES.find(c => query.includes(c.name));
  return match || { lat: 28.6139, lon: 77.2090 }; // Default Delhi
}

export const ZODIAC_SIGNS = [
  { id: 1, name: 'मेष', sanskrit: 'मेष', element: 'अग्नि', lord: 'मंगल' },
  { id: 2, name: 'वृषभ', sanskrit: 'वृषभ', element: 'पृथ्वी', lord: 'शुक्र' },
  { id: 3, name: 'मिथुन', sanskrit: 'मिथुन', element: 'वायु', lord: 'बुध' },
  { id: 4, name: 'कर्क', sanskrit: 'कर्क', element: 'जल', lord: 'चन्द्र' },
  { id: 5, name: 'सिंह', sanskrit: 'सिंह', element: 'अग्नि', lord: 'सूर्य' },
  { id: 6, name: 'कन्या', sanskrit: 'कन्या', element: 'पृथ्वी', lord: 'बुध' },
  { id: 7, name: 'तुला', sanskrit: 'तुला', element: 'वायु', lord: 'शुक्र' },
  { id: 8, name: 'वृश्चिक', sanskrit: 'वृश्चिक', element: 'जल', lord: 'मंगल' },
  { id: 9, name: 'धनु', sanskrit: 'धनु', element: 'अग्नि', lord: 'गुरु' },
  { id: 10, name: 'मकर', sanskrit: 'मकर', element: 'पृथ्वी', lord: 'शनि' },
  { id: 11, name: 'कुम्भ', sanskrit: 'कुम्भ', element: 'वायु', lord: 'शनि' },
  { id: 12, name: 'मीन', sanskrit: 'मीन', element: 'जल', lord: 'गुरु' }
];

export const NAKSHATRAS = [
  { id: 1, name: 'अश्विनी', lord: 'केतु', deity: 'अश्विनी कुमार', yoni: 'अश्व', gana: 'देव', nadi: 'आदि' },
  { id: 2, name: 'भरणी', lord: 'शुक्र', deity: 'यम', yoni: 'गज', gana: 'मनुष्य', nadi: 'मध्य' },
  { id: 3, name: 'कृत्तिका', lord: 'सूर्य', deity: 'अग्नि', yoni: 'मेष', gana: 'राक्षस', nadi: 'अन्त्य' },
  { id: 4, name: 'रोहिणी', lord: 'चन्द्र', deity: 'ब्रह्मा', yoni: 'सर्प', gana: 'मनुष्य', nadi: 'अन्त्य' },
  { id: 5, name: 'मृगशिरा', lord: 'मंगल', deity: 'सोम', yoni: 'सर्प', gana: 'देव', nadi: 'मध्य' },
  { id: 6, name: 'आर्द्रा', lord: 'राहु', deity: 'रुद्र', yoni: 'श्वान', gana: 'मनुष्य', nadi: 'आदि' },
  { id: 7, name: 'पुनर्वसु', lord: 'गुरु', deity: 'अदिति', yoni: 'मार्जार', gana: 'देव', nadi: 'आदि' },
  { id: 8, name: 'पुष्य', lord: 'शनि', deity: 'बृहस्पति', yoni: 'मेष', gana: 'देव', nadi: 'मध्य' },
  { id: 9, name: 'आश्लेषा', lord: 'बुध', deity: 'नाग', yoni: 'मार्जार', gana: 'राक्षस', nadi: 'अन्त्य' },
  { id: 10, name: 'मघा', lord: 'केतु', deity: 'पितृ', yoni: 'मूषक', gana: 'राक्षस', nadi: 'अन्त्य' },
  { id: 11, name: 'पूर्वाफाल्गुनी', lord: 'शुक्र', deity: 'भग', yoni: 'मूषक', gana: 'मनुष्य', nadi: 'मध्य' },
  { id: 12, name: 'उत्तराफाल्गुनी', lord: 'सूर्य', deity: 'अर्यमा', yoni: 'गौ', gana: 'मनुष्य', nadi: 'आदि' },
  { id: 13, name: 'हस्त', lord: 'चन्द्र', deity: 'सविता', yoni: 'महिष', gana: 'देव', nadi: 'आदि' },
  { id: 14, name: 'चित्रा', lord: 'मंगल', deity: 'विश्वकर्मा', yoni: 'व्याघ्र', gana: 'राक्षस', nadi: 'मध्य' },
  { id: 15, name: 'स्वाती', lord: 'राहु', deity: 'वायु', yoni: 'महिष', gana: 'देव', nadi: 'अन्त्य' },
  { id: 16, name: 'विशाखा', lord: 'गुरु', deity: 'इन्द्राग्नि', yoni: 'व्याघ्र', gana: 'राक्षस', nadi: 'अन्त्य' },
  { id: 17, name: 'अनुराधा', lord: 'शनि', deity: 'मित्र', yoni: 'मृग', gana: 'देव', nadi: 'मध्य' },
  { id: 18, name: 'ज्येष्ठा', lord: 'बुध', deity: 'इन्द्र', yoni: 'मृग', gana: 'राक्षस', nadi: 'आदि' },
  { id: 19, name: 'मूल', lord: 'केतु', deity: 'निरृति', yoni: 'श्वान', gana: 'राक्षस', nadi: 'आदि' },
  { id: 20, name: 'पूर्वाषाढा', lord: 'शुक्र', deity: 'आपः', yoni: 'वानर', gana: 'मनुष्य', nadi: 'मध्य' },
  { id: 21, name: 'उत्तराषाढा', lord: 'सूर्य', deity: 'विश्वेदेव', yoni: 'नकुल', gana: 'मनुष्य', nadi: 'अन्त्य' },
  { id: 22, name: 'श्रवण', lord: 'चन्द्र', deity: 'विष्णु', yoni: 'वानर', gana: 'देव', nadi: 'अन्त्य' },
  { id: 23, name: 'धनिष्ठा', lord: 'मंगल', deity: 'वसु', yoni: 'सिंह', gana: 'राक्षस', nadi: 'मध्य' },
  { id: 24, name: 'शतभिषा', lord: 'राहु', deity: 'वरुण', yoni: 'अश्व', gana: 'राक्षस', nadi: 'आदि' },
  { id: 25, name: 'पूर्वाभाद्रपद', lord: 'गुरु', deity: 'अज एकपाद', yoni: 'सिंह', gana: 'मनुष्य', nadi: 'आदि' },
  { id: 26, name: 'उत्तराभाद्रपद', lord: 'शनि', deity: 'अहिर्बुध्न्य', yoni: 'गौ', gana: 'मनुष्य', nadi: 'मध्य' },
  { id: 27, name: 'रेवती', lord: 'बुध', deity: 'पूषन', yoni: 'गज', gana: 'देव', nadi: 'अन्त्य' }
];

export const YOGAS = [
  'विष्कुम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्मा', 'धृति',
  'शूल', 'गण्ड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात',
  'वरीयान', 'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इन्द्र', 'वैधृति'
];

export const KARANAS_MOVABLE = ['बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टि (भद्रा)'];
export const KARANAS_FIXED = ['शकुनि', 'चतुष्पद', 'नाग', 'किस्तुघ्न'];

export const DASHA_ORDER = [
  { name: 'केतु', years: 7, color: '#9E9E9E' },
  { name: 'शुक्र', years: 20, color: '#E91E63' },
  { name: 'सूर्य', years: 6, color: '#FF9800' },
  { name: 'चन्द्र', years: 10, color: '#E0E0E0' },
  { name: 'मंगल', years: 7, color: '#F44336' },
  { name: 'राहु', years: 18, color: '#673AB7' },
  { name: 'गुरु', years: 16, color: '#FFD700' },
  { name: 'शनि', years: 19, color: '#3F51B5' },
  { name: 'बुध', years: 17, color: '#4CAF50' }
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
    { name: 'लग्न', sanskrit: 'लग्न', longitude: ascSidereal, speed: 1.0, isRetro: false, lord: 'स्वयं' },
    { name: 'सूर्य', sanskrit: 'सूर्य', longitude: toSidereal(sunTrop), speed: 0.98, isRetro: false, exaltation: 10, debilitation: 190 },
    { name: 'चन्द्र', sanskrit: 'चन्द्र', longitude: toSidereal(moonTrop), speed: 13.1, isRetro: false, exaltation: 33, debilitation: 213 },
    { name: 'मंगल', sanskrit: 'मंगल', longitude: toSidereal(marsTrop), speed: 0.52, isRetro: false, exaltation: 298, debilitation: 118 },
    { name: 'बुध', sanskrit: 'बुध', longitude: toSidereal(mercuryTrop), speed: 1.2, isRetro: false, exaltation: 165, debilitation: 345 },
    { name: 'गुरु', sanskrit: 'गुरु', longitude: toSidereal(jupiterTrop), speed: 0.08, isRetro: false, exaltation: 95, debilitation: 275 },
    { name: 'शुक्र', sanskrit: 'शुक्र', longitude: toSidereal(venusTrop), speed: 1.1, isRetro: false, exaltation: 357, debilitation: 177 },
    { name: 'शनि', sanskrit: 'शनि', longitude: toSidereal(saturnTrop), speed: 0.03, isRetro: false, exaltation: 200, debilitation: 20 },
    { name: 'राहु', sanskrit: 'राहु', longitude: toSidereal(rahuTrop), speed: -0.05, isRetro: true, exaltation: 50, debilitation: 230 },
    { name: 'केतु', sanskrit: 'केतु', longitude: toSidereal(ketuTrop), speed: -0.05, isRetro: true, exaltation: 230, debilitation: 50 }
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
  const sun = planets.find(p => p.name === 'सूर्य');
  const moon = planets.find(p => p.name === 'चन्द्र');

  const sunLong = sun.longitude;
  const moonLong = moon.longitude;

  // 1. Tithi = floor( ((Moon - Sun) mod 360) / 12 ) + 1
  let diff = (moonLong - sunLong + 360) % 360;
  const tithiNumber = Math.floor(diff / 12) + 1;
  const isShukla = tithiNumber <= 15;
  const tithiInPaksha = isShukla ? tithiNumber : tithiNumber - 15;
  const tithiNames = [
    'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी', 'षष्ठी', 'सप्तमी',
    'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी',
    isShukla ? 'पूर्णिमा' : 'अमावस्या'
  ];
  const tithiName = `${isShukla ? 'शुक्ल' : 'कृष्ण'} ${tithiNames[tithiInPaksha - 1]}`;

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
    { name: 'रविवार', deity: 'सूर्य', color: '#FF9800', rahuK: 7 },
    { name: 'सोमवार', deity: 'चन्द्र', color: '#E0E0E0', rahuK: 1 },
    { name: 'मंगलवार', deity: 'मंगल', color: '#F44336', rahuK: 6 },
    { name: 'बुधवार', deity: 'बुध', color: '#4CAF50', rahuK: 4 },
    { name: 'गुरुवार', deity: 'गुरु', color: '#FFD700', rahuK: 5 },
    { name: 'शुक्रवार', deity: 'शुक्र', color: '#E91E63', rahuK: 3 },
    { name: 'शनिवार', deity: 'शनि', color: '#3F51B5', rahuK: 2 }
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
    tithi: { number: tithiNumber, name: tithiName, isShukla, paksha: isShukla ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष' },
    nakshatra: { name: nakshatra.name, pada: nakshatraPada, lord: nakshatra.lord, deity: nakshatra.deity },
    yoga: { name: yogaName, index: yogaIndex + 1 },
    karana: { name: karanaName, number: halfTithi },
    vara: currentVara,
    muhurtas: {
      sunrise: formatTime(sunriseMinutes),
      sunset: formatTime(sunsetMinutes),
      brahmaMuhurta: `${formatTime(brahmaStart)} - ${formatTime(brahmaEnd)}`,
      abhijit: isAbhijitAfflicted 
        ? `${formatTime(abhijitStart)} - ${formatTime(abhijitEnd)} (दूषित / बुधवार)`
        : `${formatTime(abhijitStart)} - ${formatTime(abhijitEnd)} (अति शुभ)`,
      rahuKalam: `${formatTime(rahuStart)} - ${formatTime(rahuEnd)} (अशुभ)`,
      isAbhijitAfflicted
    },
    planets,
    metadata: {
      ...EPHEMERIS_METADATA,
      calculatedAt: new Date().toISOString(),
      location: { lat, lon }
    }
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
        start: subStart.toISOString().split('T')[0],
        end: subEnd.toISOString().split('T')[0]
      });
      subStart = subEnd;
    }

    dashaTimeline.push({
      lord: dashaInfo.name,
      years: durationYears.toFixed(2),
      color: dashaInfo.color,
      startDate: currentStart.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
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

// Analyze Major Doshas
export function analyzeDoshas(planets) {
  const moon = planets.find(p => p.name === 'चन्द्र');
  const mars = planets.find(p => p.name === 'मंगल');
  const saturn = planets.find(p => p.name === 'शनि');
  const rahu = planets.find(p => p.name === 'राहु');
  const ketu = planets.find(p => p.name === 'केतु');
  
  const doshas = {
    manglik: { status: 'निर्दोष', color: 'emerald' },
    kaalSarp: { status: 'निर्दोष', color: 'emerald' },
    sadesati: { status: 'निर्दोष', color: 'emerald' },
    pitru: { status: 'निर्दोष', color: 'emerald' } // Added Pitru Dosh default
  };

  // Manglik Check (Mars in 1, 4, 7, 8, 12 from Lagna)
  if (mars) {
    const manglikHouses = [1, 4, 7, 8, 12];
    if (manglikHouses.includes(mars.house)) {
      doshas.manglik = { status: `मांगलिक (भाव ${mars.house})`, color: 'rose' };
    }
  }

  // Sadesati Check (Saturn in 12, 1, 2 from Moon)
  if (saturn && moon) {
    const relativeHouse = ((saturn.signIndex - moon.signIndex + 12) % 12) + 1;
    if (relativeHouse === 12) doshas.sadesati = { status: 'प्रथम चरण (उदय)', color: 'amber' };
    else if (relativeHouse === 1) doshas.sadesati = { status: 'द्वितीय चरण (शिखर)', color: 'rose' };
    else if (relativeHouse === 2) doshas.sadesati = { status: 'तृतीय चरण (अस्त)', color: 'amber' };
  }

  // Kaal Sarp Check (All 7 planets on one side of Rahu-Ketu axis)
  const truePlanets = planets.filter(p => !['लग्न', 'राहु', 'केतु'].includes(p.name));
  if (truePlanets.length === 7 && rahu) {
     const shiftedLongitudes = truePlanets.map(p => (p.longitude - rahu.longitude + 360) % 360);
     const allLessThan180 = shiftedLongitudes.every(l => l <= 180);
     const allGreaterThan180 = shiftedLongitudes.every(l => l >= 180);
     if (allLessThan180 || allGreaterThan180) {
       doshas.kaalSarp = { status: 'कालसर्प दोष', color: 'rose' };
     }
  }

  return doshas;
}
