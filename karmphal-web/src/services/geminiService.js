import { SCRIPTURES_CATALOG } from './scripturesData';
import { NARAKAS_28 } from './narakasData';
import { DREAM_MOTIFS } from './swapnaData';
import { VASTU_ZONES_16 } from './vastuEngine';
import { computePanchang } from './ephemerisEngine';
import { resolveTheologicalInquiry } from './theologicalAIEngine';
import { storageService } from './storageService';

class GeminiService {
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
      const dreamText = `[अग्नि पुराण स्वप्न शास्त्र एवं ४ प्रहर काल विचार]:\n${DREAM_MOTIFS.slice(0, 5).map(m => `- ${m.motif}: ${m.interpretation} (उपाय: ${m.remedy})`).join('\n')}`;
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
      const ragContext = this.buildRAGContext(userMessage, panchangContext);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...storageService.getAuthHeaders()
        },
        body: JSON.stringify({
          userMessage,
          conversationHistory,
          ragContext
        })
      });

      if (!response.ok) {
        throw new Error('Backend AI request failed');
      }

      const data = await response.json();
      return { text: data.text };

    } catch (err) {
      console.error('Backend AI API failed, falling back to local engine:', err, err.message);
      // Fallback
      const localResolution = resolveTheologicalInquiry(userMessage, { planets: panchangContext?.planets });
      return { text: localResolution.content };
    }
  }

  async generateKundaliReading(birthDetails, planetsData = [], dashaTimeline = []) {
    try {
      const response = await fetch('/api/ai/kundali', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...storageService.getAuthHeaders()
        },
        body: JSON.stringify({ birthDetails, planetsData, dashaTimeline })
      });
      const data = await response.json();
      if (!response.ok) {
        return data.message || 'Error from AI server.';
      }
      return data.text;
    } catch (err) {
      console.error('Kundali generation failed', err);
      return 'सर्वर व्यस्त है या API लिमिट खत्म हो गई है। कृपया 1 मिनट बाद पुनः प्रयास करें। (Server Busy / Rate Limit)';
    }
  }

  async generateVivahMilanReading(groomData, brideData, ashtakootScore) {
    try {
      const response = await fetch('/api/ai/vivah-milan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...storageService.getAuthHeaders()
        },
        body: JSON.stringify({ groomData, brideData, ashtakootScore })
      });
      const data = await response.json();
      if (!response.ok) {
        return data.message || 'Error from AI server.';
      }
      return data.text;
    } catch (err) {
      console.error('Vivah Milan generation failed', err);
      return 'सर्वर व्यस्त है या API लिमिट खत्म हो गई है। कृपया 1 मिनट बाद पुनः प्रयास करें। (Server Busy / Rate Limit)';
    }
  }
}

export const geminiService = new GeminiService();

