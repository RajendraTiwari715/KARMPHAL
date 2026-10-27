const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');

describe('Trust Proxy Configuration & X-Forwarded-For Anti-Spoofing', () => {
  function resolveTrustProxy(val) {
    if (!val || val === 'false') return false;
    if (val === 'true') return true;
    if (/^\d+$/.test(val)) return parseInt(val, 10);
    if (val.includes(',')) return val.split(',').map(s => s.trim());
    return val;
  }

  it('correctly parses TRUST_PROXY types (false, integer hop count, list)', () => {
    expect(resolveTrustProxy(undefined)).toBe(false);
    expect(resolveTrustProxy('')).toBe(false);
    expect(resolveTrustProxy('false')).toBe(false);
    expect(resolveTrustProxy('true')).toBe(true);
    expect(resolveTrustProxy('1')).toBe(1);
    expect(resolveTrustProxy('2')).toBe(2);
    expect(resolveTrustProxy('loopback, 10.0.0.0/8')).toEqual(['loopback', '10.0.0.0/8']);
  });

  it('proves spoofed X-Forwarded-For headers cannot bypass per-IP guest rate limit when TRUST_PROXY is false (direct topology)', async () => {
    const app = express();
    app.set('trust proxy', resolveTrustProxy('false'));

    const guestLimiter = rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      validate: { xForwardedForHeader: false },
      message: { error: 'GUEST_RATE_LIMIT' }
    });

    app.post('/api/auth/guest', guestLimiter, (req, res) => {
      res.status(201).json({ ip: req.ip, success: true });
    });

    // Send 5 requests from same connection with different spoofed X-Forwarded-For headers
    for (let i = 1; i <= 5; i++) {
      const res = await request(app)
        .post('/api/auth/guest')
        .set('X-Forwarded-For', `203.0.113.${i}`)
        .expect(201);
      
      // Because trust proxy is false, req.ip is the socket remoteAddress (::ffff:127.0.0.1 or 127.0.0.1)
      expect(res.body.ip).not.toBe(`203.0.113.${i}`);
    }

    // The 6th request with yet another spoofed IP must be BLOCKED with 429
    const blockedRes = await request(app)
      .post('/api/auth/guest')
      .set('X-Forwarded-For', '198.51.100.99')
      .expect(429);

    expect(blockedRes.body.error).toBe('GUEST_RATE_LIMIT');
  });

  it('proves TRUST_PROXY=1 correctly trusts only 1 hop and prevents client spoofing in reverse proxy topology', async () => {
    const app = express();
    app.set('trust proxy', resolveTrustProxy('1'));

    const guestLimiter = rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'GUEST_RATE_LIMIT' }
    });

    app.post('/api/auth/guest', guestLimiter, (req, res) => {
      res.status(201).json({ ip: req.ip, success: true });
    });

    // In a 1-proxy topology, client connects to proxy, proxy appends real client IP:
    // Malicious client tries to prepend random spoofed IPs: "spoofed.ip, real.client.ip"
    // Express with trust proxy: 1 inspects only the 1 hop from the right ("real.client.ip")
    const realClientIp = '198.51.100.50';
    for (let i = 1; i <= 5; i++) {
      const res = await request(app)
        .post('/api/auth/guest')
        .set('X-Forwarded-For', `fake.${i}.${i}.${i}, ${realClientIp}`)
        .expect(201);

      expect(res.body.ip).toBe(realClientIp);
    }

    // 6th request from same real client (even with different spoofed prefix) is rate-limited
    const blockedRes = await request(app)
      .post('/api/auth/guest')
      .set('X-Forwarded-For', `another.fake.ip, ${realClientIp}`)
      .expect(429);

    expect(blockedRes.body.error).toBe('GUEST_RATE_LIMIT');
  });
});
