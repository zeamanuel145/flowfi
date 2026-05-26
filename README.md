# 💸 FlowFi — Smart Money Tracker

A production-grade shared money tracking web app for unlimited users. Built with Next.js 15, TypeScript, MongoDB, and Tailwind CSS.

![FlowFi Dashboard](https://placehold.co/1200x600/0d1117/10b981?text=FlowFi+Dashboard)

## ✨ Features

- 📊 **Dashboard** — Total balance, income vs expenses, recent transactions, budget + goal summaries
- 💳 **Transactions** — Add, edit, delete; search & filter by type, category, wallet; CSV export
- 📈 **Analytics** — Monthly trends, category breakdown, weekly spending, year-over-year comparison
- 🎯 **Budgets** — Per-category monthly budgets with real-time progress and alerts
- 🐷 **Savings Goals** — Goals with progress bars, deadlines, and fund-adding flow
- 💼 **Wallets** — Multiple accounts (checking, savings, credit, investment, cash)
- 🔄 **Recurring** — Track subscriptions and recurring bills; pause/activate
- 🌙 **Dark/Light mode** — Persisted system preference
- 👥 **Multi-user shared** — Activity attributed per user, no login required
- 💱 **Currency support** — USD, EUR, GBP, ETB, JPY, and more

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + Shadcn UI |
| Database | MongoDB + Mongoose |
| State | Zustand (persisted) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Animations | Framer Motion |
| Notifications | Sonner |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works great)
- pnpm / npm / yarn

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/flowfi.git
cd flowfi
npm install
```

### 2. Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/flowfi?retryWrites=true&w=majority
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Seed Sample Data

Either visit **Settings → Seed Data** in the app, or run:

```bash
npm run seed
```

This creates:
- 5 wallets (checking, savings, investment, cash, credit)
- ~150 transactions across 6 months
- 10 monthly budgets
- 4 savings goals

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (app)/                  # App layout with sidebar
│   │   ├── dashboard/          # Main dashboard
│   │   ├── transactions/       # Transaction list + CRUD
│   │   ├── analytics/          # Charts & insights
│   │   ├── budgets/            # Budget planning
│   │   ├── goals/              # Savings goals
│   │   ├── wallets/            # Wallet management
│   │   ├── recurring/          # Recurring payments
│   │   └── settings/           # App settings
│   ├── api/                    # API routes
│   │   ├── transactions/
│   │   ├── wallets/
│   │   ├── budgets/
│   │   ├── goals/
│   │   ├── analytics/
│   │   ├── recurring/
│   │   └── seed/
│   └── layout.tsx
├── components/
│   ├── ui/                     # Shadcn UI primitives
│   ├── layout/                 # Sidebar, TopBar, ThemeProvider
│   ├── dashboard/              # StatCard
│   ├── transactions/           # TransactionItem, AddTransactionDialog
│   ├── charts/                 # IncomeExpenseChart, CategoryPieChart
│   ├── budgets/                # BudgetProgress
│   └── goals/                  # SavingsGoalCard
├── lib/
│   ├── db/connect.ts           # MongoDB connection
│   ├── store/index.ts          # Zustand store
│   ├── utils/index.ts          # Helpers (formatCurrency, etc.)
│   └── validations/index.ts    # Zod schemas
├── models/                     # Mongoose models
│   ├── Transaction.ts
│   ├── Wallet.ts
│   ├── Budget.ts
│   └── SavingsGoal.ts
├── types/index.ts              # Shared TypeScript types
└── styles/globals.css          # Tailwind + CSS variables
```

---

## ☁️ Deploying to Vercel

### 1. Push to GitHub

```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/your-username/flowfi.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Add environment variables:
   - `MONGODB_URI` — your Atlas connection string
   - `NEXT_PUBLIC_APP_URL` — your Vercel URL (e.g. `https://flowfi.vercel.app`)
4. Click **Deploy**

### 3. Configure MongoDB Atlas

In Atlas → Network Access:
- Add IP `0.0.0.0/0` (allow all, required for Vercel serverless)

Or use a more secure approach with Vercel's static IPs via a proxy.

---

## 🗄 MongoDB Atlas Setup

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write access
3. Whitelist IP `0.0.0.0/0` under Network Access
4. Get the connection string from **Connect → Drivers**
5. Replace `<password>` and `<cluster>` in your `.env.local`

---

## 🧩 Customization

### Add a new user
Edit `src/types/index.ts` → `SHARED_USERS` array.

### Add a new category
Edit `src/types/index.ts` → `TransactionCategory` type, `CATEGORY_COLORS`, and `CATEGORY_ICONS`.

### Change default currency
Edit `src/lib/store/index.ts` → `currency: 'USD'` default.

---

## 📄 License

MIT — free to use for personal projects.
