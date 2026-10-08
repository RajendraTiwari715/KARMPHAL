const { z } = require('zod');

const chatSchema = z.object({
  userMessage: z.string().min(1).max(2000),
  conversationHistory: z.array(z.object({
    sender: z.enum(['user', 'model']),
    text: z.string()
  })).max(20).optional(),
  ragContext: z.string().max(5000).optional()
});

const kundaliSchema = z.object({
  birthDetails: z.object({
    name: z.string().min(1).max(100),
    dob: z.string(),
    time: z.string(),
    place: z.string().max(200),
    isTimeApproximate: z.boolean().optional()
  }),
  planetsData: z.array(z.object({
    name: z.string(),
    sanskrit: z.string().optional(),
    house: z.number(),
    rashi: z.string(),
    deg: z.number(),
    isRetro: z.boolean()
  })).max(20)
});

const vivahMilanSchema = z.object({
  groomData: z.object({
    name: z.string().min(1).max(100),
    nakshatraName: z.string().optional(),
    pada: z.number().optional(),
    rashiName: z.string().optional(),
    marsHouse: z.number().optional()
  }),
  brideData: z.object({
    name: z.string().min(1).max(100),
    nakshatraName: z.string().optional(),
    pada: z.number().optional(),
    rashiName: z.string().optional(),
    marsHouse: z.number().optional()
  }),
  ashtakootScore: z.object({
    totalScore: z.number()
  }).optional()
});

module.exports = {
  chatSchema,
  kundaliSchema,
  vivahMilanSchema
};
