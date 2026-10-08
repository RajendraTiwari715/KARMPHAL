const { z } = require('zod');

const profileUpdateSchema = z.object({
  name: z.string().max(100).optional(),
  gotra: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  rank: z.string().max(50).optional()
});

const punyaSyncSchema = z.object({
  totalPunya: z.number().int().min(0),
  sadhanaStreak: z.number().int().min(0)
});

const chatHistorySchema = z.object({
  sender: z.enum(['user', 'model']),
  text: z.string().min(1).max(5000)
});

module.exports = {
  profileUpdateSchema,
  punyaSyncSchema,
  chatHistorySchema
};
