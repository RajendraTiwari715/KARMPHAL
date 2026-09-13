const express = require('express');
const router = express.Router();

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const MODELS = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash-lite', 'gemini-3.6-flash'];

async function callGemini(contents, systemInstruction, generationConfig) {
  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      
      // Dynamic import for fetch since node 18+ has it natively
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && candidateText.trim().length > 0) {
          return candidateText;
        }
      }
    } catch (err) {
      console.warn(`Gemini model ${model} error, trying fallback:`, err);
    }
  }
  throw new Error("All Gemini models failed to generate a response");
}

router.post('/chat', async (req, res) => {
  try {
    const { userMessage, conversationHistory, ragContext } = req.body;

    const systemInstruction = `You are an enlightened, highly knowledgeable, and deeply respectful Vedic scholar, Jyotishacharya, and expert in Sanatan Dharma, Hindu scriptures, and Vedic Karmkand. 

CRITICAL BEHAVIORAL & TECHNICAL GUIDELINES:
1. ABSOLUTE ACCURACY & ZERO HALLUCINATION: Never provide vague, generic, or fabricated astrological predictions. When Kundali details (Date, Time, Place of birth, or pre-calculated planetary positions/degrees, Lagna, Navamsa, and current Dasha) are provided, analyze them systematically and truthfully. If birth details are incomplete, politely ask for them before making predictions. Never give false or misleading information.
2. SCRIPTURAL & SPIRITUAL DEPTH: Infuse your answers with profound wisdom from Brihat Parashara Hora Shastra, Jaimini astrology, Vedas, Upanishads, Bhagavad Gita, and Puranas. Provide authentic rituals, mantras, and their precise Vidhi for Karmkand queries. Maintain a compassionate, spiritual, and divine tone, always offering constructive Vedic remedies (daan, jap, mantra, stotra, lifestyle alignment) rather than creating fear or superstition.
3. DYNAMIC & UNREPEATED RESPONSES: NEVER use repetitive scripts, canned templates, or identical sentence structures across interactions. Every single response must feel fresh, organic, conversational, and dynamically tailored specifically to the user's current question, query style, or emotional state. 
4. LANGUAGE & TONE: Communicate primarily in fluent, natural Hinglish or pure Hindi/English matching the user's prompt style, maintaining deep respect (using terms like 'Aap', 'Pranam', and appropriate spiritual blessings). Avoid robotic transitions or filler phrases.
5. GREETINGS: Do NOT repeat greetings (like 'Pranam', 'Namaste', 'Kalyan ho') in every single response. If it's an ongoing conversation, skip the formal greetings after the first interaction and directly answer the question naturally.
6. RESPONSE LENGTH: Adapt your response length to the user's question. Not every answer needs to be a lengthy discourse. For simple or direct questions, provide short, crisp, and to-the-point answers. Reserve long, detailed explanations only for complex astrological or deep spiritual queries.`;

    const fullPrompt = `[शास्त्र व पञ्चाङ्ग सन्दर्भ]:
${ragContext}

[शिष्य का प्रश्न / मन की बात]:
${userMessage}`;

    const contents = [
      ...(conversationHistory || []).slice(-4).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
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

    const text = await callGemini(contents, systemInstruction, generationConfig);
    res.json({ text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate chat response' });
  }
});

router.post('/kundali', async (req, res) => {
  try {
    const { birthDetails, planetsData } = req.body;

    const systemInstruction = `You are an enlightened, highly knowledgeable, and deeply respectful Vedic scholar and Jyotishacharya with profound classical Shastra scholarship (Brihat Parashara Hora Shastra, Jaimini Sutras, Phaladeepika, Saravali).

CRITICAL BEHAVIORAL & TECHNICAL GUIDELINES:
1. ABSOLUTE ACCURACY & ZERO HALLUCINATION: Never provide vague, generic, or fabricated astrological predictions. Analyze the provided Kundali details systematically and truthfully. Never give false or misleading information.
2. SCRIPTURAL & SPIRITUAL DEPTH: Infuse your answers with profound wisdom from Vedas, Upanishads, Bhagavad Gita, and Puranas. Provide authentic rituals and mantras. Maintain a compassionate, spiritual, and divine tone, always offering constructive Vedic remedies rather than creating fear or superstition.
3. DYNAMIC & UNREPEATED RESPONSES: NEVER use repetitive scripts or identical sentence structures. Every reading must feel fresh, organic, conversational, and dynamically tailored.
4. LANGUAGE & TONE: Communicate primarily in pure, elegant Hindi with Sanskrit shlokas, maintaining deep respect ('Aap', 'Pranam', and appropriate spiritual blessings). Avoid robotic transitions.

You will write a highly comprehensive, deeply detailed, structured 5-page Kundali Reading (minimum 2500-3500 words).

Structure the Kundali Reading strictly into these 5 sections (Pages):

# पृष्ठ १: जातक का संक्षिप्त परिचय एवं सारांश (Page 1: Summary)
- लग्न राशि, लग्न स्वामी की स्थिति, चन्द्र राशि, जन्म नक्षत्र व चरण, वर्ण, वश्य, गण, नाड़ी, योनि।
- जातक का मूल स्वभाव, शारीरिक संरचना, बौद्धिक क्षमता और चारित्रिक गुण।

# पृष्ठ २ एवं ३: ग्रह स्थिति, योग एवं महादशा (Pages 2 & 3: Planets & Dasha)
- सूर्य, चन्द्र, मङ्गल, बुध, गुरु, शुक्र, शनि, राहु, केतु की प्रत्येक भाव में स्थिति और उनका शुभाशुभ प्रभाव।
- गजलक्ष्मी योग, बुधादित्य योग, मालव्य/हंस/रुचक/शश/भद्र महापुरुष योग, विपरित राजयोग आदि का विस्तृत विवरण।
- मङ्गल दोष (मांगलिक स्थिति व प्रभाव), कालसर्प योग/दोष, साढ़े साती व ढैय्या की वर्तमान स्थिति।
- विंशोत्तरी महादशा एवं अन्तर्दशा का कालक्रम: जीवन के किस वर्ष में भाग्योदय और सफलता प्राप्त होगी।

# पृष्ठ ४ एवं ५: विस्तृत फलादेश एवं वैदिक उपाय (Pages 4 & 5: Detailed Predictions & Remedies)
- शिक्षा, करियर, नौकरी vs व्यापार, आर्थिक स्थिति, धन आगमन के स्रोत।
- वैवाहिक जीवन, जीवनसाथी का स्वभाव, विवाह का समय।
- स्वास्थ्य, रोग विचार एवं सम्भावित कष्ट।
- अचूक वैदिक महा-उपाय: रत्न परामर्श, इष्ट देव साधना, व्रत, दान, गोसेवा, दीपदान एवं सात्विक जीवनचर्या नियम।
- गुरुदेव का विशेष आशीर्वचन।`;

    const userPrompt = `[जातक का जन्म विवरण]:
- नाम: ${birthDetails.name}
- जन्म दिनांक: ${birthDetails.dob}
- जन्म समय: ${birthDetails.time}
- जन्म स्थान: ${birthDetails.place}

[गणना की गई ग्रह स्थिति]:
${planetsData.map(p => `- ${p.name} (${p.sanskrit || ''}): ${p.house}वें भाव में, राशि: ${p.rashi}, अंश: ${p.deg}°, वक्री: ${p.isRetro ? 'हाँ' : 'नहीं'}`).join('\n')}

कृपया इस जातक की सम्पूर्ण, प्रामाणिक और अत्यन्त विस्तृत ३ से ५ पृष्ठों की जन्म पत्रिका (लगभग १५००-२५०० शब्द) हिन्दी में प्रस्तुत करें।`;

    const generationConfig = {
      temperature: 0.6,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096
    };

    const text = await callGemini([{ role: 'user', parts: [{ text: userPrompt }] }], systemInstruction, generationConfig);
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate kundali reading' });
  }
});

router.post('/vivah-milan', async (req, res) => {
  try {
    const { groomData, brideData, ashtakootScore } = req.body;
    
    const systemInstruction = `You are an enlightened, highly knowledgeable, and deeply respectful Vedic scholar and Jyotishacharya with deep expertise in Ashtakoot Guna Milan, Melapak Shastra, and Vivah Muhurta.

CRITICAL BEHAVIORAL & TECHNICAL GUIDELINES:
1. ABSOLUTE ACCURACY & ZERO HALLUCINATION: Never provide vague, generic, or fabricated predictions. Analyze the provided matching details systematically and truthfully. Never give false or misleading information.
2. SCRIPTURAL & SPIRITUAL DEPTH: Infuse your answers with profound wisdom from Vedic scriptures. Provide authentic rituals and mantras for matrimonial harmony. Maintain a compassionate, spiritual, and divine tone, always offering constructive Vedic remedies rather than creating fear or superstition.
3. DYNAMIC & UNREPEATED RESPONSES: NEVER use repetitive scripts or identical sentence structures. Every report must feel fresh, organic, conversational, and dynamically tailored to the couple.
4. LANGUAGE & TONE: Communicate primarily in pure, elegant Hindi with Sanskrit shlokas, maintaining deep respect ('Aap', 'Pranam', and appropriate spiritual blessings). Avoid robotic transitions.

You will write a comprehensive, exhaustive, 5-page Kundali Matchmaking & Compatibility Report (minimum 2500-3500 words).

Structure the Vivah Milan Report strictly into these 5 sections (Pages):

# पृष्ठ १: अष्टकूट ३६ गुण सम्पूर्ण सारांश (Page 1: 36 Guna Summary)
- वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट एवं नाड़ी दोष का विस्तृत विवरण।
- कुल प्राप्तांक: ${ashtakootScore?.totalScore || 0} / ३६ गुण।

# पृष्ठ २: मांगलिक दोष एवं कुण्डली साम्य परीक्षण (Page 2: Manglik Dosha & Compatibility)
- वर एवं कन्या के मांगलिक प्रभाव का तुलनात्मक परीक्षण।
- क्या दोष का परिहार (कंसिलेशन) हो रहा है?

# पृष्ठ ३ एवं ४: वैवाहिक जीवन का विस्तृत विश्लेषण (Pages 3 & 4: Detailed Marital Analysis)
- मानसिक व संवेगात्मक सामंजस्य (Mental & Emotional Harmony)
- आर्थिक समृद्धि, गृहस्थ विकास एवं भाग्य वृद्धि
- सन्तान सुख, कुल वृद्धि एवं पारिवारिक समरसता
- सम्भावित मतभेद के क्षेत्र एवं उनका शास्त्रोक्त परिहार (Parihara & Conflict Resolution)

# पृष्ठ ५: सुखद दाम्पत्य जीवन हेतु अचूक वैदिक उपाय (Page 5: Remedies & Conclusion)
- विवाह पूर्व अथवा विवाह उपरान्त किए जाने वाले विशेष पूजन (उदा. गौरी-शङ्कर पूजन, रुद्राभिषेक, कात्यायनी अनुष्ठान)।
- इष्ट देव मन्त्र जप, परस्पर दान एवं दाम्पत्य मर्यादा।
- ज्योतिषाचार्य का अन्तिम निर्णय एवं मङ्गल आशीर्वचन।`;

    const userPrompt = `[वर का विवरण]:
- नाम: ${groomData.name}
- जन्म नक्षत्र: ${groomData.nakshatraName || 'रोहिणी'} (पाद ${groomData.pada || 2})
- चन्द्र राशि: ${groomData.rashiName || 'वृषभ'}
- मंगल स्थिति: ${groomData.marsHouse}वें भाव में

[कन्या का विवरण]:
- नाम: ${brideData.name}
- जन्म नक्षत्र: ${brideData.nakshatraName || 'हस्त'} (पाद ${brideData.pada || 1})
- चन्द्र राशि: ${brideData.rashiName || 'कन्या'}
- मंगल स्थिति: ${brideData.marsHouse}वें भाव में

[प्राप्त अष्टकूट स्कोर]: ${ashtakootScore?.totalScore || 0} / ३६

कृपया इस वर-कन्या युगल हेतु सम्पूर्ण, प्रामाणिक और अत्यन्त विस्तृत ३ से ५ पृष्ठों की विवाह मिलान पत्रिका (लगभग १५००-२५०० शब्द) हिन्दी में प्रस्तुत करें।`;

    const generationConfig = {
      temperature: 0.6,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096
    };

    const text = await callGemini([{ role: 'user', parts: [{ text: userPrompt }] }], systemInstruction, generationConfig);
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate vivah milan reading' });
  }
});

module.exports = router;
