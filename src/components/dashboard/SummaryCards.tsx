import React from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';

export const SummaryCards: React.FC = () => {
  const { summary } = useExpense();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      
      {/* Net Balance Card */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Balance</span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <h2 className={`text-base sm:text-2xl font-bold tracking-tight truncate ${summary.netBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {formatCurrency(summary.netBalance)}
          </h2>
        </div>
        <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 flex items-center gap-1 truncate">
          <span>Overall standing</span>
        </p>
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all" />
      </div>

      {/* Monthly Income Card */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Income</span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-1">
          <h2 className="text-base sm:text-2xl font-bold tracking-tight text-emerald-400 truncate">
            +{formatCurrency(summary.totalIncome)}
          </h2>
          <span className="hidden sm:flex text-xs font-medium text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-md items-center">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> Active
          </span>
        </div>
        <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 truncate">
          This month: <span className="text-slate-300 font-medium">+{formatCurrency(summary.monthlyIncome)}</span>
        </p>
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
      </div>

      {/* Monthly Expense Card */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-1">
          <h2 className="text-base sm:text-2xl font-bold tracking-tight text-rose-400 truncate">
            -{formatCurrency(summary.totalExpense)}
          </h2>
          <span className="hidden sm:flex text-xs font-medium text-rose-400/90 bg-rose-500/10 px-2 py-0.5 rounded-md items-center">
            <ArrowDownRight className="w-3 h-3 mr-0.5" /> Spent
          </span>
        </div>
        <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 truncate">
          This month: <span className="text-slate-300 font-medium">-{formatCurrency(summary.monthlyExpense)}</span>
        </p>
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all" />
      </div>

      {/* Savings Rate Card */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Savings Rate</span>
          <div className="p-1.5 sm:p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-1">
          <h2 className="text-base sm:text-2xl font-bold tracking-tight text-violet-300">
            {summary.savingsRate.toFixed(1)}%
          </h2>
          <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:inline">Target: 20%+</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, summary.savingsRate))}%` }}
          />
        </div>
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl group-hover:bg-violet-500/10 transition-all" />
      </div>

    </div>
  );
};
