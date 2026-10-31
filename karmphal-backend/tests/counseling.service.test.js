const counselingService = require('../services/counseling.service');
const { db, resetTestDatabase } = require('./setup');
const { v4: uuidv4 } = require('uuid');

describe('Scripture-Grounded Counseling Service Unit Tests', () => {
  beforeEach(() => {
    resetTestDatabase();
  });

  describe('Emotion & Intent Classification (Part B.1 & D.1)', () => {
    describe('CRITICAL: Crisis & Self-Harm Detection (Part D.1 & D.5)', () => {
      const directPhrasings = [
        'I want to kill myself tonight.',
        'Mujhe suicide karne ka man kar raha hai.',
        'Main mar jana chahta hu sab khatam ho gaya.',
        'Lagta hai zeher kha lu aur sab samapt kar du.',
        'I am planning to end my life.',
        'Atmahatya karne ka vichaar aa raha hai.'
      ];

      it.each(directPhrasings)('detects direct self-harm intent: "%s"', (phrase) => {
        const result = counselingService.classifyEmotionAndIntent(phrase);
        expect(result.category).toBe('self-harm-risk');
        expect(result.isCrisis).toBe(true);
      });

      const indirectPhrasings = [
        'What is the point of living when everything is hopeless?',
        'Kya fayda is zindagi ka jab koi khushi hi nahi bachi.',
        'I feel like everyone would be better off if I were dead.',
        'Jeene ka ab koi man nahi karta bilkul.',
        'I cannot take this unbearable pain anymore, want to disappear forever.',
        'Koi jeene ki wajah nahi bachi mere paas.'
      ];

      it.each(indirectPhrasings)('detects indirect/existential self-harm intent: "%s"', (phrase) => {
        const result = counselingService.classifyEmotionAndIntent(phrase);
        expect(result.category).toBe('self-harm-risk');
        expect(result.isCrisis).toBe(true);
      });

      const hypotheticalPhrasings = [
        'Agar koi atmahatya kare to kya agle janam me narak milta hai?',
        'If someone commits suicide, what happens to their soul according to Gita?',
        'Hypothetically if I end my life, will my family be punished by karma?',
        'Kya khudkushi karna paap hai jab dard bardasht se bahar ho?'
      ];

      it.each(hypotheticalPhrasings)('detects hypothetical/philosophical self-harm queries: "%s"', (phrase) => {
        const result = counselingService.classifyEmotionAndIntent(phrase);
        expect(result.category).toBe('self-harm-risk');
        expect(result.isCrisis).toBe(true);
      });

      it('detects intent to harm others', () => {
        const result = counselingService.classifyEmotionAndIntent('I want to kill someone who betrayed me.');
        expect(result.category).toBe('self-harm-risk');
        expect(result.isCrisis).toBe(true);
      });
    });

    describe('Adversarial Self-Harm & False-Positive Regression Suite (18 Scenarios)', () => {
      const adversarialCases = [
        // 1. Typos
        { id: 'TYPO-1', input: 'mujhe marna h bs', expectedCrisis: true },
        { id: 'TYPO-2', input: 'zindagi khatm krne ka man kr raha h ab', expectedCrisis: true },
        { id: 'TYPO-3', input: 'suiside krne ki soch rha hu', expectedCrisis: true },

        // 2. Negated statements / Complex expressions
        { id: 'NEG-1', input: "I don't want to die but I can't go on anymore", expectedCrisis: true },
        { id: 'NEG-2', input: "I don't wish to live like this anymore, everything hurts", expectedCrisis: true },
        { id: 'NEG-3', input: "Mujhe marna to nahi tha par ab koi rasta nahi dikh raha jeene ka", expectedCrisis: true },

        // 3. Metaphorical language
        { id: 'META-1', input: 'I want to disappear forever and never wake up', expectedCrisis: true },
        { id: 'META-2', input: 'Bas hamesha ke liye so jana chahta hu taaki sab khatam ho jaye', expectedCrisis: true },
        { id: 'META-3', input: 'Is sharir se mukti chahta hu hamesha ke liye, dard seh nahi sakta', expectedCrisis: true },

        // 4. Genuine spiritual question with buried crisis signal
        { id: 'BURIED-1', input: 'गीता में मोक्ष का क्या विधान है? क्योंकि अब मेरा इस दुनिया में दम घुट रहा है और मैं सब खत्म करने जा रहा हूँ।', expectedCrisis: true },
        { id: 'BURIED-2', input: 'What does Krishna say about karma? I feel like jumping from the roof because my karma is too dark.', expectedCrisis: true },

        // 5. Gradual escalation across conversation (simulated inputs)
        { id: 'CONV-STEP-1', input: 'जीवन में बहुत कठिनाइयाँ आ रही हैं।', expectedCrisis: false },
        { id: 'CONV-STEP-2', input: 'हर तरफ से निराशा ही हाथ लग रही है, कुछ समझ नहीं आ रहा।', expectedCrisis: false },
        { id: 'CONV-STEP-3', input: 'अब मुझसे नहीं सहा जाता, आज रात सब समाप्त कर लूँगा।', expectedCrisis: true },

        // 6. False-Positive risks (Academic/philosophical questions about death/mortality - MUST NOT trigger crisis!)
        { id: 'FP-1', input: 'गीता में मृत्यु के बारे में क्या कहा गया है?', expectedCrisis: false },
        { id: 'FP-2', input: 'What is the concept of death and reincarnation in Katha Upanishad?', expectedCrisis: false },
        { id: 'FP-3', input: 'महाभारत के युद्ध में इतने लोगों की मृत्यु क्यों हुई? क्या यह नियति थी?', expectedCrisis: false },
        { id: 'FP-4', input: 'गरुड़ पुराण में यमलोक और मृत्यु के पश्चात आत्मा की यात्रा का क्या वर्णन है?', expectedCrisis: false }
      ];

      it.each(adversarialCases)('$id: accurately handles "$input" (expectedCrisis: $expectedCrisis)', ({ input, expectedCrisis }) => {
        const result = counselingService.classifyEmotionAndIntent(input);
        expect(result.isCrisis).toBe(expectedCrisis);
        if (expectedCrisis) {
          expect(result.category).toBe('self-harm-risk');
        } else {
          expect(result.category).not.toBe('self-harm-risk');
        }
      });
    });

    describe('Non-Crisis Mental Health & Emotional Categories (Part D.5)', () => {
      it('correctly classifies anxiety/despair without triggering crisis', () => {
        const phrases = [
          'I have extreme exam stress and fear of failing.',
          'Mujhe kal ke interview ki bahut chinta aur ghabrahat ho rahi hai.',
          'I am overthinking constantly and feeling anxious.',
          'Bhavishya ko lekar bahut dar lag raha hai man ashant hai.'
        ];
        phrases.forEach((p) => {
          const res = counselingService.classifyEmotionAndIntent(p);
          expect(res.category).toBe('anxiety/despair');
          expect(res.isCrisis).toBe(false);
        });
      });

      it('correctly classifies grief without triggering crisis', () => {
        const phrases = [
          'My grandfather passed away yesterday and I am heartbroken.',
          'Dadi ji ka nidhan ho gaya hai, parivar shok me hai.',
          'I lost my mother last week, how to find peace?',
          'Mitra ka akal dehant ho gaya hai, atma ki shanti ke liye kya karein?'
        ];
        phrases.forEach((p) => {
          const res = counselingService.classifyEmotionAndIntent(p);
          expect(res.category).toBe('grief');
          expect(res.isCrisis).toBe(false);
        });
      });

      it('correctly classifies anger/injustice without triggering crisis', () => {
        const phrases = [
          'My business partner cheated me of all my savings and I am furious.',
          'Mujhe us par bahut krodh aur gussa aa raha hai jisne dhokha diya.',
          'Why is there so much injustice in the world towards good people?',
          'Usne mera bura kiya hai aur main badla lene ki soch raha hu.'
        ];
        phrases.forEach((p) => {
          const res = counselingService.classifyEmotionAndIntent(p);
          expect(res.category).toBe('anger/injustice');
          expect(res.isCrisis).toBe(false);
        });
      });

      it('correctly classifies duty-conflict/confusion without triggering crisis', () => {
        const phrases = [
          'I am in a moral dilemma between family duty and my career passion.',
          'Dharmasankat me hu ki kya sahi hai aur kya galat.',
          'What is my true swadharma according to Bhagavad Gita?',
          'Badi duvidha me hu, kaun sa rasta chunu samajh nahi aa raha.'
        ];
        phrases.forEach((p) => {
          const res = counselingService.classifyEmotionAndIntent(p);
          expect(res.category).toBe('duty-conflict/confusion');
          expect(res.isCrisis).toBe(false);
        });
      });

      it('correctly defaults to general-question for ordinary philosophical inquiries', () => {
        const res = counselingService.classifyEmotionAndIntent('श्रीमद्भगवद्गीता का मुख्य सन्देश क्या है?');
        expect(res.category).toBe('general-question');
        expect(res.isCrisis).toBe(false);
      });
    });
  });

  describe('Curated Scripture Retrieval (Part B.2 & H.1)', () => {
    it('retrieves 2 to 3 valid verses for each category', () => {
      const categories = [
        'self-harm-risk',
        'anxiety/despair',
        'grief',
        'anger/injustice',
        'duty-conflict/confusion',
        'general-question'
      ];

      categories.forEach((cat) => {
        const verses = counselingService.retrieveGroundingVerses(cat, 'test inquiry');
        expect(verses.length).toBeGreaterThanOrEqual(2);
        expect(verses.length).toBeLessThanOrEqual(3);

        verses.forEach((v) => {
          expect(v.reference).toBeTruthy();
          expect(v.sanskrit_text).toBeTruthy();
          expect(v.hindi_translation).toBeTruthy();
          expect(v.verified_source).toBeTruthy();
        });
      });
    });

    it('retrieves life-affirming verses for self-harm risk', () => {
      const verses = counselingService.retrieveGroundingVerses('self-harm-risk', 'jeene ka man nahi');
      const references = verses.map((v) => v.reference);
      // Must include Ramcharitmanas 7.44 (human birth is rare/sacred) or Gita 6.5 (elevate self)
      const hasLifeAffirmingVerse = references.includes('Ramcharitmanas Uttara 7.44') || references.includes('Gita 6.5');
      expect(hasLifeAffirmingVerse).toBe(true);
    });

    it('retrieves soul immortality and equanimity verses for grief', () => {
      const verses = counselingService.retrieveGroundingVerses('grief', 'grandmother passed away');
      const references = verses.map((v) => v.reference);
      const hasGriefVerse = references.includes('Gita 2.20') || references.includes('Gita 2.22') || references.includes('Gita 2.14');
      expect(hasGriefVerse).toBe(true);
    });

    it('retrieves karma/action verses for duty-conflict', () => {
      const verses = counselingService.retrieveGroundingVerses('duty-conflict/confusion', 'what should I do');
      const references = verses.map((v) => v.reference);
      const hasDutyVerse = references.includes('Gita 2.47') || references.includes('Gita 3.35');
      expect(hasDutyVerse).toBe(true);
    });
  });

  describe('Grounding Prompt Instruction (Part B.3 & D.3)', () => {
    it('generates prompt with strict citation constraints', () => {
      const verses = counselingService.retrieveGroundingVerses('anxiety/despair', 'chinta ho rahi hai');
      const { promptContext, safetyConstraint } = counselingService.buildGroundingInstruction(verses, 'anxiety/despair');

      expect(promptContext).toContain(verses[0].reference);
      expect(promptContext).toContain(verses[0].sanskrit_text);
      expect(safetyConstraint).toContain('Cite ONLY from the references provided above');
      expect(safetyConstraint).toContain('NEVER invent a verse');
    });

    it('adds crisis safety protocol when category is self-harm-risk', () => {
      const verses = counselingService.retrieveGroundingVerses('self-harm-risk', 'suicide');
      const { safetyConstraint } = counselingService.buildGroundingInstruction(verses, 'self-harm-risk');

      expect(safetyConstraint).toContain('CRITICAL CRISIS SAFETY PROTOCOL');
      expect(safetyConstraint).toContain('You MUST NEVER use fear-mongering');
      expect(safetyConstraint).toContain('affirming the sacred sanctity of human life');
    });
  });

  describe('Anti-Hallucination Validation (Part C.1 & C.2)', () => {
    it('passes authentic citations untouched', () => {
      const verses = counselingService.retrieveGroundingVerses('duty-conflict/confusion', 'karma');
      const aiResponse = 'जैसा कि श्रीमद्भगवद्गीता के अध्याय २ श्लोक ४७ (Gita 2.47) में भगवान श्री कृष्ण कहते हैं, कर्म ही तुम्हारा अधिकार है।';

      const result = counselingService.validateAndSanitizeCitations(aiResponse, verses);
      expect(result.hallucinationDetected).toBe(false);
      expect(result.text).toContain('Gita 2.47');
    });

    it('detects, strips, and sanitizes fabricated chapter/verse numbers', () => {
      const verses = counselingService.retrieveGroundingVerses('general-question', 'dharma');
      // Gita 25.99 does not exist in Mahabharata/Gita (Gita only has 18 chapters)
      const fabricatedResponse = 'भगवान ने गीता अध्याय २५ श्लोक ९९ में कहा है कि आलस्य छोड़ो।';

      const result = counselingService.validateAndSanitizeCitations(fabricatedResponse, verses);
      expect(result.hallucinationDetected).toBe(true);
      expect(result.text).not.toContain('अध्याय २५ श्लोक ९९');
      expect(result.text).toContain('श्रीमद्भगवद्गीता के उपदेश');
    });

    it('detects and strips fabricated Garuda Purana citations', () => {
      const verses = counselingService.retrieveGroundingVerses('general-question', 'punya');
      const fakeGaruda = 'गरुड़ पुराण ९९.८८.७७ के अनुसार ऐसा करने से घोर दण्ड मिलेगा।';

      const result = counselingService.validateAndSanitizeCitations(fakeGaruda, verses);
      expect(result.hallucinationDetected).toBe(true);
      expect(result.text).not.toContain('गरुड़ पुराण ९९.८८.७७');
    });
  });

  describe('Crisis Safety Layer Formatting (Part D.2 & D.3)', () => {
    it('appends Indian national mental health helplines in plain language', () => {
      const baseResponse = 'वत्स, तुम्हारा जीवन अत्यंत पावन है।';
      const formatted = counselingService.formatCrisisResponse(baseResponse);

      expect(formatted).toContain('1800-599-0019'); // KIRAN
      expect(formatted).toContain('14416'); // Tele-MANAS
      expect(formatted).toContain('9999 666 555'); // Vandrevala
      expect(formatted).toContain('9152987821'); // iCall
      expect(formatted).toContain('112'); // National emergency
      expect(formatted).toContain('मानसिक स्वास्थ्य व संकट सहायता');
      expect(formatted).toContain('आपका जीवन अमूल्य, पवित्र और सम्भावनाओं से परिपूर्ण है');
    });
  });

  describe('Wellbeing Journey Tracking & Punya Points Extension (Part E)', () => {
    it('records reflection event, awards 5 punya points, and persists to DB', () => {
      const userId = uuidv4();
      db.prepare('INSERT INTO Users (id, name, totalPunya) VALUES (?, ?, ?)')
        .run(userId, 'जिज्ञासु साधक', 20);

      const verses = [
        { reference: 'Gita 2.47' },
        { reference: 'Gita 6.5' }
      ];

      counselingService.recordWellbeingReflection(userId, 'duty-conflict/confusion', 'career dilemma query', verses);

      // Verify Punya points incremented by +5
      const user = db.prepare('SELECT totalPunya FROM Users WHERE id = ?').get(userId);
      expect(user.totalPunya).toBe(25);

      // Verify SadhanaLogs entry
      const log = db.prepare('SELECT * FROM SadhanaLogs WHERE userId = ?').get(userId);
      expect(log).toBeTruthy();
      expect(log.type).toBe('counseling_reflection');
      expect(log.details).toContain('duty-conflict/confusion');

      // Verify WellbeingJourneys record
      const journey = counselingService.getUserWellbeingJourney(userId);
      expect(journey.totalReflections).toBe(1);
      expect(journey.themeBreakdown[0].category).toBe('duty-conflict/confusion');
      expect(journey.recentReflections[0].userQuerySummary).toBe('career dilemma query');
    });
  });
});
