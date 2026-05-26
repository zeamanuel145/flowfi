'use client';
import { useEffect, useState, useCallback } from 'react';
import {  TrendingUp, TrendingDown, PiggyBank, Wallet2,  ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { BudgetProgress } from '@/components/budgets/BudgetProgress';
import { SavingsGoalCard } from '@/components/goals/SavingsGoalCard';
import { ITransaction, IWallet, IBudget, ISavingsGoal } from '@/types';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { currency, setWallets, setRecentTransactions } = useAppStore();
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [wallets, setWalletsLocal] = useState<IWallet[]>([]);
  const [budgets, setBudgets] = useState<IBudget[]>([]);
  const [goals, setGoals] = useState<ISavingsGoal[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const [txRes, walletRes, budgetRes, goalRes, analyticsRes] = await Promise.all([
        fetch('/api/transactions?limit=8'),
        fetch('/api/wallets'),
        fetch(`/api/budgets?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
        fetch('/api/goals'),
        fetch(`/api/analytics?year=${now.getFullYear()}`),
      ]);

      const safeJson = async (res: Response) => {
        if (!res) return {};
        // Try reading text first to avoid Response.json() throwing on empty bodies
        let text = '';
        try {
          text = await res.text();
        } catch {
          return {};
        }
        if (!text) return {};
        try {
          return JSON.parse(text);
        } catch (err) {
          console.error('Failed to parse JSON from', res.url, err);
          return {};
        }
      };

      const [txData, walletData, budgetData, goalData, analyticsData] = await Promise.all([
        safeJson(txRes), safeJson(walletRes), safeJson(budgetRes), safeJson(goalRes), safeJson(analyticsRes),
      ]);
      setTransactions(txData.transactions || []);
      setWalletsLocal(walletData.wallets || []);
      setWallets(walletData.wallets || []);
      setRecentTransactions(txData.transactions || []);
      setBudgets(budgetData.budgets || []);
      setGoals(goalData.goals || []);
      setAnalytics(analyticsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [setRecentTransactions, setWallets]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const now = new Date();
  const currentMonth = analytics?.monthlyTrend?.[now.getMonth()];
  const prevMonth = analytics?.monthlyTrend?.[now.getMonth() - 1];
  const monthlyIncome = currentMonth?.income || 0;
  const monthlyExpenses = currentMonth?.expenses || 0;
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const expenseChange = prevMonth ? ((monthlyExpenses - prevMonth.expenses) / (prevMonth.expenses || 1)) * 100 : 0;
  const incomeChange = prevMonth ? ((monthlyIncome - prevMonth.income) / (prevMonth.income || 1)) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-2xl border border-border/60" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-card rounded-2xl border border-border/60" />
          <div className="h-72 bg-card rounded-2xl border border-border/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Good morning 👋</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Here&apos;s your financial overview for {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value={totalBalance} currency={currency}
          icon={Wallet2} iconBg="bg-primary/10" iconColor="text-primary" index={0}
          changeLabel={`${wallets.length} wallets`} />
        <StatCard title="Monthly Income" value={monthlyIncome} currency={currency}
          icon={TrendingUp} iconBg="bg-emerald-100 dark:bg-emerald-950/40" iconColor="text-emerald-600 dark:text-emerald-400"
          change={incomeChange} variant="positive" index={1} />
        <StatCard title="Monthly Expenses" value={monthlyExpenses} currency={currency}
          icon={TrendingDown} iconBg="bg-red-100 dark:bg-red-950/40" iconColor="text-red-600 dark:text-red-400"
          change={expenseChange} variant="negative" index={2} />
        <StatCard title="Net Savings" value={monthlySavings} currency={currency}
          icon={PiggyBank} iconBg="bg-blue-100 dark:bg-blue-950/40" iconColor="text-blue-600 dark:text-blue-400"
          index={3} variant={monthlySavings >= 0 ? 'positive' : 'negative'} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Income vs Expenses</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly comparison this year</p>
            </div>
          </div>
          <IncomeExpenseChart data={analytics?.monthlyTrend || []} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Spending by Category</h3>
              <p className="text-xs text-muted-foreground mt-0.5">This month</p>
            </div>
          </div>
          <CategoryPieChart data={analytics?.categoryBreakdown || []} />
        </motion.div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Recent Transactions</h3>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="gap-1 text-xs rounded-lg">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border/40">
            {transactions.map((t) => (
              <TransactionItem key={t._id} transaction={t} compact />
            ))}
            {transactions.length === 0 && (
              <p className="text-muted-foreground text-sm py-8 text-center">No transactions yet</p>
            )}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Budget Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Budgets</h3>
              <Link href="/budgets">
                <Button variant="ghost" size="sm" className="gap-1 text-xs rounded-lg">
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {budgets.slice(0, 4).map((b) => (
                <BudgetProgress key={b._id} budget={b} compact />
              ))}
            </div>
          </motion.div>

          {/* Savings Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Savings Goals</h3>
              <Link href="/goals">
                <Button variant="ghost" size="sm" className="gap-1 text-xs rounded-lg">
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {goals.slice(0, 3).map((g) => (
                <SavingsGoalCard key={g._id} goal={g} compact />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
