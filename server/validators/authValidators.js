/**
 * JanSamadhan – Authentication Zod Schemas
 */

const { z } = require('zod');

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Invalid email address format'),
    phone: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine(
        (val) => !val || /^[6-9]\d{9}$/.test(val) || /^[0-9+() -]{7,20}$/.test(val),
        {
          message: 'Phone must be a valid mobile number',
        }
      ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(64, 'Password cannot exceed 64 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().optional(),
    role: z.string().optional(),
    accountType: z.string().optional(),
    city: z.string().optional(),
    departmentName: z.string().optional(),
    organizationName: z.string().optional(),
    designation: z.string().optional(),
    areaOfExpertise: z.string().optional(),
    industryType: z.string().optional(),
    termsAccepted: z.boolean().optional().default(true),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
  accountType: z.string().optional(),
  role: z.string().optional(),
  rememberMe: z.boolean().optional().default(false),
});

module.exports = {
  registerSchema,
  loginSchema,
};

