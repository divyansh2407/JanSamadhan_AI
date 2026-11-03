/**
 * JanSamadhan – Category Zod Schemas
 */

const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name is required').max(100),
  description: z.string().trim().max(500).optional(),
  icon: z.string().trim().max(50).optional(),
});

module.exports = {
  createCategorySchema,
};

