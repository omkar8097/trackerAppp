import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { Navbar } from './components/Navbar';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { ExpenseCharts } from './components/dashboard/ExpenseCharts';
import { BudgetProgress } from './components/dashboard/BudgetProgress';
import { TransactionList } from './components/transactions/TransactionList';

export function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
          <PWAInstallPrompt />

          {/* Header Bar */}
          <Navbar />


          {/* Main Dashboard Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
            
            {/* Top Stat Summary Cards */}
            <section>
              <SummaryCards />
            </section>

            {/* Financial Visual Charts */}
            <section>
              <ExpenseCharts />
            </section>

            {/* Category Budget Limits */}
            <section>
              <BudgetProgress />
            </section>

            {/* Detailed Transaction History Table */}
            <section className="pt-2">
              <TransactionList />
            </section>

          </main>

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
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
