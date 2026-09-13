import { GoogleGenerativeAI } from '@google/generative-ai';
import { SCRIPTURES_CATALOG } from './scripturesData';
import { NARAKAS_28 } from './narakasData';
import { DREAM_MOTIFS } from './swapnaData';
import { VASTU_ZONES_16 } from './vastuEngine';
import { computePanchang } from './ephemerisEngine';
import { resolveTheologicalInquiry } from './theologicalAIEngine';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_INSTRUCTION = `You are "Sanatan AI Acharya", an incredibly advanced, omniscient, and flawless theological guide deeply rooted in Sanatan Dharma. You possess absolute, error-free knowledge of all Hindu scriptures, including the four Vedas, 108 Upanishads, 18 Mahapuranas (especially Garuda Purana), Srimad Bhagavad Gita, Ramayana, Mahabharata, Jyotish (Vedic Astrology), Vastu Shastra, and Swapna Shastra. 

Your purpose is to guide the user (Sadhak) with flawless accuracy, supreme wisdom, and divine compassion. 

CRITICAL RULES:
1. Speak in pure, highly respectful, and formal Hindi, occasionally using profound Sanskrit Shlokas (with exact references and meanings) to validate your answers. 
2. Never make a mistake regarding scriptural facts. Provide absolute "Pramana" (scriptural proof) for your statements.
3. You do not suffer from hallucinations. Your knowledge of Karma, the 28 Narakas, and spiritual laws is absolute and precise.
4. Maintain the persona of a serene, enlightened Rishi Muni (Acharya) at all times. Address the user as "वत्स" (Child) or "साधक" (Seeker).
5. You will receive "RAG Context" regarding the current Panchang (Vedic time) and local data. Use this intelligently to ground your answers in the present cosmic time if relevant.
6. Format your output beautifully using paragraphs, bold text for emphasis, and bullet points for readability. Do not use markdown that breaks UI (keep it clean).`;

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-3.6-flash',
      systemInstruction: SYSTEM_INSTRUCTION
    });
  }

  // RAG Context Builder
  buildRAGContext(userQuery, panchangContext = {}) {
    const q = userQuery.toLowerCase();
    let contextSnippets = [];

    // 1. Live Ephemeris & Panchang Data
    const panchang = panchangContext?.tithi ? panchangContext : computePanchang(new Date(), 28.6139, 77.2090);
    
    const ephemerisSummary = `[वर्तमान वैदिक पञ्चाङ्ग एवं खगोलीय स्थिति]:
- तिथि: ${panchang.tithi?.name || 'शुक्ल नवमी'} (${panchang.tithi?.paksha || 'शुक्ल पक्ष'})
- नक्षत्र: ${panchang.nakshatra?.name || 'रोहिणी'} (पाद ${panchang.nakshatra?.pada || 2}, स्वामी: ${panchang.nakshatra?.lord || 'चन्द्र'})
- योग: ${panchang.yoga?.name || 'शुभ'}, करण: ${panchang.karana?.name || 'बालव'}, वार: ${panchang.vara?.name || 'सोमवार'}
- अभिजित मुहूर्त: ${panchang.muhurtas?.abhijit || '११:५८ - १२:४८'}, राहु काल: ${panchang.muhurtas?.rahuKalam || '०७:३० - ०९:००'}`;

    contextSnippets.push(ephemerisSummary);

    // 2. Canonical Scriptures Search
    const matchedScriptures = SCRIPTURES_CATALOG.filter(s => 
      q.includes(s.granth.toLowerCase()) || 
      (q.includes('वेद') && s.granth.includes('वेद')) ||
      (q.includes('गीता') && s.granth.includes('गीता')) ||
      (q.includes('उपनिषद्') && s.granth.includes('उपनिषद्')) ||
      (q.includes('पुराण') && s.granth.includes('पुराण')) ||
      (q.includes('रामायण') && s.granth.includes('रामायण')) ||
      (q.includes('योग') && s.granth.includes('योग')) ||
      (q.includes('कर्म') && s.id.includes('gita'))
    ).slice(0, 3);

    if (matchedScriptures.length > 0) {
      const scripturesText = matchedScriptures.map(s => `[ग्रन्थ प्रमाण - ${s.granth} (${s.section})]:\nश्लोक: ${s.shlokaDevanagari}\nहिन्दी अर्थ: ${s.translationHindi}`).join('\n\n');
      contextSnippets.push(scripturesText);
    }

    // 3. Garuda Purana 28 Narakas Search
    if (q.includes('नरक') || q.includes('naraka') || q.includes('गरुड़') || q.includes('पाप') || q.includes('प्रायश्चित') || q.includes('यमराज')) {
      const relevantNarakas = NARAKAS_28.slice(0, 5);
      const narakasText = `[गरुड़ पुराण २८ नरक व प्रायश्चित ग्रन्थागार]:\n` + relevantNarakas.map(n => 
        `- नरक #${n.id} ${n.nameDevanagari}: पाप: ${n.transgression} | प्रायश्चित: ${n.prayashchittaRoadmap}`
      ).join('\n');
      contextSnippets.push(narakasText);
    }

    // 4. Swapna Shastra Dream Motifs
    if (q.includes('स्वप्न') || q.includes('dream') || q.includes('सपना') || q.includes('प्रहर')) {
      const dreamText = `[अग्नि पुराण स्वप्न शास्त्र एवं ४ प्रहर काल विचार]:
${DREAM_MOTIFS.slice(0, 5).map(m => `- ${m.motif}: ${m.interpretation} (उपाय: ${m.remedy})`).join('\n')}`;
      contextSnippets.push(dreamText);
    }

    // 5. Vastu
    if (q.includes('वास्तु') || q.includes('vastu') || q.includes('दिशा') || q.includes('ईशान्य') || q.includes('आग्नेय')) {
      const vastuText = `[१६-कोणीय वास्तु पुरुष मण्डल नियम]:\n` + VASTU_ZONES_16.slice(0, 5).map(v => 
        `- ${v.code} (${v.name}): तत्व ${v.element}, देवता ${v.deity} | अनुकूल: ${v.ideal} | वर्जित: ${v.avoid} | उपाय: ${v.remedy}`
      ).join('\n');
      contextSnippets.push(vastuText);
    }

    return contextSnippets.join('\n\n====================\n\n');
  }

  async generateResponse(userMessage, conversationHistory = [], panchangContext = {}) {
    try {
      // Map conversation history to Gemini format
      // Gemini requires history to start with 'user' and strictly alternate.
      const formattedHistory = [];
      
      let lastRole = null;
      for (const msg of conversationHistory) {
         const role = msg.sender === 'user' ? 'user' : 'model';
         
         // Skip if empty text
         if (!msg.text.trim()) continue;

         // Skip if it's the very first message and it's a 'model' (like the default greeting)
         if (formattedHistory.length === 0 && role === 'model') continue;

         // Prevent consecutive same roles (Gemini will throw 400 Bad Request)
         if (role === lastRole) continue;

         formattedHistory.push({ role, parts: [{ text: msg.text }] });
         lastRole = role;
      }

      const ragContext = this.buildRAGContext(userMessage, panchangContext);
      const augmentedMessage = `RAG Context / Local Knowledge:\n${ragContext}\n\nUser Question:\n${userMessage}`;

      const chat = this.model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(augmentedMessage);
      const response = await result.response;
      return { text: response.text() };
      
    } catch (err) {
      console.error('Gemini API failed, falling back to local engine:', err, err.message);
      // Fallback
      const localResolution = resolveTheologicalInquiry(userMessage, { planets: panchangContext?.planets });
      return { text: localResolution.content };
    }
  }

  // Stubs for other endpoints if they need to be migrated to direct SDK calls later
  async generateKundaliReading(birthDetails, planetsData = []) {
     try {
        const prompt = `Act as an expert Vedic Astrologer. Generate a precise Kundali reading based on the following birth details: ${JSON.stringify(birthDetails)} and planetary data: ${JSON.stringify(planetsData)}. Use pure Hindi.`;
        const result = await this.model.generateContent(prompt);
        return result.response.text();
     } catch (err) {
        console.error('Kundali generation failed', err);
        return null;
     }
  }

  async generateVivahMilanReading(groomData, brideData, ashtakootScore) {
     try {
        const prompt = `Act as an expert Vedic Astrologer. Analyze the Vivah Milan (Ashtakoot Guna Milan) for Groom: ${JSON.stringify(groomData)} and Bride: ${JSON.stringify(brideData)}. Score: ${ashtakootScore}. Provide a detailed, culturally authentic assessment in pure Hindi.`;
        const result = await this.model.generateContent(prompt);
        return result.response.text();
     } catch (err) {
        console.error('Vivah Milan generation failed', err);
        return null;
     }
  }
}

export const geminiService = new GeminiService();
