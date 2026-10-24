const { z } = require('zod');

const chatSchema = z.object({
  userMessage: z.string().trim().min(1, 'प्रश्न रिक्त नहीं हो सकता।').max(1000, 'प्रश्न 1000 अक्षरों से अधिक नहीं हो सकता।'),
  conversationHistory: z.array(z.object({
    sender: z.enum(['user', 'model', 'acharya']).transform(val => (val === 'acharya' ? 'model' : val)),
    text: z.string().max(1000, 'संदेश 1000 अक्षरों से अधिक नहीं हो सकता।')
  })).max(10, 'चैट इतिहास में अधिकतम 10 संदेश समर्थित हैं।').optional(),
  ragContext: z.string().max(5000, 'शास्त्र संदर्भ सीमा 5000 अक्षर है।').optional()
});

const kundaliSchema = z.object({
  birthDetails: z.object({
    name: z.string().trim().min(1, 'नाम आवश्यक है।').max(100, 'नाम 100 अक्षरों से अधिक नहीं हो सकता।'),
    dob: z.string().max(50),
    time: z.string().max(50),
    place: z.string().trim().max(150, 'स्थान 150 अक्षरों से अधिक नहीं हो सकता।'),
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
    name: z.string().trim().min(1, 'वर का नाम आवश्यक है।').max(100, 'वर का नाम 100 अक्षरों से अधिक नहीं हो सकता।'),
    nakshatraName: z.string().max(50).optional(),
    pada: z.number().int().min(1).max(4).optional(),
    rashiName: z.string().max(50).optional(),
    marsHouse: z.number().int().min(0).max(12).optional()
  }),
  brideData: z.object({
    name: z.string().trim().min(1, 'कन्या का नाम आवश्यक है।').max(100, 'कन्या का नाम 100 अक्षरों से अधिक नहीं हो सकता।'),
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
  mimeType: z.string().optional().default('image/jpeg')
});

const extractedKundaliOutputSchema = z.object({
  name: z.string().optional().default(''),
  dob: z.string().optional().default(''),
  tob: z.string().optional().default(''),
  place: z.string().optional().default(''),
  notes: z.string().optional().default('')
});

module.exports = {
  chatSchema,
  kundaliSchema,
  vivahMilanSchema,
  extractKundaliRequestSchema,
  extractedKundaliOutputSchema
};
