export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionCategory =
  | 'Food & Dining'
  | 'Transport'
  | 'Bills & Utilities'
  | 'Shopping'
  | 'Entertainment'
  | 'Health & Medical'
  | 'Travel'
  | 'Education'
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Gift'
  | 'Subscriptions'
  | 'Personal Care'
  | 'Home & Garden'
  | 'Sports & Fitness'
  | 'Savings'
  | 'Other';

export type RecurrenceInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type WalletType = 'checking' | 'savings' | 'credit' | 'investment' | 'cash';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'ETB' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR';

export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface ITransaction {
  _id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  walletId: string;
  walletName?: string;
  note?: string;
  tags?: string[];
  isRecurring: boolean;
  recurrenceInterval?: RecurrenceInterval;
  receiptUrl?: string;
  userId?: string;
  userName?: string;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
}

export interface IWallet {
  _id: string;
  name: string;
  type: WalletType;
  balance: number;
  currency: Currency;
  color: string;
  icon: string;
  isShared: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBudget {
  _id: string;
  category: TransactionCategory;
  limit: number;
  spent: number;
  period: 'monthly' | 'yearly';
  month: number;
  year: number;
  currency: Currency;
  alerts: boolean;
  alertThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface ISavingsGoal {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  currency: Currency;
  color: string;
  icon: string;
  description?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IRecurringPayment {
  _id: string;
  title: string;
  amount: number;
  category: TransactionCategory;
  interval: RecurrenceInterval;
  nextDue: string;
  walletId: string;
  isActive: boolean;
  currency: Currency;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  monthlyChange: number;
  recentTransactions: ITransaction[];
  topCategories: { category: string; amount: number; percentage: number }[];
}

export interface AnalyticsData {
  monthlyTrend: { month: string; income: number; expenses: number; savings: number }[];
  categoryBreakdown: { category: string; amount: number; percentage: number; color: string }[];
  weeklySpending: { day: string; amount: number }[];
  yearlyComparison: { month: string; current: number; previous: number }[];
}

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  'Food & Dining': '#f97316',
  'Transport': '#3b82f6',
  'Bills & Utilities': '#8b5cf6',
  'Shopping': '#ec4899',
  'Entertainment': '#f59e0b',
  'Health & Medical': '#ef4444',
  'Travel': '#06b6d4',
  'Education': '#10b981',
  'Salary': '#22c55e',
  'Freelance': '#84cc16',
  'Investment': '#14b8a6',
  'Gift': '#f43f5e',
  'Subscriptions': '#6366f1',
  'Personal Care': '#a855f7',
  'Home & Garden': '#78716c',
  'Sports & Fitness': '#0ea5e9',
  'Savings': '#059669',
  'Other': '#6b7280',
};

export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  'Food & Dining': '🍽️',
  'Transport': '🚗',
  'Bills & Utilities': '⚡',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Health & Medical': '💊',
  'Travel': '✈️',
  'Education': '📚',
  'Salary': '💼',
  'Freelance': '💻',
  'Investment': '📈',
  'Gift': '🎁',
  'Subscriptions': '🔄',
  'Personal Care': '💅',
  'Home & Garden': '🏡',
  'Sports & Fitness': '🏋️',
  'Savings': '🏦',
  'Other': '📦',
};

export const CURRENCIES: Record<Currency, { symbol: string; name: string }> = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  ETB: { symbol: 'Br', name: 'Ethiopian Birr' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
};

export const SHARED_USERS: User[] = [
  { id: 'user1', name: 'Alex', avatar: 'A', color: '#10b981' },
  { id: 'user2', name: 'Jordan', avatar: 'J', color: '#6366f1' },
  { id: 'user3', name: 'Sam', avatar: 'S', color: '#f59e0b' },
];
