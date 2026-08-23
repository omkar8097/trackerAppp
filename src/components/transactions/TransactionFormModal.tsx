import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Calendar, Tag as TagIcon, CreditCard, AlignLeft, Plus, Hash } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import type { Transaction, TransactionType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Transaction | null;
}

export const TransactionFormModal: React.FC<Props> = ({ isOpen, onClose, initialData }) => {
  const { categories, availableTags, addTransaction, updateTransaction, addCategory } = useExpense();

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer' | 'digital_wallet'>('card');
  
  // Custom Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setAmount(String(initialData.amount));
      setCategory(initialData.category);
      setTags(initialData.tags || []);
      setDate(initialData.date);
      setNotes(initialData.notes || '');
      setPaymentMethod(initialData.paymentMethod || 'card');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      const defaultCat = categories.find((c) => c.type === 'expense')?.name || '';
      setCategory(defaultCat);
      setTags([]);
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setPaymentMethod('card');
    }
    setIsAddingCategory(false);
    setCustomCategoryName('');
    setTagInput('');
  }, [initialData, isOpen, categories]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const available = categories.filter((c) => c.type === newType);
    if (available.length > 0) {
      setCategory(available[0].name);
    }
  };

  const handleAddCustomCategory = async () => {
    if (!customCategoryName.trim()) return;
    try {
      const created = await addCategory(customCategoryName.trim(), type);
      setCategory(created.name);
      setCustomCategoryName('');
      setIsAddingCategory(false);
    } catch (err) {
      console.error('Failed to create custom category:', err);
    }
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const toggleSuggestedTag = (tag: string) => {
    if (tags.includes(tag)) {
      handleRemoveTag(tag);
    } else {
      setTags([...tags, tag]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0 || !category) return;

    setSubmitting(true);
    try {
      if (initialData) {
        await updateTransaction(initialData.id, {
          title: title.trim(),
          amount: numAmount,
          type,
          category,
          tags,
          date,
          notes: notes.trim() || undefined,
          paymentMethod,
        });
      } else {
        await addTransaction({
          title: title.trim(),
          amount: numAmount,
          type,
          category,
          tags,
          date,
          notes: notes.trim() || undefined,
          paymentMethod,
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed saving transaction', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
        
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto my-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <h3 className="font-semibold text-lg text-white">
            {initialData ? 'Edit Transaction' : 'Add New Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Income (+)
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Title / Description <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grocery Shopping, Monthly Salary..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Amount (₹) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600 font-mono"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Date <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white"
                />
              </div>
            </div>
          </div>

          {/* Category Selection & Custom Category Adder */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">Category</label>
              <button
                type="button"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> {isAddingCategory ? 'Select Existing' : 'Custom Category'}
              </button>
            </div>

            {isAddingCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="Enter new category name..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCategory}
                  disabled={!customCategoryName.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="relative">
                <TagIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white"
                >
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} {c.isCustom ? '(Custom)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Multi-Tag System */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tags (Multiple allowed)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tag (e.g. vacation, tax-free)..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Selected Tags Chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-400 p-0.5 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Available Tags Quick Picker */}
            {availableTags.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block mb-1">Quick Select Tags:</span>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {availableTags.map((tag) => {
                    const isSelected = tags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleSuggestedTag(tag)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-semibold'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
            <div className="relative">
              <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white capitalize"
              >
                <option value="card">Credit / Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="digital_wallet">Digital Wallet</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Optional Notes</label>
            <div className="relative">
              <AlignLeft className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details, receipt reference..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20"
            >
              {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
