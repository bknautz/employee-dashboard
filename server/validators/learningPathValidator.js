const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid course id');

const learningPathSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  courses: z.array(objectId).optional(),
});

module.exports = { learningPathSchema };
