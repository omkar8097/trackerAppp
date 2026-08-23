import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, Info } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';

const CHART_COLORS = [
  '#F59E0B', '#EF4444', '#3B82F6', '#6366F1', '#EC4899',
  '#10B981', '#8B5CF6', '#14B8A6', '#64748B', '#F43F5E',
];

export const ExpenseCharts: React.FC = () => {
  const { transactions } = useExpense();

  // Category Pie Data
  const categoryData = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const map: Record<string, number> = {};

    expenses.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Monthly Income vs Expense Bar Data
  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; income: number; expense: number }> = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      if (!map[monthKey]) {
        map[monthKey] = { month: monthLabel, income: 0, expense: 0 };
      }

      if (t.type === 'income') {
        map[monthKey].income += t.amount;
      } else {
        map[monthKey].expense += t.amount;
      }
    });

    return Object.keys(map)
      .sort()
      .slice(-6)
      .map((key) => map[key]);
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Donut Chart Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Expenses by Category</h3>
              <p className="text-xs text-slate-400">Distribution of current spending</p>
            </div>
          </div>
        </div>

        {categoryData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <Info className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">No expense data to display chart</p>
          </div>
        )}

        {/* Category Legend Pills */}
        <div className="flex flex-wrap gap-2 mt-4 max-h-20 overflow-y-auto">
          {categoryData.slice(0, 6).map((item, idx) => (
            <div key={item.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
              />
              <span className="truncate max-w-[100px]">{item.name}</span>
              <span className="font-semibold text-slate-400">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Income vs Expense Trend</h3>
              <p className="text-xs text-slate-400">Monthly financial comparison</p>
            </div>
          </div>
        </div>

        {monthlyData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val) || 0)]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <Info className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">No monthly data available</p>
          </div>
        )}
      </div>

    </div>
  );
};
