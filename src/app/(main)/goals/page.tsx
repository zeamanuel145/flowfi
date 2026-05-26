'use client';
import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, PiggyBank, CheckCircle2, TrendingUp } from 'lucide-react';
import { ISavingsGoal } from '@/types';
import { SavingsGoalCard } from '@/components/goals/SavingsGoalCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SavingsGoalSchema, SavingsGoalInput } from '@/lib/validations';

const GOAL_ICONS = ['🎯','🏠','✈️','💻','🚗','🎓','💍','🏋️','📱','🛥️','🎸','🌴','💊','🏦','🎁'];
const GOAL_COLORS = ['#10b981','#6366f1','#f59e0b','#ec4899','#14b8a6','#ef4444','#8b5cf6','#0ea5e9','#84cc16','#f97316'];

export default function GoalsPage() {
  const [goals, setGoals] = useState<ISavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editGoal, setEditGoal] = useState<ISavingsGoal | null>(null);
  const [addFundsGoal, setAddFundsGoal] = useState<ISavingsGoal | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState('#10b981');

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<SavingsGoalInput>({
    resolver: zodResolver(SavingsGoalSchema),
    defaultValues: { currency: 'USD', color: '#10b981', icon: '🎯', currentAmount: 0 },
  });

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/goals');
      const data = await res.json();
      setGoals(data.goals || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const onSubmit = async (data: SavingsGoalInput) => {
    try {
      const url = editGoal ? `/api/goals/${editGoal._id}` : '/api/goals';
      const method = editGoal ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, icon: selectedIcon, color: selectedColor }),
      });
      if (!res.ok) throw new Error();
      toast.success(editGoal ? 'Goal updated!' : 'Goal created!');
      setShowDialog(false);
      reset();
      fetchGoals();
    } catch {
      toast.error('Failed to save goal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this savings goal?')) return;
    try {
      await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      toast.success('Goal deleted');
      fetchGoals();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleAddFunds = async () => {
    if (!addFundsGoal || !addAmount) return;
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) { toast.error('Enter a valid amount'); return; }
    try {
      const newAmount = Math.min(addFundsGoal.currentAmount + amount, addFundsGoal.targetAmount);
      const isCompleted = newAmount >= addFundsGoal.targetAmount;
      await fetch(`/api/goals/${addFundsGoal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addFundsGoal, currentAmount: newAmount, isCompleted }),
      });
      toast.success(isCompleted ? '🎉 Goal completed!' : `Added ${formatCurrency(amount)}!`);
      setAddFundsGoal(null);
      setAddAmount('');
      fetchGoals();
    } catch {
      toast.error('Failed to add funds');
    }
  };

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const completed = goals.filter(g => g.isCompleted).length;

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{goals.length} goals · {completed} completed</p>
        </div>
        <Button className="rounded-xl gap-1.5 font-semibold" onClick={() => { setEditGoal(null); reset({ currency: 'USD', color: '#10b981', icon: '🎯', currentAmount: 0 }); setSelectedIcon('🎯'); setSelectedColor('#10b981'); setShowDialog(true); }}>
          <Plus className="w-4 h-4" /> New Goal
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Saved', value: formatCurrency(totalSaved), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: PiggyBank },
          { label: 'Target Amount', value: formatCurrency(totalTarget), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: TrendingUp },
          { label: 'Goals Completed', value: `${completed}/${goals.length}`, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30', icon: CheckCircle2 },
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

      {/* Goals grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-card rounded-2xl border border-border/60 shimmer" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-4xl mb-3">🐷</p>
          <p className="font-semibold">No savings goals yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Set a goal and start saving toward it</p>
          <Button onClick={() => setShowDialog(true)} className="rounded-xl">Create your first goal</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g, i) => (
            <motion.div key={g._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="relative group">
              <SavingsGoalCard goal={g} />
              {/* Actions */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {!g.isCompleted && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 rounded-lg bg-background/80 text-xs font-semibold"
                    onClick={() => { setAddFundsGoal(g); setAddAmount(''); }}>
                    + Add
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg bg-background/80"
                  onClick={() => { setEditGoal(g); setValue('name', g.name); setValue('targetAmount', g.targetAmount); setValue('currentAmount', g.currentAmount); setValue('description', g.description); setSelectedIcon(g.icon); setSelectedColor(g.color); setShowDialog(true); }}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg bg-background/80 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(g._id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Goal Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[460px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editGoal ? 'Edit Goal' : 'New Savings Goal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {/* Icon & Color pickers */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {GOAL_ICONS.map(ic => (
                  <button key={ic} type="button" onClick={() => setSelectedIcon(ic)}
                    className={cn('w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all', selectedIcon === ic ? 'ring-2 ring-primary bg-primary/10 scale-110' : 'bg-muted hover:bg-accent')}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {GOAL_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setSelectedColor(c)}
                    className={cn('w-7 h-7 rounded-full transition-all', selectedColor === c ? 'ring-2 ring-offset-2 ring-offset-background scale-110' : '')}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <Label>Goal Name</Label>
              <Input {...register('name')} className="mt-1 rounded-xl" placeholder="e.g. Europe Vacation" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Target Amount</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input {...register('targetAmount', { valueAsNumber: true })} type="number" step="0.01" className="pl-7 rounded-xl" placeholder="5000" />
                </div>
                {errors.targetAmount && <p className="text-xs text-destructive mt-1">{errors.targetAmount.message}</p>}
              </div>
              <div>
                <Label>Current Amount</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input {...register('currentAmount', { valueAsNumber: true })} type="number" step="0.01" className="pl-7 rounded-xl" placeholder="0" />
                </div>
              </div>
            </div>
            <div>
              <Label>Deadline (optional)</Label>
              <Input {...register('deadline')} type="date" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea {...register('description')} className="mt-1 rounded-xl resize-none" rows={2} placeholder="What are you saving for?" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button type="submit" className="flex-1 rounded-xl font-semibold">{editGoal ? 'Update' : 'Create Goal'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Funds Dialog */}
      <Dialog open={!!addFundsGoal} onOpenChange={() => setAddFundsGoal(null)}>
        <DialogContent className="sm:max-w-[360px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Add Funds to Goal</DialogTitle>
          </DialogHeader>
          {addFundsGoal && (
            <div className="space-y-4 mt-2">
              <div className="glass-card p-4 flex items-center gap-3">
                <span className="text-2xl">{addFundsGoal.icon}</span>
                <div>
                  <p className="font-semibold">{addFundsGoal.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(addFundsGoal.currentAmount)} / {formatCurrency(addFundsGoal.targetAmount)}
                  </p>
                </div>
              </div>
              <div>
                <Label>Amount to add</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                  <Input value={addAmount} onChange={e => setAddAmount(e.target.value)} type="number" step="0.01" className="pl-7 text-lg font-bold rounded-xl" placeholder="0.00" autoFocus />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setAddFundsGoal(null)} className="flex-1 rounded-xl">Cancel</Button>
                <Button onClick={handleAddFunds} className="flex-1 rounded-xl font-semibold">Add Funds</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
