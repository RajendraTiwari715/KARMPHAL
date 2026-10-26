const { callGemini } = require('../services/gemini.service');

describe('Gemini Service Unit Tests (Mocked Fetch - Zero Live Calls)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('successfully returns text on valid 200 response from primary model', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'सत्यमेव जयते' }] } }]
      })
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

    const result = await callGemini([{ role: 'user', parts: [{ text: 'नमस्ते' }] }], 'System prompt', {});
    expect(result.text).toBe('सत्यमेव जयते');
  });

  it('falls back to secondary model when first model returns 429', async () => {
    let callCount = 0;
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return { ok: false, status: 429 };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'द्वितीयेन मॉडलेन उत्तरम्' }] } }]
        })
      };
    });

    const result = await callGemini([{ role: 'user', parts: [{ text: 'परीक्षण' }] }], 'System prompt', {});
    expect(result.text).toBe('द्वितीयेन मॉडलेन उत्तरम्');
    expect(callCount).toBe(2);
  });

  it('throws RATE_LIMIT_EXCEEDED when all models return 429', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 429 });

    await expect(
      callGemini([{ role: 'user', parts: [{ text: 'परीक्षण' }] }], 'System prompt', {})
    ).rejects.toThrow('RATE_LIMIT_EXCEEDED');
  });

  it('throws when GEMINI_API_KEY is missing or placeholder', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    try {
      process.env.GEMINI_API_KEY = 'your_gemini_api_key_here';
      await expect(
        callGemini([{ role: 'user', parts: [{ text: 'परीक्षण' }] }], 'System prompt', {})
      ).rejects.toThrow('AI_SERVICE_UNCONFIGURED');
    } finally {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });
});
