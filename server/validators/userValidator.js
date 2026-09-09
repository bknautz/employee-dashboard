const { z } = require("zod");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid team id");

const updateUserSchema = z.object({
  role: z.enum(["employee", "manager", "admin"]).optional(),
  team: objectId.nullable().optional(),
});

module.exports = { updateUserSchema };
