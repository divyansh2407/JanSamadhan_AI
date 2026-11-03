/**
 * JanSamadhan – Registered Problem Zod Schemas
 */

const { z } = require('zod');

const createProblemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(150, 'Title cannot exceed 150 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  categoryId: z.string().uuid('Valid category UUID is required'),
  address: z
    .string()
    .trim()
    .min(3, 'Address is required')
    .max(255, 'Address cannot exceed 255 characters'),
  city: z
    .string()
    .trim()
    .min(2, 'City is required')
    .max(100, 'City cannot exceed 100 characters'),
  state: z
    .string()
    .trim()
    .min(2, 'State is required')
    .max(100, 'State cannot exceed 100 characters')
    .default('Maharashtra'),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Pincode must be a 6-digit Indian postal code')
    .default('411001'),
  wardId: z.string().uuid().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  imageUrl: z.string().url('Invalid image URL format').optional().nullable(),
});

const updateProblemSchema = z.object({
  title: z.string().trim().min(5).max(150).optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']).optional(),
  assignedDepartmentId: z.string().uuid().optional().nullable(),
  wardId: z.string().uuid().optional().nullable(),
});

module.exports = {
  createProblemSchema,
  updateProblemSchema,
};
