const MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
const TIMEOUT_MS = 25000; // 25 seconds request timeout

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = TIMEOUT_MS } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Calls Gemini API with fallback models, timeout, and safe error handling.
 * Never leaks the API key, internal endpoints, or upstream raw errors.
 */
async function callGemini(contents, systemInstruction, generationConfig) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0 || apiKey.includes('your_gemini_api_key_here')) {
    console.error('[GeminiService] GEMINI_API_KEY is not configured in process.env');
    throw new Error('AI_SERVICE_UNCONFIGURED');
  }

  let lastError = null;
  let isRateLimited = false;

  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
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
        console.warn(`[GeminiService] Model ${model} returned HTTP status ${response.status}`);
        
        if (response.status === 429) {
          isRateLimited = true;
          // Continue to fallback model if available
        } else if (response.status >= 500) {
          lastError = new Error('PROVIDER_ERROR');
        } else {
          // Client request format issue
          throw new Error('INVALID_AI_REQUEST');
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn(`[GeminiService] Model ${model} request timed out`);
        lastError = new Error('TIMEOUT');
      } else if (err.message === 'INVALID_AI_REQUEST') {
        throw err;
      } else {
        console.warn(`[GeminiService] Model ${model} request failed: ${err.message}`);
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
