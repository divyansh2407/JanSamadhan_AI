/**
 * JanSamadhan – User Profile Zod Schemas
 */

const { z } = require('zod');

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Valid 10-digit phone number is required')
    .optional(),
});

module.exports = {
  updateProfileSchema,
};

