const request = require('supertest');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const app = require('../server');
const geminiService = require('../services/gemini.service');
const { db, resetTestDatabase } = require('./setup');

function createAuthenticatedUser(role = 'guest') {
  const userId = uuidv4();
  db.prepare('INSERT INTO Users (id, name, rank, totalPunya) VALUES (?, ?, ?, ?)')
    .run(userId, 'जिज्ञासु साधक', 'आरम्भिक', 10);

  const token = jwt.sign(
    { sub: userId, role },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' }
  );

  return { userId, token };
}

describe('Scripture-Grounded Counseling Full Flow Integration Tests', () => {
  beforeEach(() => {
    resetTestDatabase();
    vi.restoreAllMocks();
  });

  describe('Grounding Injection & Anti-Hallucination (Part B & C)', () => {
    it('injects curated verses into prompt and sanitizes fabricated citations in Gemini output', async () => {
      const { token } = createAuthenticatedUser();
      let capturedSystemInstruction = null;
      let capturedContents = null;

      vi.spyOn(geminiService, 'callGemini').mockImplementation(async (contents, systemInstruction) => {
        capturedContents = contents;
        capturedSystemInstruction = systemInstruction;
        // Mock Gemini returning a response with a fake citation (Gita 29.88 does not exist)
        return {
          text: 'वत्स, शांत हो जाओ। गीता अध्याय २९ श्लोक ८८ (Gita 29.88) में कहा गया है कि कर्म ही सर्वोपरि है।'
        };
      });

      const res = await request(app)
        .post('/api/ai/acharya')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userMessage: 'मुझे भविष्य को लेकर बहुत चिंता हो रही है, क्या करूँ?'
        })
        .expect(200);

      // 1. Verify grounding verses were injected into prompt
      expect(capturedContents).toBeTruthy();
      const promptText = capturedContents[capturedContents.length - 1].parts[0].text;
      expect(promptText).toContain('CURATED SCRIPTURE GROUNDING');

      // 2. Verify strict system boundary instruction was passed
      expect(capturedSystemInstruction).toContain('STRICT ANTI-HALLUCINATION & CITATION RULES');
      expect(capturedSystemInstruction).toContain('Cite ONLY from the references provided above');

      // 3. Verify fabricated citation was caught and sanitized from the response text
      expect(res.body.text).not.toContain('अध्याय २९ श्लोक ८८');
      expect(res.body.text).toContain('श्रीमद्भगवद्गीता के उपदेश');

      // 4. Verify metadata and timings
      expect(res.body.grounding).toBeTruthy();
      expect(res.body.grounding.category).toBe('anxiety/despair');
      expect(res.body.grounding.isCrisis).toBe(false);
      expect(res.body.grounding.verses.length).toBeGreaterThanOrEqual(2);
      expect(res.body.timings).toBeTruthy();
      expect(typeof res.body.timings.totalMs).toBe('number');
    });
  });

  describe('CRITICAL: Crisis Safety Layer End-to-End (Part D)', () => {
    it('attaches emergency Indian mental health helplines prominently when self-harm is detected', async () => {
      const { token } = createAuthenticatedUser();

      vi.spyOn(geminiService, 'callGemini').mockImplementation(async () => {
        return {
          text: 'वत्स, तुम्हारा जीवन अत्यंत पावन है। कठिन समय में ईश्वर का स्मरण करो।'
        };
      });

      const res = await request(app)
        .post('/api/ai/acharya')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userMessage: 'Main mar jana chahta hu, ab jeene ki koi wajah nahi bachi.'
        })
        .expect(200);

      // Verify crisis flag
      expect(res.body.grounding.isCrisis).toBe(true);
      expect(res.body.grounding.category).toBe('self-harm-risk');

      // Verify ALL required crisis resources are prominently present in plain language
      expect(res.body.text).toContain('1800-599-0019'); // KIRAN
      expect(res.body.text).toContain('14416'); // Tele-MANAS
      expect(res.body.text).toContain('9999 666 555'); // Vandrevala Foundation
      expect(res.body.text).toContain('9152987821'); // iCall
      expect(res.body.text).toContain('112'); // National emergency
      expect(res.body.text).toContain('मानसिक स्वास्थ्य व संकट सहायता');
      expect(res.body.text).toContain('वत्स, तुम्हारा जीवन अत्यंत पावन है'); // Spiritual support preserved
    });

    it('does NOT attach crisis helplines to normal non-crisis queries (Part D.5)', async () => {
      const { token } = createAuthenticatedUser();

      vi.spyOn(geminiService, 'callGemini').mockImplementation(async () => {
        return {
          text: 'श्रीमद्भगवद्गीता के अनुसार आत्मा अजर-अमर है।'
        };
      });

      const res = await request(app)
        .post('/api/ai/acharya')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userMessage: 'Dadi ji ka nidhan ho gaya hai, bahut dukh ho raha hai.'
        })
        .expect(200);

      expect(res.body.grounding.isCrisis).toBe(false);
      expect(res.body.grounding.category).toBe('grief');
      expect(res.body.text).not.toContain('1800-599-0019');
      expect(res.body.text).not.toContain('Tele-MANAS');
    });
  });

  describe('Wellbeing Journey & Punya System Extension (Part E)', () => {
    it('records reflection, increments punya points, and allows private journey retrieval', async () => {
      const userA = createAuthenticatedUser();
      const userB = createAuthenticatedUser();

      vi.spyOn(geminiService, 'callGemini').mockImplementation(async () => {
        return { text: 'स्वधर्म का पालन ही श्रेष्ठ है।' };
      });

      // User A submits counseling query
      await request(app)
        .post('/api/ai/acharya')
        .set('Authorization', `Bearer ${userA.token}`)
        .send({ userMessage: 'Main dharmasankat me hu, career ka kya nirnay lu?' })
        .expect(200);

      // Verify User A totalPunya was incremented from 10 to 15 (+5 for reflection)
      const profileA = db.prepare('SELECT totalPunya FROM Users WHERE id = ?').get(userA.userId);
      expect(profileA.totalPunya).toBe(15);

      // User A fetches their private journey
      const journeyResA = await request(app)
        .get('/api/user/wellbeing-journey')
        .set('Authorization', `Bearer ${userA.token}`)
        .expect(200);

      expect(journeyResA.body.data.totalReflections).toBe(1);
      expect(journeyResA.body.data.themeBreakdown[0].category).toBe('duty-conflict/confusion');

      // User B fetches their private journey -> MUST be empty (tenant isolation)
      const journeyResB = await request(app)
        .get('/api/user/wellbeing-journey')
        .set('Authorization', `Bearer ${userB.token}`)
        .expect(200);

      expect(journeyResB.body.data.totalReflections).toBe(0);
      expect(journeyResB.body.data.themeBreakdown).toEqual([]);
    });
  });

  describe('Scripture Knowledge Base APIs (Part A.3)', () => {
    it('allows querying curated scriptures by source and tag', async () => {
      const { token } = createAuthenticatedUser();

      const res = await request(app)
        .get('/api/ai/scriptures?source=Gita&tag=duty-conflict')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
      expect(res.body.data[0].source).toBe('Gita');
    });

    it('allows admin to add/update scripture verses', async () => {
      const admin = createAuthenticatedUser('admin');

      const newVerse = {
        source: 'Gita',
        reference: 'Gita 2.50',
        sanskrit_text: 'बुद्धियुक्तो जहातीह उभे सुकृतदुष्कृते। तस्माद्योगाय युज्यस्व योगः कर्मसु कौशलम्॥',
        hindi_translation: 'समबुद्धियुक्त पुरुष पुण्य और पाप दोनों को यहीं त्याग देता है। इसलिये तू योग में प्रवृत्त हो जा; कर्मों में कुशलता ही योग है।',
        tags: 'duty-conflict,action,skill,karma',
        verified_source: 'Gita Press Gorakhpur, Shrimadbhagavadgita Chapter 2'
      };

      const addRes = await request(app)
        .post('/api/ai/scriptures')
        .set('Authorization', `Bearer ${admin.token}`)
        .send(newVerse)
        .expect(200);

      expect(addRes.body.success).toBe(true);

      // Verify verse now exists in DB
      const verseInDb = db.prepare('SELECT * FROM ScriptureVerses WHERE reference = ?').get('Gita 2.50');
      expect(verseInDb).toBeTruthy();
      expect(verseInDb.sanskrit_text).toContain('योगः कर्मसु कौशलम्');
    });
  });
});

