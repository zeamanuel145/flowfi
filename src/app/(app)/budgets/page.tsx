'use client';
import { useCallback, useEffect, useState } from 'react';
import { Plus, Target, AlertTriangle, CheckCircle2, Trash2, Pencil } from 'lucide-react';
import { IBudget } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BudgetProgress } from '@/components/budgets/BudgetProgress';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BudgetSchema, BudgetInput } from '@/lib/validations';

const EXPENSE_CATS = [
  'Food & Dining','Transport','Bills & Utilities','Shopping','Entertainment',
  'Health & Medical','Travel','Education','Subscriptions','Personal Care',
  'Home & Garden','Sports & Fitness','Other',
];

const now = new Date();

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<IBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editBudget, setEditBudget] = useState<IBudget | null>(null);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<BudgetInput>({
    resolver: zodResolver(BudgetSchema),
    defaultValues: { month, year, currency: 'USD', alerts: true, alertThreshold: 80, period: 'monthly' },
  });

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets?month=${month}&year=${year}`);
      const data = await res.json();
      setBudgets(data.budgets || []);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const onSubmit = async (data: BudgetInput) => {
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, month, year }),
      });
      if (!res.ok) throw new Error();
      toast.success(editBudget ? 'Budget updated!' : 'Budget created!');
      setShowDialog(false);
      reset();
      fetchBudgets();
    } catch {
      toast.error('Failed to save budget');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      toast.success('Budget deleted');
      fetchBudgets();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget = budgets.filter((b) => b.spent > b.limit);
  const nearLimit = budgets.filter((b) => b.spent / b.limit >= 0.8 && b.spent <= b.limit);

  const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }));
  const YEARS = [2024, 2025, 2026];

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-3">
          <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
            <SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-24 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button className="rounded-xl gap-1.5 font-semibold" onClick={() => { setEditBudget(null); reset({ month, year, currency: 'USD', alerts: true, alertThreshold: 80, period: 'monthly' }); setShowDialog(true); }}>
          <Plus className="w-4 h-4" /> Set Budget
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget', value: formatCurrency(totalBudget), icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Total Spent', value: formatCurrency(totalSpent), icon: Target, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-950/30' },
          { label: 'Remaining', value: formatCurrency(Math.max(totalBudget - totalSpent, 0)), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-950/30' },
          { label: 'Over Budget', value: `${overBudget.length} categories`, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-950/30' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass-card p-5">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', item.bg)}>
              <item.icon className={cn('w-4.5 h-4.5', item.color)} style={{ width: 18, height: 18 }} />
            </div>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className={cn('text-xl font-display font-bold mt-0.5', item.color)}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {(overBudget.length > 0 || nearLimit.length > 0) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card p-4 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="font-semibold text-sm text-amber-700 dark:text-amber-400">Budget Alerts</p>
          </div>
          <div className="space-y-1">
            {overBudget.map(b => (
              <p key={b._id} className="text-xs text-amber-700 dark:text-amber-400">
                ⚠️ <strong>{b.category}</strong> is over budget by {formatCurrency(b.spent - b.limit)}
              </p>
            ))}
            {nearLimit.map(b => (
              <p key={b._id} className="text-xs text-amber-600 dark:text-amber-500">
                🔶 <strong>{b.category}</strong> is at {Math.round((b.spent / b.limit) * 100)}% of budget
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Budget grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-36 bg-card rounded-2xl border border-border/60 shimmer" />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-semibold">No budgets set</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Set spending limits to stay on track</p>
          <Button onClick={() => setShowDialog(true)} className="rounded-xl">Set your first budget</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b, i) => (
            <motion.div key={b._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="relative group">
              <BudgetProgress budget={b} />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg bg-background/80"
                  onClick={() => { setEditBudget(b); setValue('category', b.category); setValue('limit', b.limit); setShowDialog(true); }}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg bg-background/80 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(b._id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editBudget ? 'Edit Budget' : 'Set Budget'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div>
              <Label>Category</Label>
              <Select onValueChange={(v) => setValue('category', v)} defaultValue={editBudget?.category}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="max-h-56">
                  {EXPENSE_CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <Label>Monthly Limit</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                <Input {...register('limit', { valueAsNumber: true })} type="number" step="0.01" className="pl-7 rounded-xl" placeholder="500.00" />
              </div>
              {errors.limit && <p className="text-xs text-destructive mt-1">{errors.limit.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button type="submit" className="flex-1 rounded-xl font-semibold">{editBudget ? 'Update' : 'Set Budget'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
