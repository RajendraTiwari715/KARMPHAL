// Lal Kitab Algorithmic Remedial Framework
// Fixed-house Aries baseline, Soya Ghar, Masnooi Grahas, Karmic Debts, and Non-Gemstone Upays

export const LAL_KITAB_HOUSES = [
  { house: 1, naturalLord: 'Mars', sign: 'Aries', domain: 'Head, Self-Worth, Life Force' },
  { house: 2, naturalLord: 'Venus', sign: 'Taurus', domain: 'Wealth, Speech, Family Assets' },
  { house: 3, naturalLord: 'Mercury', sign: 'Gemini', domain: 'Siblings, Courage, Arms' },
  { house: 4, naturalLord: 'Moon', sign: 'Cancer', domain: 'Mother, Heart, Peace, Home' },
  { house: 5, naturalLord: 'Sun', sign: 'Leo', domain: 'Progeny, Intellect, Past Karma' },
  { house: 6, naturalLord: 'Mercury', sign: 'Virgo', domain: 'Debts, Diseases, Maternal Uncle' },
  { house: 7, naturalLord: 'Venus', sign: 'Libra', domain: 'Spouse, Partnerships, Daily Trade' },
  { house: 8, naturalLord: 'Mars', sign: 'Scorpio', domain: 'Death, Hidden Secrets, Obstacles' },
  { house: 9, naturalLord: 'Jupiter', sign: 'Sagittarius', domain: 'Fortune, Dharma, Ancestors (Pitri)' },
  { house: 10, naturalLord: 'Saturn', sign: 'Capricorn', domain: 'Profession, Father, Government' },
  { house: 11, naturalLord: 'Saturn', sign: 'Aquarius', domain: 'Gains, Elder Siblings, Desires' },
  { house: 12, naturalLord: 'Jupiter', sign: 'Pisces', domain: 'Losses, Moksha, Foreign Lands, Sleep' }
];

export const MASNOOI_GRAHA_PAIRS = [
  { planets: ['Sun', 'Saturn'], creates: 'Artificial Venus or Mars (Masnooi Shukra/Mangal)', implication: 'Dual polarity of hot and cold, requires grounding copper or silver' },
  { planets: ['Mercury', 'Venus'], creates: 'Artificial Sun (Masnooi Surya)', implication: 'Heightened intellect and charisma, active public communication' },
  { planets: ['Sun', 'Mercury'], creates: 'Budhaditya / Balanced Intelligence', implication: 'Royal administrative capability and sharp memory' },
  { planets: ['Jupiter', 'Rahu'], creates: 'Guru Chandal / Artificial Ketu', implication: 'Subtle spiritual doubt, requires saffron tilak & sacred river dip' },
  { planets: ['Mars', 'Saturn'], creates: 'Artificial Rahu/Ketu (Masnooi Paap)', implication: 'Fiery mechanical friction, pacified by sweetened bread feeding to stray dogs' }
];

export function analyzeLalKitab(planetPlacements = []) {
  // planetPlacements: array of { name: 'Sun', house: 1..12 }
  
  // 1. Identify Occupied & Sleeping Houses (Soya Ghar)
  const houseOccupancy = Array.from({ length: 12 }, (_, i) => ({
    house: i + 1,
    planets: [],
    isSoya: true
  }));

  planetPlacements.forEach(p => {
    if (p.house >= 1 && p.house <= 12) {
      houseOccupancy[p.house - 1].planets.push(p.name);
      houseOccupancy[p.house - 1].isSoya = false;
    }
  });

  // Sleeping Houses summary
  const sleepingHouses = houseOccupancy.filter(h => h.isSoya).map(h => ({
    house: h.house,
    domain: LAL_KITAB_HOUSES[h.house - 1].domain,
    activationTrigger: `Activated during Varshphal year ${h.house} or by donating goods ruled by ${LAL_KITAB_HOUSES[h.house - 1].naturalLord}`
  }));

  // 2. Detect Masnooi Grahas (Artificial Pairs in same house)
  const detectedMasnooi = [];
  houseOccupancy.forEach(h => {
    if (h.planets.length >= 2) {
      MASNOOI_GRAHA_PAIRS.forEach(pair => {
        const hasBoth = pair.planets.every(pl => h.planets.some(p => p.toLowerCase().includes(pl.toLowerCase())));
        if (hasBoth) {
          detectedMasnooi.push({
            house: h.house,
            components: pair.planets.join(' + '),
            creates: pair.creates,
            implication: pair.implication
          });
        }
      });
    }
  });

  // 3. Karmic Debts (Rin) Evaluation
  const karmicDebts = [];
  
  // Pitri Rin (Ancestral Debt): Jupiter afflicted by Rahu in 9th or 5th house
  const jup = planetPlacements.find(p => p.name.includes('Jupiter'));
  const rahu = planetPlacements.find(p => p.name.includes('Rahu'));
  const ketu = planetPlacements.find(p => p.name.includes('Ketu'));
  const sun = planetPlacements.find(p => p.name.includes('Sun'));
  const moon = planetPlacements.find(p => p.name.includes('Moon'));
  const venus = planetPlacements.find(p => p.name.includes('Venus'));
  const saturn = planetPlacements.find(p => p.name.includes('Saturn'));

  if (jup && rahu && (jup.house === 9 || rahu.house === 9 || jup.house === rahu.house)) {
    karmicDebts.push({
      debt: 'Pitri Rin (पितृ ऋण - Ancestral Debt)',
      affliction: 'Jupiter afflicted by Rahu in 9th House / Conjunction',
      effect: 'Stagnation in lineage prosperity, unexpected obstacles in higher learning',
      remedy: 'Contribute equally with all blood relatives to donate yellow grams (Chana Dal) and turmeric to temple priests or cows.'
    });
  }

  // Matri Rin (Maternal Debt): Ketu in 4th house or Moon afflicted
  if (ketu && ketu.house === 4) {
    karmicDebts.push({
      debt: 'Matri Rin (मातृ ऋण - Maternal Line Affliction)',
      affliction: 'Ketu situated in the 4th House (Seat of Mother)',
      effect: 'Mental restlessness, property litigation, lack of peace at domestic hearth',
      remedy: 'Collect equal silver coins from all immediate family members and perform Jal Pravah (immerse in a continuously flowing sacred river).'
    });
  }

  // Stri Rin (Spouse Debt): Venus afflicted by Sun or Rahu
  if (venus && (venus.house === 7 || venus.house === 2) && (sun?.house === venus.house || rahu?.house === venus.house)) {
    karmicDebts.push({
      debt: 'Stri Rin (स्त्री ऋण - Sacred Feminine Debt)',
      affliction: 'Venus afflicted in 2nd or 7th House',
      effect: 'Marital friction, delayed prosperity, physical fatigue',
      remedy: 'Feed 100 white cows with green fodder or donate pure ghee in temple havan.'
    });
  }

  // Kudrati Rin (Nature / God Debt): Moon in 6th house
  if (moon && moon.house === 6) {
    karmicDebts.push({
      debt: 'Kudrati Rin (कुदरती ऋण - Universal Nature Debt)',
      affliction: 'Moon residing in 6th House',
      effect: 'Sudden financial swings, unexpected medical expenses',
      remedy: 'Feed sweet bread (Rotis with jaggery) to 100 stray dogs over 43 consecutive days.'
    });
  }

  // General Scriptural Non-Gemstone Remedies (Lal Kitab Upay)
  const defaultRemedies = [
    { type: 'Jal Pravah (जल प्रवाह)', item: 'Flowing water immersion of whole coconuts or unboiled coal', rule: 'Must be executed strictly during daylight before sunset.' },
    { type: 'Bhoomi Daan / Seva', item: 'Feeding grains (Saptadhanya) to wild birds on terrace/open ground', rule: 'Discharges planetary friction from Mercury and Rahu.' },
    { type: 'Silver / Copper Anchors', item: 'Carrying a solid square silver piece (Chandi ka Chaukor Tukda)', rule: 'Stabilizes Moon and fortifies mental tranquility against Rahu illusions.' },
    { type: 'Prasad & Tilak', item: 'Daily application of Kesar (Saffron) or Chandan tilak on forehead and navel', rule: 'Fortifies Jupiter (Guru) and dissolves negative Masnooi Graha effects.' }
  ];

  return {
    houseOccupancy,
    sleepingHouses,
    detectedMasnooi: detectedMasnooi.length ? detectedMasnooi : [{ components: 'None', creates: 'No adverse pairs detected', implication: 'Planetary alignments remain standard' }],
    karmicDebts: karmicDebts.length ? karmicDebts : [{ debt: 'Nir-Rin (ऋण मुक्त)', affliction: 'No heavy ancestral debt matrices found in current configuration', effect: 'Natural karmic flow', remedy: 'Perform regular Nitya Karma and Gayatri Japa.' }],
    remedies: defaultRemedies
  };
}
