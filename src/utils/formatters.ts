import type { Transaction } from '../types';

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
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

export const exportToCSV = (transactions: Transaction[], filename: string = 'expenseflow_transactions_export.csv') => {
  if (!transactions || !transactions.length) return;

  // Comprehensive CSV Headers
  const headers = [
    'Transaction ID',
    'Date',
    'Title / Description',
    'Type',
    'Category',
    'Tags',
    'Amount (₹)',
    'Payment Method',
    'Notes',
    'Created Timestamp'
  ];

  const rows = transactions.map((t) => {
    const formattedTags = (t.tags || []).map((tag) => `#${tag}`).join('; ');
    const paymentMethodLabel = (t.paymentMethod || 'card').replace('_', ' ');
    const createdAtIso = t.createdAt ? new Date(t.createdAt).toISOString() : '';

    return [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.type.toUpperCase()}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      `"${formattedTags.replace(/"/g, '""')}"`,
      t.amount,
      `"${paymentMethodLabel}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${createdAtIso}"`,
    ];
  });

  // Include UTF-8 BOM (\uFEFF) for Excel, Numbers, and Google Sheets compatibility
  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
