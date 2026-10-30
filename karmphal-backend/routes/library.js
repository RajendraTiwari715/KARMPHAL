const express = require('express');
const router = express.Router();
const { Readable } = require('stream');

/**
 * GET /api/library/proxy
 * Streams PDF documents from archive.org with permissive CORS headers.
 * Protects against SSRF by strictly enforcing that the requested URL must start with
 * https://archive.org/download/
 */
router.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ error: 'INVALID_URL', message: 'URL parameter is required' });
  }

  // SSRF Protection: strictly allow only archive.org download URLs
  const allowedPrefix = 'https://archive.org/download/';
  if (!targetUrl.startsWith(allowedPrefix)) {
    return res.status(403).json({ error: 'FORBIDDEN_URL', message: 'Only archive.org/download URLs are permitted' });
  }

  try {
    const forwardHeaders = {};
    if (req.headers.range) {
      forwardHeaders.range = req.headers.range;
    }

    const upstreamRes = await fetch(targetUrl, {
      headers: forwardHeaders
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      return res.status(upstreamRes.status).json({
        error: 'UPSTREAM_ERROR',
        message: `Upstream returned status ${upstreamRes.status}`
      });
    }

    // Set CORS and streaming headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
    res.setHeader('Content-Type', upstreamRes.headers.get('content-type') || 'application/pdf');
    
    if (upstreamRes.headers.get('content-length')) {
      res.setHeader('Content-Length', upstreamRes.headers.get('content-length'));
    }
    if (upstreamRes.headers.get('accept-ranges')) {
      res.setHeader('Accept-Ranges', upstreamRes.headers.get('accept-ranges'));
    }
    if (upstreamRes.headers.get('content-range')) {
      res.setHeader('Content-Range', upstreamRes.headers.get('content-range'));
      res.status(206);
    }

    if (upstreamRes.body) {
      Readable.fromWeb(upstreamRes.body).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    if (!res.headersSent) {
      res.status(502).json({ error: 'FETCH_FAILED', message: err.message });
    }
  }
});

module.exports = router;
