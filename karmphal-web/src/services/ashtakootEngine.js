// Classical 36-Point Ashtakoot Vivah Milan & Parihara Engine
// Implements full 8-koota compatibility matrix, exception handlers, and Kuja (Manglik) dosha evaluation

import { ZODIAC_SIGNS, NAKSHATRAS } from './ephemerisEngine';

// Varna mapping (Brahmin: 4, Kshatriya: 3, Vaishya: 2, Shudra: 1)
const VARNA_MAP = {
  Cancer: { name: 'Brahmin (ब्राह्मण)', score: 4 },
  Scorpio: { name: 'Brahmin (ब्राह्मण)', score: 4 },
  Pisces: { name: 'Brahmin (ब्राह्मण)', score: 4 },
  Aries: { name: 'Kshatriya (क्षत्रिय)', score: 3 },
  Leo: { name: 'Kshatriya (क्षत्रिय)', score: 3 },
  Sagittarius: { name: 'Kshatriya (क्षत्रिय)', score: 3 },
  Taurus: { name: 'Vaishya (वैश्य)', score: 2 },
  Virgo: { name: 'Vaishya (वैश्य)', score: 2 },
  Capricorn: { name: 'Vaishya (वैश्य)', score: 2 },
  Gemini: { name: 'Shudra (शूद्र)', score: 1 },
  Libra: { name: 'Shudra (शूद्र)', score: 1 },
  Aquarius: { name: 'Shudra (शूद्र)', score: 1 }
};

// Vashya classification
const VASHYA_MAP = {
  Aries: 'Chatushpada (Quadruped)',
  Taurus: 'Chatushpada (Quadruped)',
  Gemini: 'Manava (Human)',
  Cancer: 'Jalachara (Water-dweller)',
  Leo: 'Vanachara (Wild/Forest)',
  Virgo: 'Manava (Human)',
  Libra: 'Manava (Human)',
  Scorpio: 'Keeta (Insect)',
  Sagittarius: 'Manava (Human / Centaur)',
  Capricorn: 'Jalachara (Water-dweller)',
  Aquarius: 'Manava (Human)',
  Pisces: 'Jalachara (Water-dweller)'
};

// Planetary Lordship Friendship Matrix
// 1: Friend, 0: Neutral, -1: Enemy
const GRAHA_FRIENDSHIP = {
  Sun: { Sun: 1, Moon: 1, Mars: 1, Mercury: 0, Jupiter: 1, Venus: -1, Saturn: -1 },
  Moon: { Sun: 1, Moon: 1, Mars: 0, Mercury: 1, Jupiter: 0, Venus: 0, Saturn: 0 },
  Mars: { Sun: 1, Moon: 1, Mars: 1, Mercury: -1, Jupiter: 1, Venus: 0, Saturn: 0 },
  Mercury: { Sun: 1, Moon: -1, Mars: 0, Mercury: 1, Jupiter: 0, Venus: 1, Saturn: 0 },
  Jupiter: { Sun: 1, Moon: 1, Mars: 1, Mercury: -1, Jupiter: 1, Venus: -1, Saturn: 0 },
  Venus: { Sun: -1, Moon: -1, Mars: 0, Mercury: 1, Jupiter: 0, Venus: 1, Saturn: 1 },
  Saturn: { Sun: -1, Moon: -1, Mars: -1, Mercury: 1, Jupiter: 0, Venus: 1, Saturn: 1 }
};

// Yoni Enemies / Friendly pairs
const YONI_ENEMIES = [
  ['Horse', 'Buffalo'],
  ['Elephant', 'Lion'],
  ['Sheep', 'Monkey'],
  ['Serpent', 'Mongoose'],
  ['Dog', 'Deer'],
  ['Cat', 'Rat'],
  ['Cow', 'Tiger']
];

export function calculateAshtakoot(groomData, brideData) {
  // groomData & brideData: { nakshatraId: 1..27, pada: 1..4, rashiId: 1..12, lagnaId: 1..12, marsHouse: 1..12 }
  const groomNak = NAKSHATRAS[groomData.nakshatraId - 1];
  const brideNak = NAKSHATRAS[brideData.nakshatraId - 1];
  const groomRashi = ZODIAC_SIGNS[groomData.rashiId - 1];
  const brideRashi = ZODIAC_SIGNS[brideData.rashiId - 1];

  // 1. Varna Koota (Max 1 pt)
  const gVarna = VARNA_MAP[groomRashi.name];
  const bVarna = VARNA_MAP[brideRashi.name];
  const varnaScore = gVarna.score >= bVarna.score ? 1 : 0;
  const varnaDesc = varnaScore === 1 
    ? `Compliant (Groom ${gVarna.name} >= Bride ${bVarna.name})` 
    : `Incompatible (Groom ${gVarna.name} < Bride ${bVarna.name})`;

  // 2. Vashya Koota (Max 2 pts)
  const gVashya = VASHYA_MAP[groomRashi.name];
  const bVashya = VASHYA_MAP[brideRashi.name];
  let vashyaScore = 0;
  if (gVashya === bVashya) vashyaScore = 2;
  else if ((gVashya === 'Manava' && bVashya !== 'Vanachara') || (bVashya === 'Manava' && gVashya !== 'Vanachara')) vashyaScore = 1;
  else if (gVashya === 'Vanachara' && bVashya === 'Chatushpada') vashyaScore = 0;
  else vashyaScore = 1;
  const vashyaDesc = `Groom: ${gVashya}, Bride: ${bVashya} (${vashyaScore}/2 pts)`;

  // 3. Tara Koota (Max 3 pts)
  // Distance Groom to Bride and Bride to Groom mod 9
  const distGtoB = ((brideData.nakshatraId - groomData.nakshatraId + 27) % 27) % 9;
  const distBtoG = ((groomData.nakshatraId - brideData.nakshatraId + 27) % 27) % 9;
  const inauspiciousRem = [3, 5, 7]; // Vipat, Pratyak, Naidhana
  const tara1 = inauspiciousRem.includes(distGtoB) ? 0 : 1.5;
  const tara2 = inauspiciousRem.includes(distBtoG) ? 0 : 1.5;
  const taraScore = tara1 + tara2;
  const taraDesc = `Groom to Bride: Remainder ${distGtoB}, Bride to Groom: Remainder ${distBtoG} (${taraScore}/3 pts)`;

  // 4. Yoni Koota (Max 4 pts)
  let yoniScore = 2; // Neutral
  if (groomNak.yoni === brideNak.yoni) {
    yoniScore = 4;
  } else {
    const isMortalEnemy = YONI_ENEMIES.some(
      ([a, b]) => (groomNak.yoni === a && brideNak.yoni === b) || (groomNak.yoni === b && brideNak.yoni === a)
    );
    if (isMortalEnemy) {
      yoniScore = 0;
    } else {
      yoniScore = 2; // Average mutual compatibility
    }
  }
  const yoniDesc = `Groom Yoni: ${groomNak.yoni}, Bride Yoni: ${brideNak.yoni} (${yoniScore}/4 pts)`;

  // 5. Graha Maitri (Max 5 pts)
  const gLord = groomRashi.lord;
  const bLord = brideRashi.lord;
  const gRel = GRAHA_FRIENDSHIP[gLord]?.[bLord] ?? 0;
  const bRel = GRAHA_FRIENDSHIP[bLord]?.[gLord] ?? 0;
  let grahaScore = 0;
  if (gLord === bLord) grahaScore = 5;
  else if (gRel === 1 && bRel === 1) grahaScore = 5;
  else if ((gRel === 1 && bRel === 0) || (gRel === 0 && bRel === 1)) grahaScore = 4;
  else if (gRel === 0 && bRel === 0) grahaScore = 3;
  else if ((gRel === 1 && bRel === -1) || (gRel === -1 && bRel === 1)) grahaScore = 1;
  else grahaScore = 0;
  const grahaDesc = `Moon Lords: Groom (${gLord}) & Bride (${bLord}) (${grahaScore}/5 pts)`;

  // 6. Gana Koota (Max 6 pts)
  let ganaScore = 0;
  if (groomNak.gana === brideNak.gana) ganaScore = 6;
  else if ((groomNak.gana === 'Deva' && brideNak.gana === 'Manushya') || (groomNak.gana === 'Manushya' && brideNak.gana === 'Deva')) ganaScore = 5;
  else if ((groomNak.gana === 'Deva' && brideNak.gana === 'Rakshasa') || (groomNak.gana === 'Rakshasa' && brideNak.gana === 'Deva')) ganaScore = 1;
  else ganaScore = 0; // Manushya + Rakshasa
  const ganaDesc = `Groom: ${groomNak.gana}, Bride: ${brideNak.gana} (${ganaScore}/6 pts)`;

  // 7. Bhakoot Koota (Max 7 pts)
  const rashiDiff = Math.abs(groomData.rashiId - brideData.rashiId) + 1;
  const relDiff = rashiDiff > 6 ? 14 - rashiDiff : rashiDiff;
  let bhakootScore = 7;
  let bhakootDosha = false;
  if ([2, 6, 9].includes(rashiDiff) || [12, 8, 5].includes(rashiDiff)) {
    bhakootScore = 0;
    bhakootDosha = true;
  }
  // Bhakoot Parihara (Cancellation): Same lord or friendly lords
  let bhakootCancelled = false;
  if (bhakootDosha && (gLord === bLord || (gRel === 1 && bRel === 1))) {
    bhakootCancelled = true;
  }
  const bhakootDesc = bhakootDosha 
    ? (bhakootCancelled ? `Dosha Cancelled by Lord Friendship (7/7 pts)` : `Bhakoot Dosha Present (0/7 pts)`)
    : `Auspicious Sign Alignment (7/7 pts)`;
  if (bhakootCancelled) bhakootScore = 7;

  // 8. Nadi Koota (Max 8 pts)
  let nadiScore = 8;
  let nadiDosha = false;
  if (groomNak.nadi === brideNak.nadi) {
    nadiScore = 0;
    nadiDosha = true;
  }
  // Nadi Parihara (Cancellation)
  // Nullified if different Pada, same Moon sign different Nakshatra, or same/friendly lords
  let nadiCancelled = false;
  if (nadiDosha) {
    if (groomData.nakshatraId === brideData.nakshatraId && groomData.pada !== brideData.pada) {
      nadiCancelled = true;
    } else if (groomData.rashiId === brideData.rashiId && groomData.nakshatraId !== brideData.nakshatraId) {
      nadiCancelled = true;
    } else if (gLord === bLord || (gRel === 1 && bRel === 1)) {
      nadiCancelled = true;
    }
  }
  const nadiDesc = nadiDosha
    ? (nadiCancelled ? `Nadi Dosha Cancelled via Parihara Rule (8/8 pts)` : `Nadi Dosha Affliction (0/8 pts)`)
    : `Harmonious Nadis (${groomNak.nadi} & ${brideNak.nadi}) (8/8 pts)`;
  if (nadiCancelled) nadiScore = 8;

  // Total Score Calculation
  const totalScore = varnaScore + vashyaScore + taraScore + yoniScore + grahaScore + ganaScore + bhakootScore + nadiScore;

  // Manglik (Kuja) Dosha Evaluation
  // Affliction occurs when Mars occupies houses 1, 2, 4, 7, 8, 12
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const groomManglik = manglikHouses.includes(groomData.marsHouse);
  const brideManglik = manglikHouses.includes(brideData.marsHouse);
  
  let manglikStatus = 'Non-Manglik Match';
  if (groomManglik && brideManglik) {
    manglikStatus = 'Balanced Manglik (Both charts possess Kuja Dosha, creating energetic equilibrium)';
  } else if (groomManglik || brideManglik) {
    manglikStatus = `Single Manglik Affliction (${groomManglik ? 'Groom' : 'Bride'} has Mars in House ${groomManglik ? groomData.marsHouse : brideData.marsHouse}). Parihara Puja / Shanti recommended.`;
  }

  return {
    totalScore,
    maxScore: 36,
    isViable: totalScore >= 18,
    isStrong: totalScore >= 24,
    compatibilityTier: totalScore >= 28 ? 'Uttama (Excellent)' : totalScore >= 18 ? 'Madhyama (Acceptable)' : 'Adhama (Incompatible)',
    kootas: [
      { name: 'Varna', max: 1, obtained: varnaScore, desc: varnaDesc },
      { name: 'Vashya', max: 2, obtained: vashyaScore, desc: vashyaDesc },
      { name: 'Tara', max: 3, obtained: taraScore, desc: taraDesc },
      { name: 'Yoni', max: 4, obtained: yoniScore, desc: yoniDesc },
      { name: 'Graha Maitri', max: 5, obtained: grahaScore, desc: grahaDesc },
      { name: 'Gana', max: 6, obtained: ganaScore, desc: ganaDesc },
      { name: 'Bhakoot', max: 7, obtained: bhakootScore, desc: bhakootDesc, dosha: bhakootDosha, cancelled: bhakootCancelled },
      { name: 'Nadi', max: 8, obtained: nadiScore, desc: nadiDesc, dosha: nadiDosha, cancelled: nadiCancelled }
    ],
    manglik: {
      groomManglik,
      brideManglik,
      status: manglikStatus
    }
  };
}
