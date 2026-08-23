import React, { useState } from 'react';
import { Wallet, LogIn, LogOut, Sparkles, RefreshCw, Database, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';
import { usePWA } from '../hooks/usePWA';
import { AuthModal } from './auth/AuthModal';
import { formatCurrency } from '../utils/formatters';

export const Navbar: React.FC = () => {
  const { currentUser, isDemoMode, logoutUser } = useAuth();
  const { summary, resetToDemoData } = useExpense();
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & App Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white tracking-tight">ExpenseFlow</h1>
                {isDemoMode ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Offline Mode
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                    <Database className="w-3 h-3" /> Firebase Live
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Firebase Auth & Realtime Cloud Firestore Expense Tracker</p>
            </div>
          </div>

          {/* Center Summary Quick Badge */}
          <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Balance:</span>
              <span className={`text-sm font-semibold ${summary.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(summary.netBalance)}
              </span>
            </div>
            <div className="w-px h-4 bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Income:</span>
              <span className="text-sm font-semibold text-emerald-400">+{formatCurrency(summary.monthlyIncome)}</span>
            </div>
            <div className="w-px h-4 bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Expense:</span>
              <span className="text-sm font-semibold text-rose-400">-{formatCurrency(summary.monthlyExpense)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {isInstallable && !isInstalled && (
              <button
                onClick={promptInstall}
                title="Install ExpenseFlow App"
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Install App</span>
              </button>
            )}

            {isDemoMode && (
              <button
                onClick={resetToDemoData}
                title="Reset sample offline data"
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Reset Sample Data</span>
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                  {currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <p className="font-semibold text-slate-200 truncate max-w-[120px]">{currentUser.email}</p>
                  <p className="text-[10px] text-emerald-400 font-mono">Authenticated</p>
                </div>
                <button
                  onClick={logoutUser}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <LogIn className="w-4 h-4" /> Sign In with Firebase
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
