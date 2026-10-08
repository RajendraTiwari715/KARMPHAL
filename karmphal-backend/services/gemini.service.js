const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
const TIMEOUT_MS = 30000; // 30 seconds

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);
  
  return response;
}

/**
 * Calls Gemini API with fallback models, timeout, and safe error handling.
 */
async function callGemini(contents, systemInstruction, generationConfig) {
  if (!GEMINI_API_KEY) {
    throw new Error('AI_SERVICE_UNCONFIGURED');
  }

  let lastError = null;
  let isRateLimited = false;

  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig
        }),
        timeout: TIMEOUT_MS
      });

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && candidateText.trim().length > 0) {
          return { text: candidateText };
        }
      } else {
        const errorText = await response.text();
        console.warn(`[GeminiService] Model ${model} returned HTTP ${response.status}:`, errorText);
        
        if (response.status === 429) {
           isRateLimited = true;
           // If rate limited, don't fallback to same provider immediately, but here we try fallback model
        } else if (response.status >= 500) {
           // Provider error, try next model
           lastError = new Error('PROVIDER_ERROR');
        } else {
           // Client error (400, etc) usually means bad prompt, don't retry
           throw new Error('PROVIDER_CLIENT_ERROR');
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn(`[GeminiService] Model ${model} timed out`);
        lastError = new Error('TIMEOUT');
      } else {
        console.warn(`[GeminiService] Model ${model} network error:`, err.message);
        lastError = err;
      }
    }
  }

  if (isRateLimited) {
     throw new Error('RATE_LIMIT_EXCEEDED');
  }
  
  throw lastError || new Error('ALL_MODELS_FAILED');
}

module.exports = { callGemini };
