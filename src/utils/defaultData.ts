import type { Category, Transaction, Budget } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Income Categories
  { id: 'inc_salary', name: 'Salary & Wages', type: 'income', icon: 'Briefcase', color: '#10B981' },
  { id: 'inc_freelance', name: 'Freelance & Projects', type: 'income', icon: 'Laptop', color: '#3B82F6' },
  { id: 'inc_investments', name: 'Investments & Dividends', type: 'income', icon: 'TrendingUp', color: '#8B5CF6' },
  { id: 'inc_side_hustle', name: 'Side Business', type: 'income', icon: 'Store', color: '#EC4899' },
  { id: 'inc_other', name: 'Other Income', type: 'income', icon: 'IndianRupee', color: '#6B7280' },

  // Expense Categories
  { id: 'exp_housing', name: 'Housing & Rent', type: 'expense', icon: 'Home', color: '#EF4444' },
  { id: 'exp_food', name: 'Food & Groceries', type: 'expense', icon: 'Utensils', color: '#F59E0B' },
  { id: 'exp_transport', name: 'Transportation & Gas', type: 'expense', icon: 'Car', color: '#3B82F6' },
  { id: 'exp_utilities', name: 'Utilities & Bills', type: 'expense', icon: 'Zap', color: '#6366F1' },
  { id: 'exp_entertainment', name: 'Entertainment & Leisure', type: 'expense', icon: 'Film', color: '#EC4899' },
  { id: 'exp_healthcare', name: 'Healthcare & Medical', type: 'expense', icon: 'HeartPulse', color: '#10B981' },
  { id: 'exp_shopping', name: 'Shopping & Apparel', type: 'expense', icon: 'ShoppingBag', color: '#8B5CF6' },
  { id: 'exp_education', name: 'Education & Courses', type: 'expense', icon: 'GraduationCap', color: '#14B8A6' },
  { id: 'exp_subscriptions', name: 'Subscriptions & Software', type: 'expense', icon: 'CreditCard', color: '#64748B' },
];

export const DEFAULT_BUDGETS: Budget[] = [
  { categoryId: 'exp_food', categoryName: 'Food & Groceries', monthlyLimit: 15000 },
  { categoryId: 'exp_housing', categoryName: 'Housing & Rent', monthlyLimit: 25000 },
  { categoryId: 'exp_transport', categoryName: 'Transportation & Gas', monthlyLimit: 6000 },
  { categoryId: 'exp_entertainment', categoryName: 'Entertainment & Leisure', monthlyLimit: 5000 },
  { categoryId: 'exp_shopping', categoryName: 'Shopping & Apparel', monthlyLimit: 8000 },
];

const getPastDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'demo_1',
    title: 'Monthly Tech Salary',
    amount: 85000,
    type: 'income',
    category: 'Salary & Wages',
    date: getPastDate(2),
    notes: 'Direct deposit for current pay period',
    paymentMethod: 'bank_transfer',
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'demo_2',
    title: 'Apartment Rent',
    amount: 24000,
    type: 'expense',
    category: 'Housing & Rent',
    date: getPastDate(3),
    notes: 'Monthly apartment lease payment',
    paymentMethod: 'bank_transfer',
    createdAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'demo_3',
    title: 'Grocery Shopping',
    amount: 4250,
    type: 'expense',
    category: 'Food & Groceries',
    date: getPastDate(4),
    notes: 'Weekly groceries and household essentials',
    paymentMethod: 'card',
    createdAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'demo_4',
    title: 'UI Design Freelance Project',
    amount: 18500,
    type: 'income',
    category: 'Freelance & Projects',
    date: getPastDate(5),
    notes: 'Landing page design client payment',
    paymentMethod: 'digital_wallet',
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'demo_5',
    title: 'Petrol Fillup',
    amount: 2400,
    type: 'expense',
    category: 'Transportation & Gas',
    date: getPastDate(6),
    notes: 'Fuel station fillup',
    paymentMethod: 'card',
    createdAt: Date.now() - 6 * 86400000,
  },
  {
    id: 'demo_6',
    title: 'Netflix & Spotify Subscriptions',
    amount: 999,
    type: 'expense',
    category: 'Subscriptions & Software',
    date: getPastDate(8),
    notes: 'Monthly recurring streaming services',
    paymentMethod: 'card',
    createdAt: Date.now() - 8 * 86400000,
  },
  {
    id: 'demo_7',
    title: 'Electricity & Wi-Fi Bills',
    amount: 3850,
    type: 'expense',
    category: 'Utilities & Bills',
    date: getPastDate(10),
    notes: 'Power grid & Fiber broadband',
    paymentMethod: 'bank_transfer',
    createdAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'demo_8',
    title: 'Dinner with Friends',
    amount: 2450,
    type: 'expense',
    category: 'Food & Groceries',
    date: getPastDate(12),
    notes: 'Weekend dining out',
    paymentMethod: 'card',
    createdAt: Date.now() - 12 * 86400000,
  },
  {
    id: 'demo_9',
    title: 'Stock Portfolio Dividend',
    amount: 3500,
    type: 'income',
    category: 'Investments & Dividends',
    date: getPastDate(14),
    notes: 'Quarterly index fund payout',
    paymentMethod: 'bank_transfer',
    createdAt: Date.now() - 14 * 86400000,
  },
  {
    id: 'demo_10',
    title: 'New Running Shoes',
    amount: 4999,
    type: 'expense',
    category: 'Shopping & Apparel',
    date: getPastDate(15),
    notes: 'Athletic footwear',
    paymentMethod: 'card',
    createdAt: Date.now() - 15 * 86400000,
  },
];
