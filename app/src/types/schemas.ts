import { z } from 'zod'

// Validation schemas
export const expenseCategorySchema = z.enum(['food', 'transport', 'accommodation', 'entertainment', 'utilities', 'other'])

export const splitTypeSchema = z.enum(['equal', 'unequal', 'percentage', 'shares'])

export const createGroupSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters').max(50, 'Group name must be less than 50 characters'),
  description: z.string().optional(),
  currency: z.string().default('USD'),
})

export const createExpenseSchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters').max(100),
  amount: z.number().positive('Amount must be positive').max(999999.99),
  paid_by: z.string().uuid(),
  expense_date: z.string().or(z.date()),
  category: expenseCategorySchema,
  split_type: splitTypeSchema,
  notes: z.string().optional(),
  participants: z.array(z.string().uuid()).min(1, 'At least one participant is required'),
})

export const createSettlementSchema = z.object({
  from_user: z.string().uuid(),
  to_user: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
  settlement_date: z.string().or(z.date()),
  notes: z.string().optional(),
}).refine((data) => data.from_user !== data.to_user, {
  message: 'From user and to user must be different',
  path: ['to_user'],
})

export const updateProfileSchema = z.object({
  display_name: z.string().min(2).max(50),
  avatar_url: z.string().url().optional(),
})

export type CreateGroupInput = z.infer<typeof createGroupSchema>
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type CreateSettlementInput = z.infer<typeof createSettlementSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
