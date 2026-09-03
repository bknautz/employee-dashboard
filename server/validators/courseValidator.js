const { z } = require('zod');

const courseSchema = z.object({
  title: z.string(),
  provider: z.string(),
  description: z.string().optional(),
  hours: z.number().int(),
  expirationMonths: z.number().int().nullable().optional(),
});

module.exports = { courseSchema };