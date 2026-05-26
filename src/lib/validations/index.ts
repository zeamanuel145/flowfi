import { z } from 'zod';

export const AuthSignupSchema = z.object({
  name: z.string().trim().min(1, 'Full name is required').max(100),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const AuthLoginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const TransactionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  walletId: z.string().min(1, 'Wallet is required'),
  note: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().default(false),
  recurrenceInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  userId: z.string().optional(),
  userName: z.string().optional(),
  currency: z.string().default('USD'),
});

export const WalletSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['checking', 'savings', 'credit', 'investment', 'cash']),
  balance: z.number().default(0),
  currency: z.string().default('USD'),
  color: z.string().default('#10b981'),
  icon: z.string().default('💳'),
  isShared: z.boolean().default(true),
  description: z.string().max(300).optional(),
});

export const BudgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  limit: z.number().positive('Budget limit must be positive'),
  period: z.enum(['monthly', 'yearly']).default('monthly'),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
  currency: z.string().default('USD'),
  alerts: z.boolean().default(true),
  alertThreshold: z.number().min(1).max(100).default(80),
});

export const SavingsGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  targetAmount: z.number().positive('Target must be positive'),
  currentAmount: z.number().min(0).default(0),
  deadline: z.string().optional(),
  currency: z.string().default('USD'),
  color: z.string().default('#10b981'),
  icon: z.string().default('🎯'),
  description: z.string().max(300).optional(),
});

export type AuthSignupInput = z.infer<typeof AuthSignupSchema>;
export type AuthLoginInput = z.infer<typeof AuthLoginSchema>;
export type TransactionInput = z.infer<typeof TransactionSchema>;
export type WalletInput = z.infer<typeof WalletSchema>;
export type BudgetInput = z.infer<typeof BudgetSchema>;
export type SavingsGoalInput = z.infer<typeof SavingsGoalSchema>;
