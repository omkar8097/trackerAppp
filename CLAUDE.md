# CLAUDE.md - ExpenseFlow Project Guide

## Overview

**ExpenseFlow** is a modern, responsive Progressive Web Application (PWA) built with React 19, TypeScript, Vite, Tailwind CSS, and Firebase. It provides personal financial tracking, budget management, multi-tag analytics, persistent custom categories, and interactive charts with real-time Firebase Authentication & Cloud Firestore data synchronization per user.

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
├── firestore.rules              # Firebase Cloud Firestore Security Rules
├── index.html                   # HTML entry point with PWA meta tags & viewport-fit=cover
├── package.json                 # Project dependencies & npm scripts
├── public/
│   ├── manifest.json            # PWA Web App Manifest (relative paths, start_url: ./index.html)
│   ├── sw.js                    # Service Worker with app shell pre-caching & notificationclick handler
│   ├── favicon.svg              # App favicon
│   ├── pwa-192x192.svg          # 192x192 PWA Icon
│   └── pwa-512x512.svg          # 512x512 PWA Icon
├── vite.config.ts               # Vite config with relative base ('./') for GitHub Pages
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions workflow for automated GitHub Pages deployment
└── src/
    ├── main.tsx                 # Application entry point
    ├── App.tsx                  # Root component, view state (Dashboard vs Analytics), & main layout
    ├── index.css                # Global Tailwind CSS imports & custom touch utilities
    ├── components/
    │   ├── Navbar.tsx           # Header navigation, balance summary, notification toggle & auth triggers
    │   ├── MobileBottomNav.tsx  # Mobile bottom navigation bar with central floating FAB '+' button
    │   ├── PWAInstallPrompt.tsx # PWA install prompt & iOS Safari installation instructions
    │   ├── analytics/
    │   │   └── AnalyticsPage.tsx # Standalone Analytics view with time filters, charts & tag breakdowns
    │   ├── auth/
    │   │   └── AuthModal.tsx    # Auth modal (Email/Password & Google OAuth)
    │   ├── dashboard/
    │   │   ├── SummaryCards.tsx   # Income, expense, net balance, savings rate stats (2x2 grid on mobile)
    │   │   ├── ExpenseCharts.tsx  # Monthly income vs expense bar & category pie charts
    │   │   └── BudgetProgress.tsx # Category budget goal progress bars
    │   └── transactions/
    │       ├── TransactionList.tsx       # Paginated transaction history table with tag badges
    │       ├── TransactionFilter.tsx     # Search, filter by category/type/tag/date, and CSV exporter
    │       └── TransactionFormModal.tsx  # Modal for adding & editing transactions with tags & custom categories
    ├── context/
    │   ├── AuthContext.tsx      # Firebase auth state context provider
    │   └── ExpenseContext.tsx   # Transactions, categories, budgets, tags, filters, & calculations
    ├── firebase/
    │   ├── config.ts            # Environment variable Firebase configuration loader
    │   └── firebase.ts          # Firebase app, auth, & firestore instance initialization
    ├── hooks/
    │   └── usePWA.ts            # PWA installation event listener & Service Worker registration hook
    ├── types/
    │   └── index.ts             # Global TypeScript interface & type definitions (Transaction, Category, Tag)
    └── utils/
        ├── defaultData.ts       # Default categories, sample INR transactions & budget benchmarks
        ├── formatters.ts        # Rupee currency (INR / ₹), date, percentage, & detailed CSV exporter
        └── notifications.ts     # Web Notifications permission handler & local PWA push notifications
```

---

## Core Features & Functionality

### 1. Currency & Localization
- Default currency set to **Indian Rupee (`INR` / `₹`)** using `en-IN` locale formatting.
- Inputs, tables, summary cards, charts, and CSV exports display currency in `₹`.

### 2. Persistent Custom Categories
- Users can create custom income or expense categories inline via **`+ Custom Category`** in the transaction modal.
- Saved to Cloud Firestore `categories` collection in Cloud mode, or `localStorage` in Offline mode.
- Synchronously updates React state so newly created categories remain selected seamlessly.

### 3. Multi-Tag System per Transaction
- Assign multiple `#tags` to any transaction (e.g. `#vacation`, `#essential`, `#tax-deductible`).
- Inline tag creation, interactive dropdown suggestions for previously used tags, and tag chips on transaction items.
- Filter transaction history by tag or search by `#tagname`.

### 4. Standalone Dedicated Analytics View (`AnalyticsPage.tsx`)
- Navigation tab toggle between **Dashboard** and **Analytics** views.
- Includes time period filters (*This Month*, *3 Months*, *6 Months*, *YTD*, *All Time*).
- Interactive **Income vs Expense** trend bar charts, **Category Spending** pie charts, **Tag Analytics** expenditure grids, and **Payment Method** breakdowns.

### 5. Detailed CSV Export
- Export includes complete detail fields: *Transaction ID*, *Date*, *Title*, *Type*, *Category*, *Tags*, *Amount (₹)*, *Payment Method*, *Notes*, and *Created Timestamp*.
- Embedded `\uFEFF` UTF-8 BOM byte header for clean rendering in Microsoft Excel, Apple Numbers, and Google Sheets.
- Choice between **Export Filtered View** and **Export All History**.

### 6. Mobile & Web Push Notifications
- Mobile notification permission requester (`notifications.ts`) and header toggle button (**`Alerts ON`** / **`Alerts OFF`**).
- Complete **Turn Off** option (`toggleNotifications()`, `isNotificationEnabledByUser()`) with preference persistence in `localStorage`.
- Fires local PWA notifications when installed or when transaction entries are added/updated (when enabled).
- Service Worker `notificationclick` listener focuses or opens the PWA window when a notification is tapped.

### 7. Daily 9:00 PM IST Financial Summary Notification Scheduler
- `scheduleDaily9PMReminder()` in `src/utils/notifications.ts` & `ExpenseContext.tsx` calculates today's total expenses, total income, and entry count.
- Triggers a recurring daily 9:00 PM IST notification when enabled: `"🌙 Daily Expense Summary (9:00 PM IST): Today: Spent ₹X | Income +₹Y (Z entries). Tap to review!"`
- Respects user Turn Off toggle preference and automatically pauses timers when turned OFF.

### 8. Passcode 4-Digit PIN & Biometric Lock (Fingerprint / Face ID)
- `SecurityContext.tsx` manages app lock state, PIN verification, WebAuthn biometric unlock, and auto-lock on page visibility change.
- `PasscodeLockModal.tsx` provides a full-screen dark security lock overlay with an interactive 4-digit numeric PIN pad, error shake animations, biometric fingerprint button, and **"Forgot PIN? Reset Lock"** emergency reset button.
- `SecuritySettingsModal.tsx` allows users to toggle App Lock ON/OFF, set/change 4-digit PIN, enable biometrics, configure auto-lock timeouts, or click **Turn Off Lock**.

### 9. Mobile-First UI & PWA Installability
- Mobile bottom navigation bar (`MobileBottomNav.tsx`) with center floating FAB `+` button.
- Bottom sheet modals (`rounded-t-3xl`) for touch devices.
- Service Worker (`sw.js`) registered using relative `BASE_URL` scope (`./sw.js`).
- iOS Safari installation banner explaining **Share ➔ Add to Home Screen**.

---

## Deployment to GitHub Pages

The application is pre-configured for automated deployment to **GitHub Pages** via GitHub Actions.

### Setup Instructions

1. **Push Code to GitHub**:
   Primary repository: `https://github.com/omkar8097/trackerAppp.git` on `main` branch.

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
   Pushing to `main` will automatically execute [.github/workflows/deploy.yml](file:///c:/Users/USER/.gemini/antigravity/scratch/expense-tracker-firebase/.github/workflows/deploy.yml), building the app with injected Secrets and deploying to `https://omkar8097.github.io/trackerAppp/`.

---

## Firebase Credential Protection & Firestore Security Rules

1. **Never Store Credentials in LocalStorage or UI Inputs**:
   - Credentials come strictly from build environment variables (`import.meta.env.VITE_FIREBASE_*`).

2. **Never Commit Secrets to Git**:
   - `.env` and `.env.*` files are explicitly ignored in [.gitignore](file:///c:/Users/USER/.gemini/antigravity/scratch/expense-tracker-firebase/.gitignore).

3. **Enforce Database Protection with Firestore Security Rules**:
   - Deploy the following rules in Firebase Console (**Firestore Database > Rules**):
     ```rules
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         // Transactions Collection Rules
         match /transactions/{transactionId} {
           allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
           allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
         }
         
         // Budgets Collection Rules
         match /budgets/{budgetId} {
           allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
           allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
         }

         // Categories Collection Rules
         match /categories/{categoryId} {
           allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
           allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
         }
       }
     }
     ```

---

## Development & Code Quality Guidelines

1. **TypeScript Typing**: Maintain explicit interfaces in [src/types/index.ts](file:///c:/Users/USER/.gemini/antigravity/scratch/expense-tracker-firebase/src/types/index.ts) for all entity models (`Transaction`, `Category`, `Budget`, `FilterOptions`).
2. **Payload Sanitization**: Ensure zero `undefined` values are passed to Cloud Firestore `addDoc()` / `updateDoc()`. Filter payloads using `Object.fromEntries(Object.entries(docData).filter(([_, v]) => v !== undefined))`.
3. **Build & Lint Checks**: Verify zero errors via `npm run build` and `npm run lint` before committing.
