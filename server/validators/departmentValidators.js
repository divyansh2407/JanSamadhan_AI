/**
 * JanSamadhan – Department Zod Schemas
 */

const { z } = require('zod');

const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, 'Department name is required').max(100),
  departmentCode: z.string().trim().min(2).max(50).toUpperCase(),
  description: z.string().trim().max(500).optional(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100).default('Maharashtra'),
  contactEmail: z.string().trim().email('Invalid email address format'),
  contactPhone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Valid 10-digit phone number is required'),
  cityId: z.string().uuid().optional().nullable(),
});

const updateDepartmentSchema = createDepartmentSchema.partial();

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema,
};

