import type { Transaction } from '../types';

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const getCurrentMonthISO = (): { start: string; end: string } => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  
  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  };
};

export const exportToCSV = (transactions: Transaction[], filename: string = 'financial_transactions.csv') => {
  if (!transactions.length) return;

  const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Payment Method', 'Notes'];
  const rows = transactions.map((t) => [
    t.date,
    `"${t.title.replace(/"/g, '""')}"`,
    t.type,
    `"${t.category}"`,
    t.amount,
    t.paymentMethod || 'other',
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
