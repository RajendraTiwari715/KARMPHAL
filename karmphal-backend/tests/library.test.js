import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server';

describe('Library PDF Proxy Endpoint (/api/library/proxy)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects requests without url parameter with 400', async () => {
    const res = await request(app).get('/api/library/proxy');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_URL');
  });

  it('rejects SSRF attempts not pointing to archive.org/download/ with 403', async () => {
    const res = await request(app)
      .get('/api/library/proxy')
      .query({ url: 'http://169.254.169.254/latest/meta-data' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('FORBIDDEN_URL');
  });

  it('streams PDF when upstream returns 200 with appropriate CORS headers', async () => {
    const fakePdfBytes = Buffer.from('%PDF-1.4 test stream');
    const mockWebStream = new ReadableStream({
      start(controller) {
        controller.enqueue(fakePdfBytes);
        controller.close();
      }
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'content-type': 'application/pdf',
        'content-length': String(fakePdfBytes.length),
        'accept-ranges': 'bytes'
      }),
      body: mockWebStream
    });

    const res = await request(app)
      .get('/api/library/proxy')
      .query({ url: 'https://archive.org/download/test-item/test.pdf' });

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.body.toString()).toBe('%PDF-1.4 test stream');
  });

  it('handles 206 Partial Content for range requests', async () => {
    const fakeChunk = Buffer.from('chunk');
    const mockWebStream = new ReadableStream({
      start(controller) {
        controller.enqueue(fakeChunk);
        controller.close();
      }
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 206,
      headers: new Headers({
        'content-type': 'application/pdf',
        'content-range': 'bytes 0-4/100',
        'content-length': '5'
      }),
      body: mockWebStream
    });

    const res = await request(app)
      .get('/api/library/proxy')
      .set('Range', 'bytes=0-4')
      .query({ url: 'https://archive.org/download/test-item/test.pdf' });

    expect(res.status).toBe(206);
    expect(res.headers['content-range']).toBe('bytes 0-4/100');
  });
});
