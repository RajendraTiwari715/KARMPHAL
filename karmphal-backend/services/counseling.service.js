const db = require('../database');

/**
 * Converts Devanagari numerals (०-९) to ASCII digits (0-9)
 */
function toAsciiDigits(str) {
  if (!str || typeof str !== 'string') return '';
  const devanagariDigits = '०१२३४५६७८९';
  return str.replace(/[०-९]/g, (ch) => devanagariDigits.indexOf(ch));
}

/**
 * CRISIS EMERGENCY RESOURCES (India)
 * Plain language, accessible 24/7, verified national helplines
 */
const CRISIS_RESOURCES_BLOCK = `
---
🆘 **मानसिक स्वास्थ्य व संकट सहायता (24/7 Emergency Support Helplines)**:
आपका जीवन अमूल्य, पवित्र और सम्भावनाओं से परिपूर्ण है। यह कठिन समय भी निश्चित रूप से बीत जाएगा। कृपया किसी पेशेवर काउंसलर अथवा अपने किसी आत्मीय से तुरंत बात करें:
- **KIRAN मानसिक स्वास्थ्य हेल्पलाइन**: [1800-599-0019](tel:18005990019) (24/7 टोल-फ्री, भारत सरकार)
- **Tele-MANAS**: [14416](tel:14416) अथवा [1800-891-4416](tel:18008914416) (24/7 टोल-फ्री, भारत सरकार)
- **Vandrevala Foundation**: [9999 666 555](tel:9999666555) / [1860-2662-345](tel:18602662345) (24/7 परामर्श)
- **iCall (TISS)**: [9152987821](tel:9152987821) (सोमवार से शनिवार, 10:00 AM - 08:00 PM)
- **राष्ट्रीय आपातकालीन सेवा (National Emergency)**: [112](tel:112)
---`;

// Internal telemetry metrics for hallucination monitoring
const internalMetrics = {
  totalCounselingRequests: 0,
  classifiedCounts: {
    'self-harm-risk': 0,
    'anxiety/despair': 0,
    'anger/injustice': 0,
    'grief': 0,
    'duty-conflict/confusion': 0,
    'general-question': 0
  },
  hallucinationsCaught: 0,
  citationsVerified: 0
};

/**
 * Emotion/Intent Classification Pass (Part B.1 & D.1)
 * Evaluates text in Hindi, Hinglish, and English.
 * Prioritizes self-harm/suicide detection above all else (err on the side of caution).
 */
function classifyEmotionAndIntent(userMessage) {
  if (!userMessage || typeof userMessage !== 'string') {
    return { category: 'general-question', isCrisis: false, confidence: 1.0 };
  }

  const raw = userMessage.toLowerCase();
  const normalized = raw
    .replace(/[-.,/#!$%^&*;:{}=_`~()?'"॥।]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // -------------------------------------------------------------
  // 1. SELF-HARM / CRISIS DETECTION (CRITICAL - Cannot be bypassed)
  // Direct, indirect, existential hopelessness, and hypothetical phrasing
  // -------------------------------------------------------------
  const crisisPatterns = [
    // Direct suicidal phrases (English, Hindi, Hinglish with typos)
    /\b(sui[cs]ides?|sui[cs]idal|sucide|suecide)\b/i,
    /\b(kill\s*myself|end\s*my\s*life|ending\s*my\s*life|die\s*by\s*suicide)\b/i,
    /\b(mar\s*jana\s*(?:chahta|chahti|h\b|hai)|marna\s*(?:chahta|chahti|h\b|hai)|mujhe\s*marna\s*h\b|mar\s*jane\s*ka\s*man|jaan\s*de\s*(?:du|dungi|dunga)|jaan\s*le\s*lu|khudkushi|atmahatya|atma\s*hatya)\b/i,
    
    // Devanagari direct phrases
    /(आत्महत्या|आत्मघात|खुदकुशी|खुद\s*को\s*मार|मरना\s*चाहता|मरना\s*चाहती|मरने\s*का\s*मन|जान\s*दे\s*दूँ|जान\s*ले\s*लूँ|प्राण\s*त्याग\s*दूँ)/u,
    
    // Lethal means / Self-harm methods (with 'the/a' and participle variants)
    /\b(take\s*poison|swallow\s*pills|hang\s*myself|slit\s*my\s*wrists?)\b/i,
    /\b(jump(?:ing)?\s*(?:off|from)\s*(?:a\s*|the\s*)?(?:bridge|roof|building|balcony|terrace|cliff|train|window))\b/i,
    /\b(zeher\s*kha|faansi\s*laga|chhat\s*se\s*(?:kood|jump)|nas\s*kaat)\b/i,
    /(जहर\s*खा|फांसी\s*लगा|छत\s*से\s*(?:कूद|छलांग)|नदी\s*में\s*कूद|नस\s*काट)/u,

    // Existential hopelessness / Wanting life to end / Negations / Metaphors
    /\b(i\s*want\s*to\s*die|wish\s*i\s*were\s*dead|better\s*off(?:\s+\w+){0,4}\s+dead|no\s*reason\s*to\s*live|point\s*of\s*living|tired\s*of\s*living|tired\s*of\s*existing)\b/i,
    /\b(can['’]?t\s*go\s*on(?:\s*anymore)?|can['’]?t\s*take\s*(?:this|it)\s*anymore|cannot\s*go\s*on|cannot\s*take\s*(?:this|it)\s*anymore)\b/i,
    /\b(don['’]?t\s*(?:want|wish)\s*to\s*live|no\s*will\s*to\s*live|lost\s*(?:the\s*)?will\s*to\s*live)\b/i,
    /\b(jeene\s*ka(?:\s+\w+){0,3}\s*man\s*nahi|zindagi\s*(?:khatam|khatm)|kya\s*fayda\s*is\s*zindagi|koi\s*(?:bhi\s*)?jeene\s*ki\s*wajah\s*nahi|koi\s*rasta\s*nahi(?:\s*\w+){0,3}\s*jeene)\b/i,
    /\b(sab\s*(?:khatam|khatm|samapt)\s*k[a]?r\s*(?:du|raha|lunga|dena))\b/i,
    /(जीने\s*का(?:\s+[\u0900-\u097F]+){0,3}\s+मन\s*नहीं|ज़िन्दगी\s*(?:खत्म|समाप्त)|जिंदगी\s*से\s*थक|जीने\s*की\s*कोई\s*वजह\s*नहीं|जीना\s*नहीं\s*चाहता)/u,
    /(सब\s*(?:खत्म|समाप्त)\s*(?:कर\s*दूँ|कर\s*लूँगा|करूँगा|करने\s*जा\s*रहा)|मुझसे\s*नहीं\s*सहा\s*जाता|दर्द\s*नहीं\s*सहा\s*जाता)/u,
    /\b(nobody\s*will\s*miss\s*me|i\s*am\s*a\s*burden|want\s*to\s*disappear\s*forever|cannot\s*take\s*this\s*pain\s*anymore)\b/i,
    /\b(hamesha\s*ke\s*liye\s*so\s*jana|sleep\s*forever\s*and\s*never\s*wake|is\s*sharir\s*se\s*mukti\s*chahta)\b/i,
    /(हमेशा\s*के\s*लिए\s*सो\s*जाना|शरीर\s*से\s*मुक्ति\s*चाहता)/u,

    // Hypothetical & Philosophical queries on self-harm
    /\b(if\s*(?:i|someone)\s*(?:commits?\s*sui[cs]ide|ends?\s*(?:my|their)\s*life))\b/i,
    /\b(agar\s*(?:main|koi)\s*(?:atmahatya|sui[cs]ide|mar\s*jaye))\b/i,
    /(अगर\s*(?:कोई|मैं)\s*(?:आत्महत्या|खुदकुशी|प्राण\s*त्याग))/u,
    /\b(is\s*it\s*(?:a\s*sin|wrong)\s*to\s*kill\s*oneself|what\s*happens\s*to\s*soul\s*after\s*sui[cs]ide)\b/i,
    /(आत्महत्या\s*करने\s*पर\s*क्या\s*होता|खुदकुशी\s*पाप\s*है\s*क्या)/u,

    // Threat to harm others
    /\b(want\s*to\s*kill\s*(?:him|her|someone|them)|stab\s*someone|murder\s*someone)\b/i,
    /\b(kisi\s*ko\s*maar\s*daal|jaan\s*se\s*maar\s*du)\b/i,
    /(किसी\s*को\s*मार\s*डाल|जान\s*से\s*मार\s*दूँ)/u
  ];

  for (const pattern of crisisPatterns) {
    if (pattern.test(normalized) || pattern.test(userMessage)) {
      return { category: 'self-harm-risk', isCrisis: true, confidence: 0.95 };
    }
  }

  // -------------------------------------------------------------
  // 2. GRIEF / BEREAVEMENT DETECTION
  // Loss of loved ones, passing away, bereavement
  // -------------------------------------------------------------
  const griefPatterns = [
    /\b(died|passed\s*away|loss\s*of\s*my|lost\s*my\s*(?:mother|father|grandfather|grandmother|dadi|nani|dada|nana|brother|sister|friend|child|son|daughter)|grief|bereavement|mourning)\b/i,
    /\b(guzar\s*gaye|swargwas|nidhan|dehant|kho\s*diya|shok|rip|lost\s*loved\s*one)\b/i,
    /(निधन|देहांत|गुजर\s*गए|स्वर्गवास|मृत्यु|शोक|शोकसंतप्त|चले\s*गए|खो\s*दिया|अंतिम\s*संस्कार)/u
  ];

  for (const pattern of griefPatterns) {
    if (pattern.test(normalized) || pattern.test(userMessage)) {
      return { category: 'grief', isCrisis: false, confidence: 0.9 };
    }
  }

  // -------------------------------------------------------------
  // 3. ANXIETY / DESPAIR DETECTION
  // Exam pressure, panic, fear, worry, restlessness, stress
  // Placed before duty dilemma so acute anxiety takes priority
  // -------------------------------------------------------------
  const anxietyPatterns = [
    /\b(anxiety|anxious|panic|fear|scared|worried|worry|exam\s*stress|stress|restless|restlessness|overthinking|nervous|hopeless|depressed|pressure)\b/i,
    /\b(chinta|dar|tanaav|ghabrahat|niraasha|pareshan|stress|overthink|anxious)\b/i,
    /(चिंता|भय|डर|तनाव|घबराहट|उद्वेग|अशान्ति|निराशा|परीक्षा\s*का\s*तनाव|मानसिक\s*तनाव|परेशान)/u
  ];

  for (const pattern of anxietyPatterns) {
    if (pattern.test(normalized) || pattern.test(userMessage)) {
      return { category: 'anxiety/despair', isCrisis: false, confidence: 0.85 };
    }
  }

  // -------------------------------------------------------------
  // 4. ANGER / INJUSTICE DETECTION
  // Betrayal, cheating, intense resentment, unfairness, rage
  // -------------------------------------------------------------
  const angerPatterns = [
    /\b(angry|rage|furious|unfair|injustice|cheated|betrayed|revenge|hate\s*them|hatred|screaming|resentment)\b/i,
    /\b(gussa|krodh|dhokha|badla|pratishodh|naainsafi|anyay|cheated\s*me|betrayal)\b/i,
    /(क्रोध|गुस्सा|अन्याय|धोखा|प्रतिशोध|बदला|द्वेष|अपमान|क्रोधित|धोखेबाज|नाइंसाफी)/u
  ];

  for (const pattern of angerPatterns) {
    if (pattern.test(normalized) || pattern.test(userMessage)) {
      return { category: 'anger/injustice', isCrisis: false, confidence: 0.88 };
    }
  }

  // -------------------------------------------------------------
  // 5. DUTY-CONFLICT / CONFUSION DETECTION
  // Dilemmas, career choices, ethics, what should I do, moral crisis
  // -------------------------------------------------------------
  const dutyPatterns = [
    /\b(dilemma|confused|confusion|duty|responsibility|career\s*choice|right\s*or\s*wrong|what\s*should\s*i\s*do|which\s*path|moral\s*crisis|swadharma|swadharam)\b/i,
    /\b(dharmasankat|kartavya|duvidha|kya\s*karu|kya\s*sahi\s*hai|confuse|which\s*decision|swadharma|swadharam)\b/i,
    /(धर्मसंकट|कर्तव्य|दुविधा|भ्रम|क्या\s*करूँ|क्या\s*सही\s*है|कर्तव्यविमूढ़|निर्णय|मार्गदर्शन|स्वधर्म)/u
  ];

  for (const pattern of dutyPatterns) {
    if (pattern.test(normalized) || pattern.test(userMessage)) {
      return { category: 'duty-conflict/confusion', isCrisis: false, confidence: 0.85 };
    }
  }

  return { category: 'general-question', isCrisis: false, confidence: 0.7 };
}

/**
 * Retrieves top 2-3 most relevant verses from SQLite based on category & message (Part B.2)
 */
function retrieveGroundingVerses(category, userMessage = '') {
  let tagSearchTerms = [];

  switch (category) {
    case 'self-harm-risk':
      // Emphasize sanctity of human life, self-worth, and divine strength
      tagSearchTerms = ['self-harm-risk', 'human-life-sanctity', 'self-worth', 'despair'];
      break;
    case 'grief':
      tagSearchTerms = ['grief', 'loss', 'death', 'consolation', 'peace'];
      break;
    case 'anger/injustice':
      tagSearchTerms = ['anger', 'injustice', 'rage', 'equality', 'compassion', 'forgiveness'];
      break;
    case 'duty-conflict/confusion':
      tagSearchTerms = ['duty-conflict', 'dharma', 'confusion', 'action', 'ethics', 'karma'];
      break;
    case 'anxiety/despair':
      tagSearchTerms = ['anxiety', 'despair', 'mental-peace', 'fear', 'equanimity', 'tolerance'];
      break;
    case 'general-question':
    default:
      tagSearchTerms = ['general', 'wisdom', 'peace', 'karma', 'dharma'];
      break;
  }

  // Construct matching score query across tags
  const allVerses = db.prepare('SELECT id, source, reference, sanskrit_text, hindi_translation, tags, verified_source FROM ScriptureVerses').all();

  const msgLower = (userMessage || '').toLowerCase();

  const scored = allVerses.map(v => {
    let score = 0;
    const vTags = (v.tags || '').toLowerCase().split(',').map(t => t.trim());

    for (const term of tagSearchTerms) {
      if (vTags.includes(term)) {
        score += 5;
      } else if (vTags.some(t => t.includes(term) || term.includes(t))) {
        score += 2;
      }
    }

    // Specific category priority overrides
    if (category === 'self-harm-risk') {
      if (v.reference === 'Ramcharitmanas Uttara 7.44') score += 15; // human life is rare & sacred
      if (v.reference === 'Gita 6.5') score += 12; // elevate self by self
      if (v.reference === 'Chandogya Upanishad 6.8.7') score += 10; // tat tvam asi
      if (v.reference === 'Gita 18.58') score += 8; // crossing all crises
    } else if (category === 'grief') {
      if (v.reference === 'Gita 2.20' || v.reference === 'Gita 2.22') score += 10;
      if (v.reference === 'Gita 2.14') score += 8;
    } else if (category === 'duty-conflict/confusion') {
      if (v.reference === 'Gita 2.47' || v.reference === 'Gita 3.35') score += 10;
    } else if (category === 'anger/injustice') {
      if (v.reference === 'Gita 2.63' || v.reference === 'Gita 16.21' || v.reference === 'Ramcharitmanas Aranya 3.32') score += 10;
    } else if (category === 'anxiety/despair') {
      if (v.reference === 'Gita 2.47' || v.reference === 'Gita 6.35' || v.reference === 'Gita 9.22') score += 10;
    }

    // Check if verse reference is mentioned in query
    if (msgLower.includes(v.reference.toLowerCase()) || msgLower.includes(v.source.toLowerCase())) {
      score += 3;
    }

    return { verse: v, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top 2-3 verses
  return scored.slice(0, 3).map(s => s.verse);
}

/**
 * Builds grounding context and strict citation system instruction (Part B.3 & D.3)
 */
function buildGroundingInstruction(groundingVerses, category) {
  let promptContext = `\n[प्रमाणित शास्त्र श्लोक सन्दर्भ (CURATED SCRIPTURE GROUNDING)]:\n`;

  groundingVerses.forEach((v, idx) => {
    promptContext += `${idx + 1}. सन्दर्भ ग्रन्थ: ${v.source} | प्रामाणिक उद्धरण: "${v.reference}"\n   श्लोक: ${v.sanskrit_text}\n   हिन्दी अर्थ: ${v.hindi_translation}\n   स्रोत: ${v.verified_source}\n\n`;
  });

  let safetyConstraint = `
STRICT ANTI-HALLUCINATION & CITATION RULES:
1. Base your spiritual counseling directly on the curated verses provided above.
2. If you cite any verse, Cite ONLY from the references provided above using their exact reference string (e.g. "${groundingVerses[0]?.reference || 'Gita 2.47'}").
3. NEVER invent a verse, chapter number, or quote any text that is not provided in this context.
4. Speak with profound Vedic empathy, warmth, clarity, and patience.
`;

  if (category === 'self-harm-risk') {
    safetyConstraint += `
CRITICAL CRISIS SAFETY PROTOCOL:
- The user is expressing signs of severe distress, existential despair, or self-harm risk.
- Your tone MUST be deeply calm, unconditional, reassuring, and affirming the sacred sanctity of human life.
- Emphasize that human birth is a rare, precious divine blessing (साधन धाम) and every difficulty can be overcome.
- You MUST NEVER use fear-mongering, Garuda Purana punishment framing, blame, guilt, or fatalism.
- Explicitly and tenderly encourage the seeker to connect with human beings, counselors, and supportive people.
`;
  }

  return { promptContext, safetyConstraint };
}

/**
 * Anti-Hallucination Citation Validator (Part C.1 & C.2)
 * Parses scripture citations in the AI output and verifies them against the curated database.
 * If Gemini cites a fabricated citation, strips the false citation and logs telemetry.
 */
function validateAndSanitizeCitations(aiResponseText, groundingVerses = []) {
  if (!aiResponseText || typeof aiResponseText !== 'string') {
    return { text: aiResponseText, hallucinationDetected: false, invalidCitations: [] };
  }

  const validReferences = new Set(groundingVerses.map(v => v.reference.toLowerCase()));

  // Also allow citations from the general ScriptureVerses table
  const allCuratedRefs = db.prepare('SELECT reference FROM ScriptureVerses').all();
  allCuratedRefs.forEach(r => validReferences.add(r.reference.toLowerCase()));

  // Normalize Devanagari digits to ASCII for uniform parsing
  const normalizedText = toAsciiDigits(aiResponseText);

  // Regexes to extract common scripture citation patterns:
  // 1. Gita / Bhagavad Gita / गीता X.Y or X:Y or अध्याय X श्लोक Y
  const gitaCitationRegex = /(?:श्रीमद्भगवद्गीता|भगवद्गीता|गीता|Bhagavad\s*Gita|Gita)\s*(?:के\s*)?(?:अध्याय\s*)?(\d+)[\s,.:-]+(?:श्लोक\s*)?(\d+)/gi;
  // 2. Garuda Purana X.Y.Z
  const garudaCitationRegex = /(?:गरुड़\s*पुराण|Garuda\s*Purana)\s*(\d+)[\s,.:-]+(\d+)(?:[\s,.:-]+(\d+))?/gi;

  let sanitized = aiResponseText;
  let hallucinationDetected = false;
  const invalidCitations = [];

  // Check Gita citations
  let match;
  while ((match = gitaCitationRegex.exec(normalizedText)) !== null) {
    const chapter = parseInt(match[1], 10);
    const verseNum = parseInt(match[2], 10);
    const matchedSubstring = aiResponseText.slice(match.index, match.index + match[0].length);
    const canonicalRef = `gita ${chapter}.${verseNum}`;

    internalMetrics.citationsVerified++;

    // Gita only has 18 chapters and maximum 78 verses in chapter 18
    const isOutOfBounds = chapter < 1 || chapter > 18 || verseNum < 1 || verseNum > 78;
    const isCurated = validReferences.has(canonicalRef) || validReferences.has(`gita ${chapter}.${verseNum}`);

    if (isOutOfBounds || !isCurated) {
      hallucinationDetected = true;
      invalidCitations.push(matchedSubstring);
      internalMetrics.hallucinationsCaught++;
      console.warn(`[AntiHallucination] Fabricated or unverified citation caught: "${matchedSubstring}" (canonical: ${canonicalRef})`);
      
      // Strip fabricated specific citation, replacing with general authentic reference
      sanitized = sanitized.replace(matchedSubstring, 'श्रीमद्भगवद्गीता के उपदेश');
    }
  }

  // Check Garuda Purana citations
  while ((match = garudaCitationRegex.exec(normalizedText)) !== null) {
    const kanda = parseInt(match[1], 10);
    const chapter = parseInt(match[2], 10);
    const verseNum = match[3] ? parseInt(match[3], 10) : null;
    const refKey1 = verseNum ? `garuda purana ${kanda}.${chapter}.${verseNum}` : `garuda purana ${kanda}.${chapter}`;
    const refKey2 = `garuda purana ${kanda}.${chapter}`;
    const matchedSubstring = aiResponseText.slice(match.index, match.index + match[0].length);

    internalMetrics.citationsVerified++;

    const isCurated = validReferences.has(refKey1) || validReferences.has(refKey2);
    if (!isCurated) {
      hallucinationDetected = true;
      invalidCitations.push(matchedSubstring);
      internalMetrics.hallucinationsCaught++;
      console.warn(`[AntiHallucination] Ungrounded Garuda Purana citation stripped: "${matchedSubstring}" (key: ${refKey1})`);
      sanitized = sanitized.replace(matchedSubstring, 'सद्विचार और सत्कर्म के शास्त्र-वचन');
    }
  }

  return {
    text: sanitized,
    hallucinationDetected,
    invalidCitations
  };
}

/**
 * Appends Crisis Resources Header & Body when crisis is detected (Part D.2 & D.3)
 */
function formatCrisisResponse(baseText) {
  // Prepend or append crisis support resources prominently in plain language
  return `${baseText}\n\n${CRISIS_RESOURCES_BLOCK}`;
}

/**
 * Logs wellbeing reflection event and updates user Punya points (Part E)
 */
function recordWellbeingReflection(userId, category, querySummary = '', versesCited = []) {
  if (!userId) return;

  try {
    const versesStr = versesCited.map(v => v.reference).join(', ');

    // 1. Log in WellbeingJourneys table
    db.prepare(`
      INSERT INTO WellbeingJourneys (userId, category, userQuerySummary, versesCited)
      VALUES (?, ?, ?, ?)
    `).run(userId, category, querySummary.slice(0, 200), versesStr);

    // 2. Grant +5 Punya for spiritual self-reflection / Svadhyaya
    db.prepare(`
      UPDATE Users 
      SET totalPunya = totalPunya + 5, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(userId);

    // 3. Log into SadhanaLogs
    db.prepare(`
      INSERT INTO SadhanaLogs (userId, type, details)
      VALUES (?, 'counseling_reflection', ?)
    `).run(userId, `आचार्य संवाद स्वाध्याय: श्रेणी (${category}) - उद्धृत: ${versesStr || 'शास्त्र मार्गदर्शन'}`);
  } catch (err) {
    console.warn('[Wellbeing] Non-fatal error recording reflection:', err.message);
  }
}

/**
 * Retrieves a user's private wellbeing reflection journey (Part E)
 */
function getUserWellbeingJourney(userId) {
  if (!userId) return null;

  const total = db.prepare('SELECT COUNT(*) as count FROM WellbeingJourneys WHERE userId = ?').get(userId);
  const byCategory = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM WellbeingJourneys 
    WHERE userId = ? 
    GROUP BY category
    ORDER BY count DESC
  `).all(userId);

  const recent = db.prepare(`
    SELECT id, category, userQuerySummary, versesCited, timestamp 
    FROM WellbeingJourneys 
    WHERE userId = ? 
    ORDER BY timestamp DESC 
    LIMIT 20
  `).all(userId);

  return {
    totalReflections: total?.count || 0,
    themeBreakdown: byCategory,
    recentReflections: recent
  };
}

/**
 * Returns current monitoring metrics
 */
function getMetrics() {
  return { ...internalMetrics };
}

module.exports = {
  classifyEmotionAndIntent,
  retrieveGroundingVerses,
  buildGroundingInstruction,
  validateAndSanitizeCitations,
  formatCrisisResponse,
  recordWellbeingReflection,
  getUserWellbeingJourney,
  getMetrics,
  toAsciiDigits,
  CRISIS_RESOURCES_BLOCK
};
