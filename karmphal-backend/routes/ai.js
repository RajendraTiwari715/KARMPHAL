const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { callGemini } = require('../services/gemini.service');
const { requireAuth } = require('../middlewares/auth');
const { chatSchema, kundaliSchema, vivahMilanSchema } = require('../schemas/ai.schema');

// 1. Enforce Authentication on all AI endpoints
router.use(requireAuth);

// 2. Per-User Rate Limiting (10 AI requests per minute per user)
const aiPerUserLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 requests per minute per authenticated user
  keyGenerator: (req) => req.user?.id || 'anonymous',
  validate: { ip: false, xForwardedForHeader: false },
  message: {
    error: 'RATE_LIMIT',
    message: 'प्रति-उपयोगकर्ता AI अनुरोध सीमा समाप्त हो गई है। कृपया 1 मिनट बाद पुनः प्रयास करें।'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.use(aiPerUserLimiter);

// System prompt for Acharya chat
const ACHARYA_SYSTEM_INSTRUCTION = `You are an enlightened, highly knowledgeable, and deeply respectful Vedic scholar, Jyotishacharya, and expert in Sanatan Dharma, Hindu scriptures, and Vedic Karmkand. 

CRITICAL BEHAVIORAL & TECHNICAL GUIDELINES:
1. ABSOLUTE ACCURACY & ZERO HALLUCINATION: Analyze systematically and truthfully based only on the provided context.
2. THEOLOGICAL SAFETY (STRICT): NEVER provide advice or mantras for black magic, Vashikaran, Maran, Uchchatan, or harming others. If asked, strictly refuse, stating it violates Sanatan Dharmic principles.
3. NO FEAR-MONGERING: When discussing Garuda Purana, Narakas, Doshas (like Kaal Sarp), or Swapna Shastra, DO NOT use a fatalistic, threatening, or absolute tone. Frame them as cautionary spiritual metaphors, focusing on 'Prayashchitta' (remedies) and positive transformation.
4. SCOPE BOUNDARIES: Do NOT provide medical diagnoses, legal advice, or speculative financial advice. If asked about religions or topics entirely outside Sanatan Dharma, politely redirect the conversation back to Vedic wisdom, stating your expertise is limited to this tradition.
5. SCRIPTURAL DEPTH: Infuse your answers with wisdom from Vedas, Upanishads, Gita, and Puranas. Provide authentic, Sattvic rituals and mantras.
6. LANGUAGE & TONE: Communicate primarily in fluent, pure Hindi, Sanskrit-infused Hindi, or respectful English. Be compassionate and guru-like.`;

// Shared Handler for Acharya Chat (/acharya and /chat)
async function handleAcharyaChat(req, res, next) {
  try {
    const validatedData = chatSchema.parse(req.body);
    const { userMessage, conversationHistory, ragContext } = validatedData;

    const fullPrompt = `[शास्त्र व पञ्चाङ्ग सन्दर्भ]:\n${ragContext || ''}\n\n[शिष्य का प्रश्न / मन की बात]:\n${userMessage}`;

    // Ensure strictly alternating roles: user -> model -> user -> model
    const filteredHistory = [];
    (conversationHistory || []).forEach(msg => {
      const role = msg.sender === 'user' ? 'user' : 'model';
      if (filteredHistory.length === 0 && role !== 'user') return; // History must start with user
      if (filteredHistory.length > 0 && filteredHistory[filteredHistory.length - 1].role === role) return; // Skip consecutive identical roles
      filteredHistory.push({ role, parts: [{ text: msg.text }] });
    });

    if (filteredHistory.length > 0 && filteredHistory[filteredHistory.length - 1].role === 'user') {
      filteredHistory.pop();
    }

    const contents = [
      ...filteredHistory.slice(-4), // Keep last 4 valid alternating messages
      {
        role: 'user',
        parts: [{ text: fullPrompt }]
      }
    ];

    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048
    };

    const responseObj = await callGemini(contents, ACHARYA_SYSTEM_INSTRUCTION, generationConfig);
    res.json({ text: responseObj.text });
  } catch (err) {
    next(err);
  }
}

// POST /api/ai/acharya - Primary endpoint for Acharya Chatbot
router.post('/acharya', handleAcharyaChat);

// POST /api/ai/chat - Backward-compatible alias
router.post('/chat', handleAcharyaChat);

// POST /api/ai/kundali - Detailed Vedic Kundali Reading
router.post('/kundali', async (req, res, next) => {
  try {
    const validatedData = kundaliSchema.parse(req.body);
    const { birthDetails, planetsData, dashaTimeline } = validatedData;

    const systemInstruction = `Role: You are an elite, highly knowledgeable Vedic Astrologer (Jyotishi) and Master of traditional Parashari Astrology, integrated with a high-precision backend calculation engine. Your job is to generate exceptionally accurate, authentic, and detailed Vedic Kundali (Birth Chart) analysis.

### Core Calculation & Astrological Rules to Follow:
- Data Source Handling: NEVER invent planetary positions or Mahadasha. Only analyze the JSON data provided in the request body.
- Data-to-Insight Translation: Translate the raw degree data and Mahadasha into rich, professional Vedic insights.
- Theological Safety: Respectful, wise, positive, and guru-like. STRICTLY AVOID fear-mongering. Never predict death, terminal illness, or absolute ruin. Do not offer medical diagnosis. Always provide practical Sattvic remedies (Upay).`;

    let dashaText = '';
    if (dashaTimeline && Array.isArray(dashaTimeline) && dashaTimeline.length > 0) {
      dashaText = `\n[विंशोत्तरी महादशा चक्र]:\n` + 
        dashaTimeline.map(d => `- ${d.lord} महादशा: ${d.startDate || ''} से ${d.endDate || ''} (${d.years || ''} वर्ष)`).join('\n');
    }

    const userPrompt = `[जातक का जन्म विवरण]:
- नाम: ${birthDetails.name}
- जन्म दिनांक: ${birthDetails.dob}
- जन्म समय: ${birthDetails.time} ${birthDetails.isTimeApproximate ? "(अनुमानित समय - लग्न/नवांश अनिश्चित हो सकता है)" : "(सटीक समय)"}
- जन्म स्थान: ${birthDetails.place}

[गणना की गई ग्रह स्थिति]:
${planetsData.map(p => `- ${p.name} (${p.sanskrit || ''}): ${p.house}वें भाव में, राशि: ${p.signSanskrit}, अंश: ${p.degreeInSign}°, वक्री: ${p.isRetro ? 'हाँ' : 'नहीं'}`).join('\n')}${dashaText}

कृपया इस जातक की सम्पूर्ण, प्रामाणिक और विस्तृत जन्म पत्रिका हिन्दी में प्रस्तुत करें।`;

    const generationConfig = { temperature: 0.6, topK: 40, topP: 0.95, maxOutputTokens: 4096 };

    const responseObj = await callGemini([{ role: 'user', parts: [{ text: userPrompt }] }], systemInstruction, generationConfig);
    res.json({ text: responseObj.text });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/vivah-milan - Ashtakoot Vivah Milan Analysis
router.post('/vivah-milan', async (req, res, next) => {
  try {
    const validatedData = vivahMilanSchema.parse(req.body);
    const { groomData, brideData, ashtakootScore } = validatedData;
    
    const systemInstruction = `Role: You are an elite Vedic Astrologer and Master Matchmaker (Jyotish Acharya) with deep expertise in Ashtakoot Milan, Nadi Dosha cancellations, and Manglik matching.

Theological Safety & Rules: Respectful, wise, positive, and guru-like. STRICTLY AVOID fear-mongering. Never predict death or absolute doom due to Doshas (like Nadi or Bhakoot). Always emphasize Parihara (cancellations) and Sattvic remedies. Only analyze the JSON data provided in the request body.`;

    const userPrompt = `[वर का विवरण]:
- नाम: ${groomData.name}
- जन्म नक्षत्र: ${groomData.nakshatraName || 'रोहिणी'} (पाद ${groomData.pada || 2})
- चन्द्र राशि: ${groomData.rashiName || 'वृषभ'}
- मंगल स्थिति: ${groomData.marsHouse || 0}वें भाव में

[कन्या का विवरण]:
- नाम: ${brideData.name}
- जन्म नक्षत्र: ${brideData.nakshatraName || 'हस्त'} (पाद ${brideData.pada || 1})
- चन्द्र राशि: ${brideData.rashiName || 'कन्या'}
- मंगल स्थिति: ${brideData.marsHouse || 0}वें भाव में

[प्राप्त अष्टकूट स्कोर]: ${ashtakootScore?.totalScore || 0} / ३६

कृपया इस वर-कन्या युगल हेतु सम्पूर्ण, प्रामाणिक विवाह मिलान पत्रिका प्रस्तुत करें।`;

    const generationConfig = { temperature: 0.6, topK: 40, topP: 0.95, maxOutputTokens: 4096 };

    const responseObj = await callGemini([{ role: 'user', parts: [{ text: userPrompt }] }], systemInstruction, generationConfig);
    res.json({ text: responseObj.text });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
