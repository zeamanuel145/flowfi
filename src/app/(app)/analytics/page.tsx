'use client';
import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCompactCurrency, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const YEARS = [2024, 2025, 2026];

export default function AnalyticsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?year=${year}`)
      .then(r => r.json())
      .then(d => { setAnalytics(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [year]);

  const totalIncome = analytics?.monthlyTrend?.reduce((s: number, m: any) => s + m.income, 0) || 0;
  const totalExpenses = analytics?.monthlyTrend?.reduce((s: number, m: any) => s + m.expenses, 0) || 0;
  const totalSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs">
          <p className="font-semibold mb-1.5">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-muted-foreground capitalize">{p.name}:</span>
              <span className="font-semibold">{formatCompactCurrency(p.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Year selector */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Financial analytics and insights</p>
        <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
          <SelectTrigger className="w-28 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: totalIncome, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: TrendingUp },
          { label: 'Total Expenses', value: totalExpenses, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', icon: TrendingDown },
          { label: 'Net Savings', value: totalSavings, color: totalSavings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: Minus },
          { label: 'Savings Rate', value: null, text: `${savingsRate.toFixed(1)}%`, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30', icon: TrendingUp },
        ].map((item, i) => (
          <motion.div key={item.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5"
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', item.bg)}>
              <item.icon className={cn('w-4.5 h-4.5', item.color)} style={{ width: 18, height: 18 }} />
            </div>
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className={cn('text-2xl font-display font-bold mt-0.5 tabular-nums', item.color)}>
              {item.text || formatCompactCurrency(item.value!)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Monthly trends */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="glass-card p-6">
        <h3 className="font-display font-semibold mb-1">Monthly Cash Flow</h3>
        <p className="text-xs text-muted-foreground mb-5">Income, expenses, and savings throughout {year}</p>
        {loading ? <div className="h-64 shimmer rounded-xl" /> : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={analytics?.monthlyTrend || []} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                {['income', 'expenses', 'savings'].map((key, i) => {
                  const colors = ['#10b981', '#ef4444', '#6366f1'];
                  return (
                    <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors[i]} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={colors[i]} stopOpacity={0} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => formatCompactCurrency(v)} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#grad-income)" dot={false} />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#grad-expenses)" dot={false} />
              <Area type="monotone" dataKey="savings" stroke="#6366f1" strokeWidth={2} fill="url(#grad-savings)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Category + Year comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="glass-card p-6">
          <h3 className="font-display font-semibold mb-1">Spending by Category</h3>
          <p className="text-xs text-muted-foreground mb-5">Current month breakdown</p>
          {loading ? <div className="h-64 shimmer rounded-xl" /> : (
            <div className="flex gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={analytics?.categoryBreakdown || []} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="amount">
                    {(analytics?.categoryBreakdown || []).map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [formatCurrency(v), '']}
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[200px] scrollbar-thin pr-1">
                {(analytics?.categoryBreakdown || []).map((item: any) => (
                  <div key={item.category} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground truncate flex-1">{item.category}</span>
                    <span className="text-xs font-bold tabular-nums">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Year comparison */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card p-6">
          <h3 className="font-display font-semibold mb-1">Year-over-Year Expenses</h3>
          <p className="text-xs text-muted-foreground mb-5">{year} vs {year - 1}</p>
          {loading ? <div className="h-64 shimmer rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics?.yearlyComparison || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => formatCompactCurrency(v)} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="current" name={String(year)} fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="previous" name={String(year - 1)} fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Weekly spending */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="glass-card p-6">
        <h3 className="font-display font-semibold mb-1">Weekly Spending Pattern</h3>
        <p className="text-xs text-muted-foreground mb-5">Last 7 days</p>
        {loading ? <div className="h-48 shimmer rounded-xl" /> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={analytics?.weeklySpending || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => formatCompactCurrency(v)} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" name="Spent" radius={[6, 6, 0, 0]}>
                {(analytics?.weeklySpending || []).map((_: any, i: number) => (
                  <Cell key={i} fill={`hsl(${161 + i * 10}, 84%, ${35 + i * 3}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}
