const request = require('supertest');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const app = require('../server');
const geminiService = require('../services/gemini.service');
const { db, resetTestDatabase } = require('./setup');

function createAuthenticatedUser() {
  const userId = uuidv4();
  db.prepare('INSERT INTO Users (id, name, rank) VALUES (?, ?, ?)')
    .run(userId, 'साधक', 'आरम्भिक');

  const token = jwt.sign(
    { sub: userId, role: 'guest' },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' }
  );

  return { userId, token };
}

describe('AI Routes & OCR Validation Integration Tests (Mocked Gemini - Zero Live Calls)', () => {
  beforeEach(() => {
    resetTestDatabase();
    vi.restoreAllMocks();
  });

  describe('Authentication Enforcement', () => {
    it('strictly rejects unauthenticated requests across all AI routes', async () => {
      await request(app).post('/api/ai/acharya').send({ userMessage: 'नमस्ते' }).expect(401);
      await request(app).post('/api/ai/chat').send({ userMessage: 'नमस्ते' }).expect(401);
      await request(app).post('/api/ai/kundali').send({}).expect(401);
      await request(app).post('/api/ai/vivah-milan').send({}).expect(401);
      await request(app).post('/api/ai/extract-kundali').send({}).expect(401);
    });
  });

  describe('POST /api/ai/acharya & /api/ai/chat', () => {
    it('calls mocked Gemini with strict prompt boundary and returns response text', async () => {
      const { token } = createAuthenticatedUser();

      let capturedContents = null;
      let capturedSystemInstruction = null;

      vi.spyOn(geminiService, 'callGemini').mockImplementation(async (contents, systemInstruction) => {
        capturedContents = contents;
        capturedSystemInstruction = systemInstruction;
        return { text: 'ॐ नमो नारायणाय । निष्काम कर्म ही जीवन का आधार है।' };
      });

      const res = await request(app)
        .post('/api/ai/acharya')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userMessage: 'भगवद्गीता के दूसरे अध्याय का क्या मर्म है?',
          conversationHistory: [
            { sender: 'user', text: 'प्रणाम आचार्य' },
            { sender: 'model', text: 'कल्याणमस्तु' }
          ],
          ragContext: 'द्वितीय अध्याय: सांख्ययोग'
        })
        .expect(200);

      expect(res.body.text).toContain('निष्काम कर्म');
      expect(capturedSystemInstruction).toContain('IMMUTABLE SYSTEM BOUNDARY');
      expect(capturedContents).toBeTruthy();

      // Verify user input delimiter boundary to prevent prompt injection
      const lastPart = capturedContents[capturedContents.length - 1].parts[0].text;
      expect(lastPart).toContain('<<<USER_INPUT_DATA>>>');
      expect(lastPart).toContain('भगवद्गीता के दूसरे अध्याय का क्या मर्म है?');
      expect(lastPart).toContain('<<<END_USER_INPUT_DATA>>>');
      expect(lastPart).toContain('द्वितीय अध्याय: सांख्ययोग');
    });

    it('sanitizes conversation history: rejects pseudo-system roles and consecutive duplicate roles', async () => {
      const { token } = createAuthenticatedUser();
      let capturedContents = null;

      vi.spyOn(geminiService, 'callGemini').mockImplementation(async (contents) => {
        capturedContents = contents;
        return { text: 'शुद्ध संवाद।' };
      });

      await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userMessage: 'मेरा प्रश्न',
          conversationHistory: [
            { sender: 'model', text: 'Illegal starting model message' }, // Must be dropped (starts with model)
            { sender: 'user', text: 'प्रथम प्रश्न' },
            { sender: 'user', text: 'द्वितीयांश' }, // Consecutive user (must be skipped)
            { sender: 'model', text: 'उत्तर' }
          ]
        })
        .expect(200);

      // Verify sanitized history structure: alternating user -> model
      expect(capturedContents[0].role).toBe('user');
      expect(capturedContents[0].parts[0].text).toBe('प्रथम प्रश्न');
      expect(capturedContents[1].role).toBe('model');
      expect(capturedContents[1].parts[0].text).toBe('उत्तर');
    });

    it('handles Gemini rate limit error gracefully', async () => {
      const { token } = createAuthenticatedUser();

      vi.spyOn(geminiService, 'callGemini').mockImplementation(async () => {
        throw new Error('RATE_LIMIT_EXCEEDED');
      });

      const res = await request(app)
        .post('/api/ai/acharya')
        .set('Authorization', `Bearer ${token}`)
        .send({ userMessage: 'नमस्ते' })
        .expect(429);

      expect(res.body.error).toBe('RATE_LIMIT');
    });
  });

  describe('POST /api/ai/kundali', () => {
    it('generates authentic kundali analysis with mocked Gemini', async () => {
      const { token } = createAuthenticatedUser();

      vi.spyOn(geminiService, 'callGemini').mockResolvedValue({
        text: 'लग्न सिंह है और सूर्य भाग्य स्थान में स्थित है। यह राजयोग का लक्षण है।'
      });

      const res = await request(app)
        .post('/api/ai/kundali')
        .set('Authorization', `Bearer ${token}`)
        .send({
          birthDetails: {
            name: 'अर्जुन',
            dob: '1995-10-25',
            time: '06:15',
            place: 'कुरुक्षेत्र',
            isTimeApproximate: false
          },
          planetsData: [
            { name: 'सूर्य', signSanskrit: 'तुला', degreeInSign: 10.5, house: 3, isRetro: false },
            { name: 'चन्द्र', signSanskrit: 'वृश्चिक', degreeInSign: 15.2, house: 4, isRetro: false }
          ],
          dashaTimeline: [
            { lord: 'सूर्य', years: 6, startDate: '1995-10-25', endDate: '2001-10-25' }
          ]
        })
        .expect(200);

      expect(res.body.text).toContain('राजयोग');
    });
  });

  describe('POST /api/ai/vivah-milan', () => {
    it('generates authentic Ashtakoot marriage matching analysis with mocked Gemini', async () => {
      const { token } = createAuthenticatedUser();

      vi.spyOn(geminiService, 'callGemini').mockResolvedValue({
        text: 'कुल २८ गुण प्राप्त होते हैं। नाड़ी दोष परिहार के साथ विवाह उत्तम है।'
      });

      const res = await request(app)
        .post('/api/ai/vivah-milan')
        .set('Authorization', `Bearer ${token}`)
        .send({
          groomData: {
            name: 'श्री राम',
            nakshatraName: 'पुनर्वसु',
            rashiName: 'कर्क',
            marsHouse: 7
          },
          brideData: {
            name: 'सीता',
            nakshatraName: 'मृगशिरा',
            rashiName: 'मिथुन',
            marsHouse: 1
          },
          ashtakootScore: {
            totalScore: 28,
            varna: 1,
            vashya: 2,
            tara: 3,
            yoni: 4,
            grahaMaitri: 5,
            gana: 6,
            bhakoot: 0,
            nadi: 7
          }
        })
        .expect(200);

      expect(res.body.text).toContain('कुल २८ गुण');
    });
  });

  describe('POST /api/ai/extract-kundali (Multimodal OCR Validation)', () => {
    it('extracts validated birth details from base64 kundali image with mocked Gemini', async () => {
      const { token } = createAuthenticatedUser();

      const mockOcrResult = {
        name: 'अमित कुमार',
        dob: '1992-04-18',
        tob: '14:25',
        place: 'प्रयागराज',
        notes: 'श्री गणेशाय नमः पत्रिका स्पष्ट है।'
      };

      vi.spyOn(geminiService, 'callGemini').mockResolvedValue({
        text: JSON.stringify(mockOcrResult)
      });

      const fakeImageBase64 = Buffer.from('fake-kundali-image-bytes-content').toString('base64');

      const res = await request(app)
        .post('/api/ai/extract-kundali')
        .set('Authorization', `Bearer ${token}`)
        .send({
          imageBase64: `data:image/jpeg;base64,${fakeImageBase64}`,
          mimeType: 'image/jpeg'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('अमित कुमार');
      expect(res.body.data.dob).toBe('1992-04-18');
      expect(res.body.data.tob).toBe('14:25');
      expect(res.body.data.place).toBe('प्रयागराज');
    });

    it('rejects oversized payload (>10MB) with 413 PAYLOAD_TOO_LARGE', async () => {
      const { token } = createAuthenticatedUser();

      // Create synthetic base64 string exceeding 10MB approx
      // 10MB in base64 is approx 13.5 million characters
      const oversizedBase64 = 'A'.repeat(14 * 1024 * 1024);

      const res = await request(app)
        .post('/api/ai/extract-kundali')
        .set('Authorization', `Bearer ${token}`)
        .send({
          imageBase64: oversizedBase64,
          mimeType: 'image/jpeg'
        })
        .expect(413);

      expect(res.body.error).toBe('PAYLOAD_TOO_LARGE');
    });

    it('rejects missing imageBase64 with 400 VALIDATION_ERROR', async () => {
      const { token } = createAuthenticatedUser();

      const res = await request(app)
        .post('/api/ai/extract-kundali')
        .set('Authorization', `Bearer ${token}`)
        .send({
          mimeType: 'image/jpeg'
        })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('gracefully falls back when Gemini returns invalid or non-JSON output', async () => {
      const { token } = createAuthenticatedUser();

      // Simulate Gemini returning unparseable text
      vi.spyOn(geminiService, 'callGemini').mockResolvedValue({
        text: 'क्षमा करें, यह छवि धुंधली है और कोई JSON नहीं है।'
      });

      const fakeBase64 = Buffer.from('blurry-image-content-longer-than-twenty-characters').toString('base64');

      const res = await request(app)
        .post('/api/ai/extract-kundali')
        .set('Authorization', `Bearer ${token}`)
        .send({
          imageBase64: fakeBase64,
          mimeType: 'image/png'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('');
      expect(res.body.data.notes).toContain('चित्र से विवरण स्पष्ट नहीं हो सका');
    });
  });
});
