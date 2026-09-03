const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid manager id');

const teamSchema = z.object({
  name: z.string(),
  manager: objectId,
});

module.exports = { teamSchema };
