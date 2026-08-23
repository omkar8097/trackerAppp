import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import { firebaseDb } from '../firebase/firebase';
import { useAuth } from './AuthContext';
import type { Transaction, Category, Budget, FinancialSummary, FilterOptions } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_BUDGETS, DEMO_TRANSACTIONS } from '../utils/defaultData';
import { getCurrentMonthISO } from '../utils/formatters';

interface ExpenseContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  loading: boolean;
  filterOptions: FilterOptions;
  filteredTransactions: Transaction[];
  summary: FinancialSummary;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateBudget: (categoryId: string, monthlyLimit: number) => Promise<void>;
  resetToDemoData: () => void;
}

const LOCAL_STORAGE_TX_KEY = 'expense_tracker_demo_transactions';
const LOCAL_STORAGE_BUDGET_KEY = 'expense_tracker_demo_budgets';

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isDemoMode } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>(DEFAULT_BUDGETS);
  const [_loading, setLoading] = useState<boolean>(true);

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'date_desc',
  });

  // Load Firestore data or Demo Local Storage
  useEffect(() => {
    setLoading(true);

    if (currentUser && !isDemoMode && firebaseDb) {
      // Realtime Firestore Subscription
      const q = query(
        collection(firebaseDb, 'transactions'),
        where('userId', '==', currentUser.uid)
      );

      const unsubTx = onSnapshot(q, (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            userId: data.userId,
            title: data.title,
            amount: Number(data.amount),
            type: data.type,
            category: data.category,
            date: data.date,
            notes: data.notes,
            paymentMethod: data.paymentMethod,
            createdAt: data.createdAt || Date.now(),
          });
        });
        setTransactions(list);
        setLoading(false);
      }, (err) => {
        console.error('Firestore subscription error:', err);
        setLoading(false);
      });

      // Budgets Firestore Subscription
      const budgetRef = collection(firebaseDb, 'budgets');
      const qBudget = query(budgetRef, where('userId', '==', currentUser.uid));
      const unsubBudget = onSnapshot(qBudget, (snapshot) => {
        const bList: Budget[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          bList.push({
            categoryId: data.categoryId,
            categoryName: data.categoryName,
            monthlyLimit: Number(data.monthlyLimit),
          });
        });
        if (bList.length > 0) {
          setBudgets(bList);
        }
      });

      return () => {
        unsubTx();
        unsubBudget();
      };
    } else {
      // Demo / Local Storage Mode
      try {
        const savedTx = localStorage.getItem(LOCAL_STORAGE_TX_KEY);
        const savedB = localStorage.getItem(LOCAL_STORAGE_BUDGET_KEY);

        if (savedTx) {
          setTransactions(JSON.parse(savedTx));
        } else {
          setTransactions(DEMO_TRANSACTIONS);
          localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(DEMO_TRANSACTIONS));
        }

        if (savedB) {
          setBudgets(JSON.parse(savedB));
        } else {
          setBudgets(DEFAULT_BUDGETS);
          localStorage.setItem(LOCAL_STORAGE_BUDGET_KEY, JSON.stringify(DEFAULT_BUDGETS));
        }
      } catch (e) {
        console.error('Failed to load local storage demo data', e);
        setTransactions(DEMO_TRANSACTIONS);
      }
      setLoading(false);
    }
  }, [currentUser, isDemoMode]);

  const saveDemoTransactions = (list: Transaction[]) => {
    setTransactions(list);
    try {
      localStorage.setItem(LOCAL_STORAGE_TX_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed saving demo transactions', e);
    }
  };

  const saveDemoBudgets = (bList: Budget[]) => {
    setBudgets(bList);
    try {
      localStorage.setItem(LOCAL_STORAGE_BUDGET_KEY, JSON.stringify(bList));
    } catch (e) {
      console.error('Failed saving demo budgets', e);
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id' | 'createdAt'>) => {
    const createdAt = Date.now();
    if (currentUser && !isDemoMode && firebaseDb) {
      await addDoc(collection(firebaseDb, 'transactions'), {
        ...t,
        userId: currentUser.uid,
        createdAt,
      });
    } else {
      const newTx: Transaction = {
        ...t,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        createdAt,
      };
      saveDemoTransactions([newTx, ...transactions]);
    }
  };

  const updateTransaction = async (id: string, t: Partial<Transaction>) => {
    if (currentUser && !isDemoMode && firebaseDb) {
      const docRef = doc(firebaseDb, 'transactions', id);
      await updateDoc(docRef, t);
    } else {
      const updated = transactions.map((tx) => (tx.id === id ? { ...tx, ...t } : tx));
      saveDemoTransactions(updated);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (currentUser && !isDemoMode && firebaseDb) {
      await deleteDoc(doc(firebaseDb, 'transactions', id));
    } else {
      const updated = transactions.filter((tx) => tx.id !== id);
      saveDemoTransactions(updated);
    }
  };

  const updateBudget = async (categoryId: string, monthlyLimit: number) => {
    const categoryObj = categories.find((c) => c.id === categoryId);
    const categoryName = categoryObj ? categoryObj.name : categoryId;

    if (currentUser && !isDemoMode && firebaseDb) {
      const budgetDocId = `${currentUser.uid}_${categoryId}`;
      await setDoc(doc(firebaseDb, 'budgets', budgetDocId), {
        userId: currentUser.uid,
        categoryId,
        categoryName,
        monthlyLimit,
      });
    } else {
      const existing = budgets.find((b) => b.categoryId === categoryId);
      let updated: Budget[];
      if (existing) {
        updated = budgets.map((b) => (b.categoryId === categoryId ? { ...b, monthlyLimit } : b));
      } else {
        updated = [...budgets, { categoryId, categoryName, monthlyLimit }];
      }
      saveDemoBudgets(updated);
    }
  };

  const resetToDemoData = () => {
    saveDemoTransactions(DEMO_TRANSACTIONS);
    saveDemoBudgets(DEFAULT_BUDGETS);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterOptions.type !== 'all' && t.type !== filterOptions.type) {
        return false;
      }
      if (filterOptions.category !== 'all' && t.category !== filterOptions.category) {
        return false;
      }
      if (filterOptions.searchTerm) {
        const queryStr = filterOptions.searchTerm.toLowerCase();
        const titleMatch = t.title.toLowerCase().includes(queryStr);
        const notesMatch = (t.notes || '').toLowerCase().includes(queryStr);
        const categoryMatch = t.category.toLowerCase().includes(queryStr);
        if (!titleMatch && !notesMatch && !categoryMatch) {
          return false;
        }
      }
      if (filterOptions.startDate && t.date < filterOptions.startDate) {
        return false;
      }
      if (filterOptions.endDate && t.date > filterOptions.endDate) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (filterOptions.sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (filterOptions.sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (filterOptions.sortBy === 'amount_desc') return b.amount - a.amount;
      if (filterOptions.sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, filterOptions]);

  const summary: FinancialSummary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    const currentMonth = getCurrentMonthISO();
    const monthlyIncome = transactions
      .filter((t) => t.type === 'income' && t.date >= currentMonth.start && t.date <= currentMonth.end)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = transactions
      .filter((t) => t.type === 'expense' && t.date >= currentMonth.start && t.date <= currentMonth.end)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      netBalance,
      totalIncome,
      totalExpense,
      savingsRate,
      monthlyIncome,
      monthlyExpense,
    };
  }, [transactions]);

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        categories,
        budgets,
        loading: _loading,
        filterOptions,
        filteredTransactions,
        summary,
        setFilterOptions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateBudget,
        resetToDemoData,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
