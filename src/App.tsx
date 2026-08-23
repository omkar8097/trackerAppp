import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { ExpenseCharts } from './components/dashboard/ExpenseCharts';
import { BudgetProgress } from './components/dashboard/BudgetProgress';
import { TransactionList } from './components/transactions/TransactionList';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics'>('dashboard');

  return (
    <AuthProvider>
      <ExpenseProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
          <PWAInstallPrompt />

          {/* Top Header Navbar */}
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main Content Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 pb-28 md:pb-12">
            {activeTab === 'dashboard' ? (
              <>
                {/* Top Stat Summary Cards */}
                <section id="summary-section">
                  <SummaryCards />
                </section>

                {/* Financial Visual Charts */}
                <section id="charts-section">
                  <ExpenseCharts />
                </section>

                {/* Category Budget Limits */}
                <section id="budgets-section">
                  <BudgetProgress />
                </section>

                {/* Detailed Transaction History Table */}
                <section id="transactions-section" className="pt-2">
                  <TransactionList />
                </section>
              </>
            ) : (
              /* Dedicated Standalone Analytics View */
              <AnalyticsPage />
            )}
          </main>

          {/* Floating Mobile Bottom Navigation Bar */}
          <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-slate-950 py-6 mb-16 md:mb-0 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>ExpenseFlow • Firebase Auth & Realtime Cloud Firestore Tracker</p>
              <p className="text-slate-600">Built with React, Vite, TypeScript & Tailwind CSS</p>
            </div>
          </footer>
        </div>
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;
