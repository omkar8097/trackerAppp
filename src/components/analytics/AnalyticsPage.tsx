import React, { useState, useMemo } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  Hash,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';

type TimeRange = 'this_month' | '3_months' | '6_months' | 'ytd' | 'all';

const CATEGORY_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
  '#EF4444', '#6366F1', '#14B8A6', '#F43F5E', '#84CC16'
];

export const AnalyticsPage: React.FC = () => {
  const { transactions } = useExpense();
  const [timeRange, setTimeRange] = useState<TimeRange>('this_month');

  // Filter transactions according to selected time range
  const filteredData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      if (isNaN(txDate.getTime())) return true;

      if (timeRange === 'this_month') {
        return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
      }
      if (timeRange === '3_months') {
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return txDate >= threeMonthsAgo;
      }
      if (timeRange === '6_months') {
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return txDate >= sixMonthsAgo;
      }
      if (timeRange === 'ytd') {
        return txDate.getFullYear() === currentYear;
      }
      return true; // 'all'
    });
  }, [transactions, timeRange]);

  // Compute key summary totals for the selected period
  const periodSummary = useMemo(() => {
    const income = filteredData.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredData.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const net = income - expense;
    const savingsRate = income > 0 ? Math.max(0, ((income - expense) / income) * 100) : 0;

    return { income, expense, net, savingsRate };
  }, [filteredData]);

  // Monthly trend chart data
  const monthlyTrendData = useMemo(() => {
    const monthlyMap: Record<string, { month: string; income: number; expense: number }> = {};

    filteredData.forEach((tx) => {
      const d = new Date(tx.date);
      if (isNaN(d.getTime())) return;
      const monthKey = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }
      if (tx.type === 'income') {
        monthlyMap[monthKey].income += tx.amount;
      } else {
        monthlyMap[monthKey].expense += tx.amount;
      }
    });

    return Object.values(monthlyMap);
  }, [filteredData]);

  // Category breakdown for Pie Chart
  const categoryPieData = useMemo(() => {
    const catMap: Record<string, number> = {};
    filteredData
      .filter((t) => t.type === 'expense')
      .forEach((tx) => {
        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
      });

    return Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // Tag analytics breakdown
  const tagAnalytics = useMemo(() => {
    const tagMap: Record<string, { total: number; count: number; income: number; expense: number }> = {};

    filteredData.forEach((tx) => {
      if (tx.tags && Array.isArray(tx.tags) && tx.tags.length > 0) {
        tx.tags.forEach((tag) => {
          const cleanTag = tag.trim().toLowerCase();
          if (!tagMap[cleanTag]) {
            tagMap[cleanTag] = { total: 0, count: 0, income: 0, expense: 0 };
          }
          tagMap[cleanTag].count += 1;
          tagMap[cleanTag].total += tx.amount;
          if (tx.type === 'income') {
            tagMap[cleanTag].income += tx.amount;
          } else {
            tagMap[cleanTag].expense += tx.amount;
          }
        });
      }
    });

    return Object.entries(tagMap)
      .map(([tag, data]) => ({ tag, ...data }))
      .sort((a, b) => b.expense - a.expense);
  }, [filteredData]);

  // Payment method breakdown
  const paymentMethodData = useMemo(() => {
    const pMap: Record<string, { label: string; amount: number; count: number }> = {
      card: { label: 'Credit / Debit Card', amount: 0, count: 0 },
      bank_transfer: { label: 'Bank Transfer', amount: 0, count: 0 },
      digital_wallet: { label: 'Digital Wallet', amount: 0, count: 0 },
      cash: { label: 'Cash', amount: 0, count: 0 },
    };

    filteredData.forEach((tx) => {
      const method = tx.paymentMethod || 'card';
      if (pMap[method]) {
        pMap[method].amount += tx.amount;
        pMap[method].count += 1;
      }
    });

    return Object.values(pMap).filter((item) => item.count > 0);
  }, [filteredData]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Financial Analytics & Insights</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Deep-dive into income patterns, category expenses, and tag analytics</p>
        </div>

        {/* Time Period Filter Pills */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs overflow-x-auto no-scrollbar">
          {(
            [
              { key: 'this_month', label: 'This Month' },
              { key: '3_months', label: '3 Months' },
              { key: '6_months', label: '6 Months' },
              { key: 'ytd', label: 'YTD' },
              { key: 'all', label: 'All Time' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setTimeRange(item.key)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                timeRange === item.key
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Period Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Net Balance */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Surplus</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className={`text-lg sm:text-2xl font-bold ${periodSummary.net >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {formatCurrency(periodSummary.net)}
          </h3>
        </div>

        {/* Period Income */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Period Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-lg sm:text-2xl font-bold text-emerald-400">
            +{formatCurrency(periodSummary.income)}
          </h3>
        </div>

        {/* Period Expenses */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Period Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <h3 className="text-lg sm:text-2xl font-bold text-rose-400">
            -{formatCurrency(periodSummary.expense)}
          </h3>
        </div>

        {/* Period Savings Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Savings Rate</span>
            <PiggyBank className="w-4 h-4 text-violet-400" />
          </div>
          <h3 className="text-lg sm:text-2xl font-bold text-violet-300">
            {periodSummary.savingsRate.toFixed(1)}%
          </h3>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income vs Expense Monthly Trend Bar Chart */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" /> Monthly Comparison
            </h3>
            <span className="text-xs text-slate-400 font-mono">Income vs Expenses</span>
          </div>

          <div className="h-72 w-full pt-2">
            {monthlyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={(val: any) => [formatCurrency(Number(val) || 0)]}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No monthly trend data for this period
              </div>
            )}
          </div>
        </div>

        {/* Category Expense Distribution Pie Chart */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" /> Category Breakdown
            </h3>
            <span className="text-xs text-slate-400 font-mono">Share of total spend</span>
          </div>

          <div className="h-72 w-full pt-2 flex items-center justify-center">
            {categoryPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={(val: any) => [formatCurrency(Number(val) || 0)]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No category expenses recorded for this period
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Dedicated Multi-Tag Analytics Section */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Hash className="w-4 h-4 text-emerald-400" /> Tag Spending Analytics
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Expense distribution categorized by custom transaction #tags
            </p>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 font-mono self-start sm:self-auto">
            {tagAnalytics.length} Tags Tracked
          </span>
        </div>

        {tagAnalytics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tagAnalytics.map((item) => {
              const percentage = periodSummary.expense > 0 ? (item.expense / periodSummary.expense) * 100 : 0;

              return (
                <div key={item.tag} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-sm text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      #{item.tag}
                    </span>
                    <span className="text-xs text-slate-400">
                      {item.count} {item.count === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-3 mb-1">
                    <span className="text-xs text-slate-400">Total Spent:</span>
                    <span className="font-bold font-mono text-sm text-white">
                      {formatCurrency(item.expense)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Share of Expenses</span>
                    <span className="font-mono text-slate-400">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            No tags found in current transactions. Add tags like <code className="text-emerald-400">#vacation</code> or <code className="text-emerald-400">#essential</code> when creating entries!
          </div>
        )}
      </div>

      {/* Payment Method Distribution */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-violet-400" /> Payment Methods Usage
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {paymentMethodData.map((item) => (
            <div key={item.label} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-1">{item.label}</span>
              <h4 className="text-lg font-bold text-white font-mono">{formatCurrency(item.amount)}</h4>
              <span className="text-[11px] text-slate-500 mt-1 block">{item.count} transactions</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
