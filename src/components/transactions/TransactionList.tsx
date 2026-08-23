import React, { useState } from 'react';
import { Edit2, Trash2, ArrowUpRight, ArrowDownRight, Tag, CreditCard, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import type { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TransactionFilter } from './TransactionFilter';
import { TransactionFormModal } from './TransactionFormModal';

const ITEMS_PER_PAGE = 8;

export const TransactionList: React.FC = () => {
  const { filteredTransactions, deleteTransaction } = useExpense();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete transaction "${title}"?`)) {
      await deleteTransaction(id);
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Component */}
      <TransactionFilter onAddClick={() => setIsAddModalOpen(true)} />

      {/* Main Table Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        
        {paginatedTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Transaction</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {paginatedTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Title & Notes */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border flex-shrink-0 ${
                            isIncome
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">{tx.title}</p>
                            {tx.notes && <p className="text-[11px] text-slate-400 truncate max-w-xs">{tx.notes}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-medium text-slate-300">
                          <Tag className="w-3 h-3 text-slate-500" />
                          {tx.category}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                        {formatDate(tx.date)}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 capitalize">
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          {(tx.paymentMethod || 'card').replace('_', ' ')}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right">
                        <span className={`font-bold font-mono text-sm ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id, tx.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-slate-500">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 mb-3">
              <Inbox className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm font-semibold text-slate-300 mb-1">No Transactions Found</p>
            <p className="text-xs text-slate-400 max-w-sm text-center">
              No financial entries matched your filter parameters. Try adjusting your search query or add a new transaction.
            </p>
          </div>
        )}

        {/* Footer & Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {Math.min(filteredTransactions.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} to{' '}
              {Math.min(filteredTransactions.length, currentPage * ITEMS_PER_PAGE)} of {filteredTransactions.length} entries
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-300 font-mono">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Form Modal */}
      <TransactionFormModal
        isOpen={isAddModalOpen || Boolean(editingTransaction)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        initialData={editingTransaction}
      />
    </div>
  );
};
