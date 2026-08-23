import React, { useState } from 'react';
import { Search, Filter, Download, Plus, ArrowUpDown, Calendar, Hash, ChevronDown } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { exportToCSV } from '../../utils/formatters';

interface Props {
  onAddClick: () => void;
}

export const TransactionFilter: React.FC<Props> = ({ onAddClick }) => {
  const { transactions, categories, availableTags, filterOptions, setFilterOptions, filteredTransactions } = useExpense();
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleTypeChange = (type: 'all' | 'income' | 'expense') => {
    setFilterOptions((prev) => ({ ...prev, type }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterOptions((prev) => ({ ...prev, category: e.target.value }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterOptions((prev) => ({ ...prev, tag: e.target.value }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterOptions((prev) => ({ ...prev, sortBy: e.target.value as any }));
  };

  const handleStartDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions((prev) => ({ ...prev, startDate: e.target.value }));
  };

  const handleEndDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions((prev) => ({ ...prev, endDate: e.target.value }));
  };

  const handleExportFiltered = () => {
    exportToCSV(filteredTransactions, `expenseflow_filtered_${new Date().toISOString().split('T')[0]}.csv`);
    setShowExportMenu(false);
  };

  const handleExportAll = () => {
    exportToCSV(transactions, `expenseflow_all_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    setShowExportMenu(false);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={filterOptions.searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by description, notes, category, or #tags..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600 transition-colors"
          />
        </div>

        {/* Primary Type Pills */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs overflow-x-auto no-scrollbar">
          {(['all', 'income', 'expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                filterOptions.type === t
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Buttons: Export & Add */}
        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={!transactions.length}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              title="Export detailed transaction records to CSV"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {/* Export Menu Dropdown */}
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={handleExportFiltered}
                  disabled={!filteredTransactions.length}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-xl transition-colors disabled:opacity-40 flex items-center justify-between"
                >
                  <span>Export Filtered List</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {filteredTransactions.length}
                  </span>
                </button>
                <button
                  onClick={handleExportAll}
                  disabled={!transactions.length}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-xl transition-colors disabled:opacity-40 flex items-center justify-between mt-1"
                >
                  <span>Export All History</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                    {transactions.length}
                  </span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onAddClick}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Secondary Filters: Category, Tag, Date Range, Sort */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-3 border-t border-slate-800/80">
        
        {/* Category Dropdown */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-500" /> Category
          </label>
          <select
            value={filterOptions.category}
            onChange={handleCategoryChange}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Dropdown */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
            <Hash className="w-3 h-3 text-slate-500" /> Tag
          </label>
          <select
            value={filterOptions.tag}
            onChange={handleTagChange}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-200 font-mono"
          >
            <option value="all">All Tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" /> From Date
          </label>
          <input
            type="date"
            value={filterOptions.startDate}
            onChange={handleStartDate}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" /> To Date
          </label>
          <input
            type="date"
            value={filterOptions.endDate}
            onChange={handleEndDate}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
          />
        </div>

        {/* Sort By Dropdown */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-slate-500" /> Sort Order
          </label>
          <select
            value={filterOptions.sortBy}
            onChange={handleSortChange}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>

      </div>
    </div>
  );
};
