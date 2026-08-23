import React, { useState } from 'react';
import { LayoutDashboard, PieChart, Plus, ReceiptText, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TransactionFormModal } from './transactions/TransactionFormModal';
import { AuthModal } from './auth/AuthModal';

interface Props {
  activeTab: 'dashboard' | 'analytics';
  setActiveTab: (tab: 'dashboard' | 'analytics') => void;
}

export const MobileBottomNav: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleNavClick = (tab: 'dashboard' | 'analytics', sectionId?: string) => {
    setActiveTab(tab);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-3 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-around relative">
          
          {/* Home / Dashboard Tab */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          {/* Analytics Tab */}
          <button
            onClick={() => handleNavClick('analytics')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'analytics' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-5 h-5" />
            <span className="text-[10px]">Analytics</span>
          </button>

          {/* Center Floating Action Button (FAB) */}
          <div className="relative -top-5">
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40 border-4 border-slate-950 active:scale-95 transition-transform"
              title="Add New Transaction"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>

          {/* History / Transactions Tab */}
          <button
            onClick={() => handleNavClick('dashboard', 'transactions-section')}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
          >
            <ReceiptText className="w-5 h-5" />
            <span className="text-[10px]">History</span>
          </button>

          {/* Profile / Auth Tab */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
          >
            {currentUser ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold">
                {currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
              </div>
            ) : (
              <User className="w-5 h-5" />
            )}
            <span className="text-[10px]">{currentUser ? 'Account' : 'Login'}</span>
          </button>

        </div>
      </nav>

      {/* Modals triggered from Mobile Navigation */}
      <TransactionFormModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
