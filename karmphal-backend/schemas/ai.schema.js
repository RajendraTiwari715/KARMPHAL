const { z } = require('zod');

/**
 * Strips dangerous non-printable ASCII control characters.
 * Preserves standard whitespace (\n, \r, \t) and all multibyte Unicode/Devanagari characters.
 */
function stripControlChars(str) {
  if (typeof str !== 'string') return str;
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

const chatSchema = z.object({
  userMessage: z.string()
    .trim()
    .min(1, 'प्रश्न रिक्त नहीं हो सकता।')
    .max(1000, 'प्रश्न 1000 अक्षरों से अधिक नहीं हो सकता।')
    .transform(stripControlChars),
  conversationHistory: z.array(z.object({
    sender: z.enum(['user', 'model', 'acharya'], {
      errorMap: () => ({ message: 'अमान्य प्रेषक (Invalid role). केवल user, model या acharya समर्थित है; system रोल अस्वीकार्य है।' })
    }).transform(val => (val === 'acharya' ? 'model' : val)),
    text: z.string().max(1000, 'संदेश 1000 अक्षरों से अधिक नहीं हो सकता।').transform(stripControlChars)
  })).max(10, 'चैट इतिहास में अधिकतम 10 संदेश समर्थित हैं।').optional().default([]),
  ragContext: z.string().max(5000, 'शास्त्र संदर्भ सीमा 5000 अक्षर है।').transform(stripControlChars).optional()
});

const kundaliSchema = z.object({
  birthDetails: z.object({
    name: z.string().trim().min(1, 'नाम आवश्यक है।').max(100, 'नाम 100 अक्षरों से अधिक नहीं हो सकता।').transform(stripControlChars),
    dob: z.string().max(50).transform(stripControlChars),
    time: z.string().max(50).transform(stripControlChars),
    place: z.string().trim().max(150, 'स्थान 150 अक्षरों से अधिक नहीं हो सकता।').transform(stripControlChars),
    isTimeApproximate: z.boolean().optional()
  }),
  planetsData: z.array(z.object({
    name: z.string().max(50),
    sanskrit: z.string().max(50).optional(),
    house: z.number().int().min(1).max(12),
    signSanskrit: z.string().max(50),
    degreeInSign: z.union([z.string(), z.number()]).transform(val => String(val)),
    isRetro: z.boolean()
  })).max(15),
  dashaTimeline: z.any().optional()
});

const vivahMilanSchema = z.object({
  groomData: z.object({
    name: z.string().trim().min(1, 'वर का नाम आवश्यक है।').max(100, 'वर का नाम 100 अक्षरों से अधिक नहीं हो सकता।').transform(stripControlChars),
    nakshatraName: z.string().max(50).optional(),
    pada: z.number().int().min(1).max(4).optional(),
    rashiName: z.string().max(50).optional(),
    marsHouse: z.number().int().min(0).max(12).optional()
  }),
  brideData: z.object({
    name: z.string().trim().min(1, 'कन्या का नाम आवश्यक है।').max(100, 'कन्या का नाम 100 अक्षरों से अधिक नहीं हो सकता।').transform(stripControlChars),
    nakshatraName: z.string().max(50).optional(),
    pada: z.number().int().min(1).max(4).optional(),
    rashiName: z.string().max(50).optional(),
    marsHouse: z.number().int().min(0).max(12).optional()
  }),
  ashtakootScore: z.object({
    totalScore: z.number().min(0).max(36)
  }).optional()
});

const extractKundaliRequestSchema = z.object({
  imageBase64: z.string().min(20, 'Image data is required'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    errorMap: () => ({ message: 'केवल JPEG, PNG या WebP प्रारूप समर्थित हैं।' })
  }).default('image/jpeg')
});

const extractedKundaliOutputSchema = z.object({
  name: z.string().max(100).optional().default(''),
  dob: z.string().max(50).optional().default(''),
  tob: z.string().max(50).optional().default(''),
  place: z.string().max(150).optional().default(''),
  notes: z.string().max(300).optional().default('')
});

module.exports = {
  stripControlChars,
  chatSchema,
  kundaliSchema,
  vivahMilanSchema,
  extractKundaliRequestSchema,
  extractedKundaliOutputSchema
};
