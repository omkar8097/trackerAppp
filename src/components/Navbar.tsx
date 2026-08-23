import React, { useState, useEffect } from 'react';
import { Wallet, LogIn, LogOut, Sparkles, RefreshCw, Database, Download, LayoutDashboard, PieChart, Bell, BellRing, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExpense } from '../context/ExpenseContext';
import { usePWA } from '../hooks/usePWA';
import { useSecurity } from '../context/SecurityContext';
import { AuthModal } from './auth/AuthModal';
import { SecuritySettingsModal } from './auth/SecuritySettingsModal';
import { formatCurrency } from '../utils/formatters';
import { enableNotificationsWithTest, getNotificationPermissionState } from '../utils/notifications';

interface Props {
  activeTab: 'dashboard' | 'analytics';
  setActiveTab: (tab: 'dashboard' | 'analytics') => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { currentUser, isDemoMode, logoutUser } = useAuth();
  const { summary, resetToDemoData } = useExpense();
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const { securitySettings, lockApp } = useSecurity();
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [notifState, setNotifState] = useState<string>('default');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setNotifState(getNotificationPermissionState());
  }, []);

  const handleToggleNotifications = async () => {
    const res = await enableNotificationsWithTest();
    setNotifState(res.state);
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Navigation Tabs */}
          <div className="flex items-center gap-6">
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

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" /> Analytics
              </button>
            </nav>
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
          <div className="flex items-center gap-2">
            
            {/* Passcode Security & Lock Button */}
            <button
              onClick={() => {
                if (securitySettings.isLockEnabled && securitySettings.pin) {
                  lockApp();
                } else {
                  setIsSecurityOpen(true);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setIsSecurityOpen(true);
              }}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                securitySettings.isLockEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={securitySettings.isLockEnabled ? 'Tap to Lock App (Right click for Settings)' : 'Configure Passcode Lock'}
            >
              {securitySettings.isLockEnabled ? (
                <Lock className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {securitySettings.isLockEnabled ? 'Lock' : 'App Lock'}
              </span>
            </button>

            {/* Mobile / PWA Notification Bell Toggle */}
            <button
              onClick={handleToggleNotifications}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                notifState === 'granted'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={notifState === 'granted' ? 'Notifications Active' : 'Tap to Enable Mobile Notifications'}
            >
              {notifState === 'granted' ? (
                <BellRing className="w-4 h-4 text-emerald-400" />
              ) : (
                <Bell className="w-4 h-4 text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {notifState === 'granted' ? 'Alerts Active' : 'Enable Alerts'}
              </span>
            </button>

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

      {/* Notification Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900/95 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <BellRing className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SecuritySettingsModal isOpen={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
    </>
  );
};
