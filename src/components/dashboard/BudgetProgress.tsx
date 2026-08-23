import React, { useState } from 'react';
import { Target, Edit2, Check, AlertTriangle } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency, getCurrentMonthISO } from '../../utils/formatters';

export const BudgetProgress: React.FC = () => {
  const { categories, budgets, transactions, updateBudget } = useExpense();
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState<string>('');

  const currentMonth = getCurrentMonthISO();

  // Expenses per category for current month
  const monthlyExpensesByCategory = React.useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense' && t.date >= currentMonth.start && t.date <= currentMonth.end)
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [transactions, currentMonth]);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleStartEdit = (categoryId: string, currentLimit: number) => {
    setEditingCategoryId(categoryId);
    setTempLimit(currentLimit ? String(currentLimit) : '');
  };

  const handleSaveBudget = async (categoryId: string) => {
    const limitNum = parseFloat(tempLimit);
    if (!isNaN(limitNum) && limitNum >= 0) {
      await updateBudget(categoryId, limitNum);
    }
    setEditingCategoryId(null);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-white">Monthly Category Budgets</h3>
            <p className="text-xs text-slate-400">Track spending targets & limits</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenseCategories.map((cat) => {
          const budgetObj = budgets.find((b) => b.categoryId === cat.id || b.categoryName === cat.name);
          const limit = budgetObj ? budgetObj.monthlyLimit : 0;
          const spent = monthlyExpensesByCategory[cat.name] || 0;
          const percentage = limit > 0 ? (spent / limit) * 100 : 0;
          const isOver = limit > 0 && spent > limit;
          const isWarning = limit > 0 && percentage >= 80 && !isOver;

          const isEditing = editingCategoryId === cat.id;

          return (
            <div
              key={cat.id}
              className={`p-4 rounded-xl border transition-all ${
                isOver
                  ? 'bg-rose-500/5 border-rose-500/30'
                  : isWarning
                  ? 'bg-amber-500/5 border-amber-500/30'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-semibold text-sm text-slate-200 truncate max-w-[130px]">{cat.name}</span>
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={tempLimit}
                      onChange={(e) => setTempLimit(e.target.value)}
                      placeholder="Limit"
                      className="w-20 px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleSaveBudget(cat.id)}
                      className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(cat.id, limit)}
                    className="text-slate-500 hover:text-slate-300 p-1 transition-colors"
                    title="Set Monthly Budget Limit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Progress and Numbers */}
              <div className="flex items-baseline justify-between text-xs mb-1.5">
                <span className="text-slate-400">
                  Spent: <span className="text-slate-200 font-semibold">{formatCurrency(spent)}</span>
                </span>
                <span className="text-slate-400">
                  Limit: <span className="text-slate-300 font-semibold">{limit > 0 ? formatCurrency(limit) : 'Not set'}</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800/80">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOver
                      ? 'bg-rose-500'
                      : isWarning
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>

              {/* Status footer */}
              <div className="mt-2 flex items-center justify-between text-[11px]">
                {limit > 0 ? (
                  <>
                    <span className={isOver ? 'text-rose-400 font-medium flex items-center gap-1' : isWarning ? 'text-amber-400 font-medium flex items-center gap-1' : 'text-slate-500'}>
                      {(isOver || isWarning) && <AlertTriangle className="w-3 h-3" />}
                      {percentage.toFixed(0)}% used
                    </span>
                    <span className="text-slate-500">
                      {isOver ? `Over by ${formatCurrency(spent - limit)}` : `${formatCurrency(limit - spent)} remaining`}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500 italic">Click pencil icon to set budget limit</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
