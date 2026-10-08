// Format errors securely, hiding stack traces from client
const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err);

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request payload',
      details: err.errors
    });
  }

  // AI Service errors
  if (err.message === 'RATE_LIMIT_EXCEEDED') {
    return res.status(429).json({ error: 'RATE_LIMIT', message: 'AI Quota Exceeded. Please wait a minute and try again.' });
  }
  if (err.message === 'TIMEOUT') {
    return res.status(504).json({ error: 'TIMEOUT', message: 'The AI service took too long to respond. Please try again.' });
  }
  if (err.message === 'AI_SERVICE_UNCONFIGURED') {
    return res.status(503).json({ error: 'SERVICE_UNAVAILABLE', message: 'AI Service is not configured properly.' });
  }

  // General server error
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred. Please try again later.'
  });
};

module.exports = { errorHandler };
