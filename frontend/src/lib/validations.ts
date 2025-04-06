import * as z from 'zod'

const passwordSchema = z
  .string()
  .trim()
  .min(8, 'Password must be at least 8 characters long.')
  .max(32, 'Password must be no more than 32 characters long.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/\d/, 'Password must contain at least one number.')

const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address')
  .toLowerCase()

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema
})

export const signupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(3, 'Name must be at least 3 characters long.')
})

export const userFormSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters long.'),
  email: emailSchema,
  role: z.enum(['user', 'admin'])
})

export const addProductSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters long.'),
  category: z
    .string()
    .trim()
    .min(3, 'Category must be at least 3 characters long.'),
  price: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100000, {
      message: 'Price must be a positive number less than 100,000.'
    })
})
