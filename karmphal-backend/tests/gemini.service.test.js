const { callGemini, fetchWithTimeout } = require('../services/gemini.service');

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

  it('throws SAFETY_BLOCK when model returns safety finishReason', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ finishReason: 'SAFETY', content: { parts: [{ text: '' }] } }]
      })
    });

    await expect(
      callGemini([{ role: 'user', parts: [{ text: 'सुरक्षा' }] }], 'System prompt', {})
    ).rejects.toThrow('SAFETY_BLOCK');
  });

  it('throws SAFETY_BLOCK when promptFeedback indicates blocked prompt', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        promptFeedback: { blockReason: 'SAFETY' },
        candidates: []
      })
    });

    await expect(
      callGemini([{ role: 'user', parts: [{ text: 'असुरक्षित' }] }], 'System prompt', {})
    ).rejects.toThrow('SAFETY_BLOCK');
  });

  it('throws TIMEOUT when fetch is aborted due to network timeout', async () => {
    const abortErr = new Error('The operation was aborted');
    abortErr.name = 'AbortError';
    vi.spyOn(global, 'fetch').mockRejectedValue(abortErr);

    await expect(
      callGemini([{ role: 'user', parts: [{ text: 'विलम्ब' }] }], 'System prompt', {})
    ).rejects.toThrow('TIMEOUT');
  });

  it('throws INVALID_AI_REQUEST when model returns 400 bad request', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 400
    });

    await expect(
      callGemini([{ role: 'user', parts: [{ text: 'त्रुटि' }] }], 'System prompt', {})
    ).rejects.toThrow('INVALID_AI_REQUEST');
  });

  it('throws PROVIDER_ERROR when all models return 500 error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500
    });

    await expect(
      callGemini([{ role: 'user', parts: [{ text: 'सर्वर' }] }], 'System prompt', {})
    ).rejects.toThrow('PROVIDER_ERROR');
  });

  it('throws EMPTY_RESPONSE when model returns 200 with empty candidate text', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '   ' }] } }]
      })
    });

    await expect(
      callGemini([{ role: 'user', parts: [{ text: 'रिक्त' }] }], 'System prompt', {})
    ).rejects.toThrow('EMPTY_RESPONSE');
  });

  it('fetchWithTimeout aborts request signal when timeout duration elapses', async () => {
    vi.useFakeTimers();
    try {
      let aborted = false;
      vi.spyOn(global, 'fetch').mockImplementation((_url, opts) => {
        return new Promise((resolve, reject) => {
          opts.signal.addEventListener('abort', () => {
            aborted = true;
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
      });

      const fetchPromise = fetchWithTimeout('https://example.com/api', { timeout: 100 });
      vi.advanceTimersByTime(150);

      await expect(fetchPromise).rejects.toThrow('The operation was aborted');
      expect(aborted).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
