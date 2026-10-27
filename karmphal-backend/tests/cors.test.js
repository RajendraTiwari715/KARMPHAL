const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { isOriginAllowed } = require('../server');
const { errorHandler } = require('../middlewares/errorHandler');

describe('Production CORS Policy Verification for Native Android & Web', () => {
  let prodApp;
  const prodOrigins = ['https://example-frontend.com'];

  beforeAll(() => {
    prodApp = express();
    prodApp.use(cors({
      origin: (origin, callback) => {
        if (isOriginAllowed(origin, prodOrigins, 'production')) {
          callback(null, true);
        } else {
          callback(new Error('Blocked by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
    }));

    prodApp.get('/test-cors', (_req, res) => {
      res.status(200).json({ status: 'ok', message: 'CORS allowed' });
    });

    prodApp.use(errorHandler);
  });

  describe('Allowed Production Origins', () => {
    it('allows Origin: https://localhost (Capacitor Android with androidScheme=https)', async () => {
      const res = await request(prodApp)
        .get('/test-cors')
        .set('Origin', 'https://localhost')
        .expect(200);

      expect(res.headers['access-control-allow-origin']).toBe('https://localhost');
      expect(res.body.status).toBe('ok');
    });

    it('allows Origin: capacitor://localhost (Capacitor native Android/iOS default)', async () => {
      const res = await request(prodApp)
        .get('/test-cors')
        .set('Origin', 'capacitor://localhost')
        .expect(200);

      expect(res.headers['access-control-allow-origin']).toBe('capacitor://localhost');
      expect(res.body.status).toBe('ok');
    });

    it('allows Origin: https://example-frontend.com (configured in CORS_ORIGINS)', async () => {
      const res = await request(prodApp)
        .get('/test-cors')
        .set('Origin', 'https://example-frontend.com')
        .expect(200);

      expect(res.headers['access-control-allow-origin']).toBe('https://example-frontend.com');
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Strictly Rejected Production Origins', () => {
    it('rejects Origin: http://localhost:5173 (insecure dev origin forbidden in prod)', async () => {
      const res = await request(prodApp)
        .get('/test-cors')
        .set('Origin', 'http://localhost:5173')
        .expect(403);

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
      expect(res.body.error).toBe('CORS_ERROR');
    });

    it('rejects Origin: http://10.0.2.2:5000 (Android emulator local dev IP forbidden in prod)', async () => {
      const res = await request(prodApp)
        .get('/test-cors')
        .set('Origin', 'http://10.0.2.2:5000')
        .expect(403);

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
      expect(res.body.error).toBe('CORS_ERROR');
    });

    it('rejects Origin: http://evil.com (insecure third party attacker forbidden in prod)', async () => {
      const res = await request(prodApp)
        .get('/test-cors')
        .set('Origin', 'http://evil.com')
        .expect(403);

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
      expect(res.body.error).toBe('CORS_ERROR');
    });

    it('rejects Origin: "null" (opaque/sandboxed origin forbidden in prod)', async () => {
      const res = await request(prodApp)
        .get('/test-cors')
        .set('Origin', 'null')
        .expect(403);

      expect(res.headers['access-control-allow-origin']).toBeUndefined();
      expect(res.body.error).toBe('CORS_ERROR');
    });
  });
});
