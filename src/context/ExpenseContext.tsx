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
import type { Transaction, Category, Budget, FinancialSummary, FilterOptions, TransactionType } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_BUDGETS, DEMO_TRANSACTIONS } from '../utils/defaultData';
import { getCurrentMonthISO } from '../utils/formatters';

interface ExpenseContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  availableTags: string[];
  loading: boolean;
  filterOptions: FilterOptions;
  filteredTransactions: Transaction[];
  summary: FinancialSummary;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (name: string, type: TransactionType, color?: string, icon?: string) => Promise<Category>;
  updateBudget: (categoryId: string, monthlyLimit: number) => Promise<void>;
  resetToDemoData: () => void;
}

const LOCAL_STORAGE_TX_KEY = 'expense_tracker_demo_transactions';
const LOCAL_STORAGE_BUDGET_KEY = 'expense_tracker_demo_budgets';
const LOCAL_STORAGE_CAT_KEY = 'expense_tracker_custom_categories';

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isDemoMode } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>(DEFAULT_BUDGETS);
  const [_loading, setLoading] = useState<boolean>(true);

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    type: 'all',
    category: 'all',
    tag: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'date_desc',
  });

  // Combine default categories with custom categories
  const categories = useMemo(() => {
    const combined = [...DEFAULT_CATEGORIES];
    customCategories.forEach((customCat) => {
      if (!combined.some((c) => c.name.toLowerCase() === customCat.name.toLowerCase())) {
        combined.push(customCat);
      }
    });
    return combined;
  }, [customCategories]);

  // Load Firestore data or Demo Local Storage
  useEffect(() => {
    setLoading(true);

    if (currentUser && !isDemoMode && firebaseDb) {
      // Realtime Firestore Transactions Subscription
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
            tags: Array.isArray(data.tags) ? data.tags : [],
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

      // Custom Categories Firestore Subscription
      const qCat = query(
        collection(firebaseDb, 'categories'),
        where('userId', '==', currentUser.uid)
      );
      const unsubCat = onSnapshot(qCat, (snapshot) => {
        const cList: Category[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          cList.push({
            id: docSnap.id,
            userId: data.userId,
            name: data.name,
            type: data.type,
            icon: data.icon || 'Tag',
            color: data.color || '#10B981',
            isCustom: true,
          });
        });
        setCustomCategories(cList);
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
        unsubCat();
        unsubBudget();
      };
    } else {
      // Offline / Local Storage Mode
      try {
        const savedTx = localStorage.getItem(LOCAL_STORAGE_TX_KEY);
        const savedB = localStorage.getItem(LOCAL_STORAGE_BUDGET_KEY);
        const savedCat = localStorage.getItem(LOCAL_STORAGE_CAT_KEY);

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

        if (savedCat) {
          setCustomCategories(JSON.parse(savedCat));
        }
      } catch (e) {
        console.error('Failed to load local storage data', e);
        setTransactions(DEMO_TRANSACTIONS);
      }
      setLoading(false);
    }
  }, [currentUser, isDemoMode]);

  // Derived list of all unique tags from transactions
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.tags && Array.isArray(tx.tags)) {
        tx.tags.forEach((tag) => tagSet.add(tag.trim().toLowerCase()));
      }
    });
    return Array.from(tagSet).sort();
  }, [transactions]);

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

  const saveDemoCategories = (cList: Category[]) => {
    setCustomCategories(cList);
    try {
      localStorage.setItem(LOCAL_STORAGE_CAT_KEY, JSON.stringify(cList));
    } catch (e) {
      console.error('Failed saving demo categories', e);
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id' | 'createdAt'>) => {
    const createdAt = Date.now();
    const cleanTags = (t.tags || []).map((tag) => tag.trim().toLowerCase()).filter(Boolean);

    if (currentUser && !isDemoMode && firebaseDb) {
      const docData: Record<string, any> = {
        title: t.title,
        amount: t.amount,
        type: t.type,
        category: t.category,
        tags: cleanTags,
        date: t.date,
        paymentMethod: t.paymentMethod || 'card',
        userId: currentUser.uid,
        createdAt,
      };

      if (t.notes && typeof t.notes === 'string' && t.notes.trim()) {
        docData.notes = t.notes.trim();
      }

      // Ensure zero undefined properties are sent to Cloud Firestore
      const sanitizedDocData = Object.fromEntries(
        Object.entries(docData).filter(([_, v]) => v !== undefined)
      );

      await addDoc(collection(firebaseDb, 'transactions'), sanitizedDocData);
    } else {
      const newTx: Transaction = {
        ...t,
        tags: cleanTags,
        notes: t.notes && t.notes.trim() ? t.notes.trim() : undefined,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        createdAt,
      };
      saveDemoTransactions([newTx, ...transactions]);
    }
  };

  const updateTransaction = async (id: string, t: Partial<Transaction>) => {
    const updateData: Record<string, any> = { ...t };
    if (t.tags) {
      updateData.tags = t.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
    }
    if (t.notes !== undefined) {
      if (t.notes.trim()) {
        updateData.notes = t.notes.trim();
      } else {
        delete updateData.notes;
      }
    }

    // Clean up any remaining undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    if (currentUser && !isDemoMode && firebaseDb) {
      const docRef = doc(firebaseDb, 'transactions', id);
      await updateDoc(docRef, updateData);
    } else {
      const updated = transactions.map((tx) => (tx.id === id ? { ...tx, ...updateData } : tx));
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

  const addCategory = async (
    name: string,
    type: TransactionType,
    color: string = '#10B981',
    icon: string = 'Tag'
  ): Promise<Category> => {
    const cleanName = name.trim();
    const existing = categories.find((c) => c.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) return existing;

    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: cleanName,
      type,
      color,
      icon,
      isCustom: true,
    };

    // Optimistically add to state immediately
    setCustomCategories((prev) => {
      if (prev.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) return prev;
      return [...prev, newCat];
    });

    if (currentUser && !isDemoMode && firebaseDb) {
      const docRef = await addDoc(collection(firebaseDb, 'categories'), {
        userId: currentUser.uid,
        name: cleanName,
        type,
        color,
        icon,
      });
      newCat.id = docRef.id;
    } else {
      saveDemoCategories([...customCategories, newCat]);
    }

    return newCat;
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
    setCustomCategories([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_CAT_KEY);
    } catch (e) {
      console.error('Failed clearing custom categories', e);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterOptions.type !== 'all' && t.type !== filterOptions.type) {
        return false;
      }
      if (filterOptions.category !== 'all' && t.category !== filterOptions.category) {
        return false;
      }
      if (filterOptions.tag !== 'all') {
        if (!t.tags || !t.tags.includes(filterOptions.tag.toLowerCase())) {
          return false;
        }
      }
      if (filterOptions.searchTerm) {
        const queryStr = filterOptions.searchTerm.toLowerCase();
        const titleMatch = t.title.toLowerCase().includes(queryStr);
        const notesMatch = (t.notes || '').toLowerCase().includes(queryStr);
        const categoryMatch = t.category.toLowerCase().includes(queryStr);
        const tagMatch = (t.tags || []).some((tag) => tag.toLowerCase().includes(queryStr));
        if (!titleMatch && !notesMatch && !categoryMatch && !tagMatch) {
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
        availableTags,
        loading: _loading,
        filterOptions,
        filteredTransactions,
        summary,
        setFilterOptions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
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
