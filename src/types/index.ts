export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId?: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  tags?: string[];
  date: string; // ISO date string YYYY-MM-DD
  notes?: string;
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet';
  createdAt: number;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface Budget {
  categoryId: string;
  categoryName: string;
  monthlyLimit: number;
}

export interface FinancialSummary {
  netBalance: number;
  totalIncome: number;
  totalExpense: number;
  savingsRate: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  isConfigured: boolean;
  isDemoMode: boolean;
}

export interface FilterOptions {
  searchTerm: string;
  type: 'all' | 'income' | 'expense';
  category: string;
  tag: string;
  startDate: string;
  endDate: string;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export interface SecuritySettings {
  isLockEnabled: boolean;
  pin: string; // 4-digit PIN
  isBiometricEnabled: boolean;
  autoLockMinutes: number; // 0 = immediate, 1 = 1 min, 5 = 5 min
  lastUnlockedAt?: number;
}
