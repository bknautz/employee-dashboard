const { z } = require("zod");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course id");

const enrollSchema = z.object({
  course: objectId,
});

const progressSchema = z.object({
  progressPercent: z.number().min(0).max(100),
});

module.exports = { enrollSchema, progressSchema };
