# CLAUDE.md - ExpenseFlow Project Guide

## Overview

**ExpenseFlow** is a modern, responsive Progressive Web Application (PWA) built with React 19, TypeScript, Vite, Tailwind CSS v4, and Firebase. It provides personal financial tracking, budget management, and interactive charts with seamless dual-mode capability:
1. **Cloud Mode**: Real-time Firebase Authentication & Firestore data synchronization per user.
2. **Demo Mode**: Full offline/zero-configuration experience powered by `localStorage`.

---

## Quick Reference Commands

- **Development Server**: `npm run dev`
- **Production Build**: `npm run build` *(Runs `tsc -b && vite build`)*
- **Linter**: `npm run lint` *(Runs `oxlint`)*
- **Preview Production Build**: `npm run preview`

---

## Project Structure & Architecture

```
expense-tracker-firebase/
├── .env.example                 # Template for Firebase credentials
├── .gitignore                   # Excludes .env credential files & build artifacts
├── firestore.rules              # Firebase Firestore Security Rules
├── index.html                   # HTML entry point with PWA meta tags
├── package.json                 # Project dependencies & npm scripts
├── vite.config.ts               # Vite config with relative base ('./') for GitHub Pages
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions workflow for automated GitHub Pages deployment
└── src/
    ├── main.tsx                 # Application entry point
    ├── App.tsx                  # Root component & main layout
    ├── index.css                # Global Tailwind CSS imports
    ├── App.css                  # Custom styling utilities
    ├── components/
    │   ├── Navbar.tsx           # Navigation bar with user status & settings modal trigger
    │   ├── FirebaseSetupModal.tsx # Runtime Firebase credentials setup modal
    │   ├── PWAInstallPrompt.tsx # PWA installation banner component
    │   ├── auth/
    │   │   └── AuthModal.tsx    # Auth modal (Email/Password & Google OAuth)
    │   ├── dashboard/
    │   │   ├── SummaryCards.tsx   # Income, expense, net balance, savings rate stats
    │   │   ├── ExpenseCharts.tsx  # Monthly income vs expense bar & category pie charts
    │   │   └── BudgetProgress.tsx # Category budget goal progress bars
    │   └── transactions/
    │       ├── TransactionList.tsx       # Paginated transaction history table
    │       ├── TransactionFilter.tsx     # Search, filter by category/type/date, and sorting
    │       └── TransactionFormModal.tsx  # Modal for adding & editing transactions
    ├── context/
    │   ├── AuthContext.tsx      # Firebase auth state & demo mode context provider
    │   └── ExpenseContext.tsx   # Transactions, budgets, filters, & summary calculations
    ├── firebase/
    │   ├── config.ts            # Environment & localStorage Firebase configuration loader
    │   └── firebase.ts          # Firebase app, auth, & firestore instance initialization
    ├── hooks/
    │   └── usePWA.ts            # PWA installation event listener hook
    ├── types/
    │   └── index.ts             # Global TypeScript interface & type definitions
    └── utils/
        ├── defaultData.ts       # Default categories, sample demo transactions & budget benchmarks
        └── formatters.ts        # Currency, date, and percentage formatting helper functions
```

---

## Deployment to GitHub Pages

The application is pre-configured for automated deployment to **GitHub Pages** via GitHub Actions.

### Setup Instructions

1. **Push Code to GitHub**:
   Ensure your repository is uploaded to GitHub and the primary branch is `main`.

2. **Configure GitHub Repository Secrets**:
   Go to your GitHub repository **Settings > Secrets and variables > Actions > New repository secret** and add the following 6 secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. **Enable GitHub Pages**:
   Go to **Settings > Pages** in your GitHub repository, and under **Build and deployment > Source**, select **GitHub Actions**.

4. **Trigger Deployment**:
   Pushing to `main` will automatically execute [.github/workflows/deploy.yml](file:///c:/Users/USER/.gemini/antigravity/scratch/expense-tracker-firebase/.github/workflows/deploy.yml), building the app with injected Secrets and deploying to GitHub Pages.

---

## Firebase Credential Protection & Security Best Practices

Client-side Web applications (React/Vite) inherently compile Firebase Web API keys into client JS bundles. To properly secure your application and credentials:

1. **Never Commit Secrets to Git**:
   - `.env` and `.env.*` files are explicitly ignored in [.gitignore](file:///c:/Users/USER/.gemini/antigravity/scratch/expense-tracker-firebase/.gitignore).
   - Use `.env.example` as a safe, unpopulated template for reference.

2. **Restrict API Key Domain Origins in Google Cloud Console**:
   - Navigate to **Google Cloud Console > APIs & Services > Credentials**.
   - Edit your Firebase Web API Key and add **Website Restrictions** (HTTP Referrers).
   - Authorize only your domain (e.g., `https://<your-username>.github.io/*` and `localhost`).

3. **Enforce Database Protection with Firestore Security Rules**:
   - Firebase Web API keys serve to identify your project, not to authorize data access.
   - Database protection is strictly enforced by deploying [firestore.rules](file:///c:/Users/USER/.gemini/antigravity/scratch/expense-tracker-firebase/firestore.rules) in the Firebase Console (Firestore Database > Rules):
     ```rules
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /transactions/{transactionId} {
           allow read, write: if request.auth != null && request.auth.uid == request.resource.data.userId;
           allow read, delete: if request.auth != null && request.auth.uid == resource.data.userId;
         }
         match /budgets/{budgetId} {
           allow read, write: if request.auth != null && request.auth.uid == request.resource.data.userId;
           allow read, delete: if request.auth != null && request.auth.uid == resource.data.userId;
         }
       }
     }
     ```

4. **Authorized Authorized Domains in Firebase Auth**:
   - In **Firebase Console > Authentication > Settings > Authorized domains**, add `<your-username>.github.io` to allow Google OAuth logins from your GitHub Pages URL.

---

## Development & Code Style Guidelines

1. **TypeScript Typing**: Maintain explicit interfaces in [src/types/index.ts](file:///c:/Users/USER/.gemini/antigravity/scratch/expense-tracker-firebase/src/types/index.ts) for all entity models (`Transaction`, `Category`, `Budget`, etc.).
2. **React Hooks**:
   - Use custom hooks `useAuth()` and `useExpense()` for consuming context values.
   - Keep side-effects clean; avoid unnecessary synchronous `setState` calls inside `useEffect` blocks.
3. **Styling & Theme**:
   - UI follows a modern dark slate palette with emerald accents (`bg-slate-950`, `emerald-500`).
   - Use Tailwind CSS classes for layout and responsiveness (`max-w-7xl`, responsive grids, flexbox).
4. **Validation & Linting**:
   - Ensure clean build output via `npm run build` and `npm run lint`.
