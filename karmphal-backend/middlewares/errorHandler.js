// Format errors securely, hiding stack traces from client
const errorHandler = (err, req, res, _next) => {
  // Safe internal logging (no sensitive tokens or headers)
  console.error(`[Error] [${req.method} ${req.url}] ${err.name || 'Error'}: ${err.message}`);

  // Zod validation errors
  if (err.name === 'ZodError') {
    const errorMessages = err.errors ? err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') : 'अमान्य अनुरोध डेटा।';
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: errorMessages
    });
  }

  // AI Service errors
  if (err.message === 'RATE_LIMIT_EXCEEDED') {
    return res.status(429).json({
      error: 'RATE_LIMIT',
      message: 'AI अनुरोध सीमा समाप्त हो गई है। कृपया 1 मिनट बाद पुनः प्रयास करें।'
    });
  }
  if (err.message === 'TIMEOUT') {
    return res.status(504).json({
      error: 'TIMEOUT',
      message: 'AI सेवा से उत्तर प्राप्त करने में समय समाप्त हो गया। कृपया पुनः प्रयास करें।'
    });
  }
  if (err.message === 'AI_SERVICE_UNCONFIGURED') {
    return res.status(503).json({
      error: 'SERVICE_UNAVAILABLE',
      message: 'AI सेवा वर्तमान में कॉन्फ़िगर नहीं है।'
    });
  }
  if (err.message === 'INVALID_AI_REQUEST') {
    return res.status(400).json({
      error: 'BAD_REQUEST',
      message: 'अमान्य AI अनुरोध प्रारूप।'
    });
  }
  if (err.message === 'PROVIDER_ERROR' || err.message === 'ALL_MODELS_FAILED') {
    return res.status(503).json({
      error: 'SERVICE_UNAVAILABLE',
      message: 'AI सेवा इस समय अत्यधिक व्यस्त है। कृपया कुछ क्षण बाद पुनः प्रयास करें।'
    });
  }

  // Payload size limit errors (413)
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      error: 'PAYLOAD_TOO_LARGE',
      message: 'अनुरोध या छवि का आकार बहुत बड़ा है (अधिकतम सीमा पार हो गई है)।'
    });
  }

  // Safe General server error - Never leak raw upstream stack traces or messages
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'एक अप्रत्याशित त्रुटि हुई। कृपया कुछ समय बाद पुनः प्रयास करें।'
  });
};

module.exports = { errorHandler };
