// Google Gemini AI + RAG (Retrieval Augmented Generation) Service for Karmphal
// Securely reads API key from .env (VITE_GEMINI_API_KEY)

import { SCRIPTURES_CATALOG } from './scripturesData';
import { NARAKAS_28 } from './narakasData';
import { DREAM_MOTIFS } from './swapnaData';
import { VASTU_ZONES_16 } from './vastuEngine';
import { computePlanetaryPositions, computePanchang } from './ephemerisEngine';
import { resolveTheologicalInquiry } from './theologicalAIEngine';

class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('karmphal_gemini_api_key') || '';
  }

  getApiKey() {
    return this.apiKey;
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    localStorage.setItem('karmphal_gemini_api_key', this.apiKey);
  }

  // RAG Context Builder: Aggregates relevant Sanatan scripture, ephemeris, and metaphysical data
  buildRAGContext(userQuery, panchangContext = {}) {
    const q = userQuery.toLowerCase();
    let contextSnippets = [];

    // 1. Live Ephemeris & Panchang Data
    const planets = panchangContext?.planets || computePlanetaryPositions();
    const panchang = panchangContext?.tithi ? panchangContext : computePanchang(new Date(), 28.6139, 77.2090);
    
    const ephemerisSummary = `[वर्तमान वैदिक पञ्चाङ्ग एवं खगोलीय स्थिति]:
- तिथि: ${panchang.tithi?.name || 'शुक्ल नवमी'} (${panchang.tithi?.paksha || 'शुक्ल पक्ष'})
- नक्षत्र: ${panchang.nakshatra?.name || 'रोहिणी'} (पाद ${panchang.nakshatra?.pada || 2}, स्वामी: ${panchang.nakshatra?.lord || 'चन्द्र'})
- योग: ${panchang.yoga?.name || 'शुभ'}, करण: ${panchang.karana?.name || 'बालव'}, वार: ${panchang.vara?.name || 'सोमवार'}
- अभिजित मुहूर्त: ${panchang.muhurtas?.abhijit || '११:५८ - १२:४८'}, राहु काल: ${panchang.muhurtas?.rahuKalam || '०७:३० - ०९:००'}, ब्रह्म मुहूर्त: ${panchang.muhurtas?.brahmaMuhurta || '०४:२४ - ०५:१२'}`;

    contextSnippets.push(ephemerisSummary);

    // 2. Canonical Scriptures Search
    const matchedScriptures = SCRIPTURES_CATALOG.filter(s => 
      q.includes(s.granth.toLowerCase()) || 
      q.includes('वेद') && s.granth.includes('वेद') ||
      q.includes('गीता') && s.granth.includes('गीता') ||
      q.includes('उपनिषद्') && s.granth.includes('उपनिषद्') ||
      q.includes('पुराण') && s.granth.includes('पुराण') ||
      q.includes('रामायण') && s.granth.includes('रामायण') ||
      q.includes('योग') && s.granth.includes('योग') ||
      q.includes('कर्म') && s.id.includes('gita')
    ).slice(0, 3);

    if (matchedScriptures.length > 0) {
      const scripturesText = matchedScriptures.map(s => `[ग्रन्थ प्रमाण - ${s.granth} (${s.section})]:
श्लोक: ${s.shlokaDevanagari}
हिन्दी अर्थ: ${s.translationHindi}
अद्वैत मत: ${s.bhashyas?.advaita?.text || ''}
विशिष्टाद्वैत मत: ${s.bhashyas?.vishishtadvaita?.text || ''}
द्वैत मत: ${s.bhashyas?.dvaita?.text || ''}`).join('\n\n');
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
- प्रथम प्रहर (सायं ६-९): १ वर्ष में फलित | द्वितीय प्रहर (रात्रि ९-१२): ६-८ मास | तृतीय प्रहर (रात्रि १२-३): ३ मास | चतुर्थ प्रहर/ब्रह्म मुहूर्त (प्रातः ३-६): १० दिनों में फलित।
प्रमुख प्रतीक:
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

  // Generate response via Google Gemini API + RAG Grounding
  async generateResponse(userMessage, conversationHistory = [], panchangContext = {}) {
    const ragContext = this.buildRAGContext(userMessage, panchangContext);

    const systemInstruction = `आप 'सनातन AI आचार्य' हैं—एक परम ज्ञानी, स्नेही, करुणामयी एवं शास्त्र-सम्मत सनातन आध्यात्मिक मार्गदर्शक।

आपके उत्तर देने के नियम:
१. भाषा: १००% शुद्ध, मधुर, प्रामाणिक एवं सरल हिन्दी। उत्तर बहुत लम्बा व उबाऊ न हो, अपितु सटीक, स्पष्ट और कल्याणकारी हो।
२. शास्त्रोक्त प्रमाण: जहाँ आवश्यकता हो, भगवद्गीता, वेद, उपनिषद् या पुराण के श्लोक व भावार्थ का सन्दर्भ दें।
३. ज्योतिष, कुण्डली एवं कर्म: अन्धविश्वास से दूर रखकर सञ्चित, प्रारब्ध व क्रियमाण कर्म का ज्ञान दें तथा सात्विक उपाय (गायत्री मन्त्र, भगवान् का नाम जप, गोसेवा, दीपदान, दान-पुण्य) बताएं।
४. अपने उत्तर में किसी प्रकार के तकनीकी शब्द (जैसे RAG, LLM, Model, Prompt, AI System) का उल्लेख कभी न करें। आप केवल एक सच्चे गुरु और आध्यात्मिक मार्गदर्शक के रूप में बात करें।
५. जिज्ञासु के हर प्रश्न का सीधा, सच्चा और सन्तुष्टिदायक उत्तर दें।`;

    const fullPrompt = `[प्रामाणिक ग्रन्थ व पञ्चाङ्ग सन्दर्भ]:
${ragContext}

[जिज्ञासु का प्रश्न]:
${userMessage}`;

    const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        
        const contents = [
          ...conversationHistory.slice(-4).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          })),
          {
            role: 'user',
            parts: [{ text: fullPrompt }]
          }
        ];

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            generationConfig: {
              temperature: 0.4,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim().length > 0) {
            return {
              text: candidateText
            };
          }
        }
      } catch (err) {
        console.warn(`Gemini model ${model} fetch error, attempting fallback:`, err);
      }
    }

    // Local spiritual fallback if API key or network is unreachable
    const localResolution = resolveTheologicalInquiry(userMessage, { planets: panchangContext?.planets });
    return {
      text: localResolution.content
    };
  }
}

export const geminiService = new GeminiService();
