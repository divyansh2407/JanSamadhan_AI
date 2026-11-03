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
      .regex(
        /^[6-9]\d{9}$/,
        'Phone must be a valid 10-digit Indian mobile number starting with 6-9'
      ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(64, 'Password cannot exceed 64 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
    termsAccepted: z.literal(true, {
      errorMap: () => ({
        message: 'You must accept the Terms and Conditions to register',
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
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
  rememberMe: z.boolean().optional().default(false),
});

module.exports = {
  registerSchema,
  loginSchema,
};

