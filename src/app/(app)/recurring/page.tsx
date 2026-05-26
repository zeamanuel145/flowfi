'use client';
import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Repeat2,  CheckCircle2, PauseCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';

const CATEGORIES = [
  'Bills & Utilities','Subscriptions','Health & Medical','Transport',
  'Food & Dining','Entertainment','Personal Care','Education','Other',
];

interface RecurringPayment {
  _id: string;
  title: string;
  amount: number;
  category: string;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDue: string;
  walletId: string;
  isActive: boolean;
  currency: string;
  description?: string;
  createdAt: string;
}

export default function RecurringPage() {
  const { wallets } = useAppStore();
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editPayment, setEditPayment] = useState<RecurringPayment | null>(null);
  const [form, setForm] = useState({
    title: '', amount: '', category: 'Subscriptions', interval: 'monthly',
    nextDue: new Date().toISOString().split('T')[0], walletId: '',
    isActive: true, currency: 'USD', description: '',
  });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recurring');
      const data = await res.json();
      setPayments(data.payments || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleSave = async () => {
    if (!form.title || !form.amount || !form.walletId) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const url = editPayment ? `/api/recurring/${editPayment._id}` : '/api/recurring';
      const method = editPayment ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      if (!res.ok) throw new Error();
      toast.success(editPayment ? 'Payment updated!' : 'Recurring payment added!');
      setShowDialog(false);
      resetForm();
      fetchPayments();
    } catch {
      toast.error('Failed to save payment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this recurring payment?')) return;
    try {
      await fetch(`/api/recurring/${id}`, { method: 'DELETE' });
      toast.success('Deleted');
      fetchPayments();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleActive = async (payment: RecurringPayment) => {
    try {
      await fetch(`/api/recurring/${payment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payment, isActive: !payment.isActive }),
      });
      fetchPayments();
    } catch {
      toast.error('Failed to update');
    }
  };

  const resetForm = () => {
    setForm({ title: '', amount: '', category: 'Subscriptions', interval: 'monthly', nextDue: new Date().toISOString().split('T')[0], walletId: wallets[0]?._id || '', isActive: true, currency: 'USD', description: '' });
    setEditPayment(null);
  };

  const activePayments = payments.filter(p => p.isActive);
  const totalMonthly = activePayments.reduce((s, p) => {
    const multipliers: Record<string, number> = { daily: 30, weekly: 4.33, monthly: 1, yearly: 1 / 12 };
    return s + p.amount * (multipliers[p.interval] || 1);
  }, 0);

  const getDueBadge = (nextDue: string) => {
    const days = Math.ceil((new Date(nextDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'Overdue', color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' };
    if (days <= 3) return { label: `Due in ${days}d`, color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' };
    if (days <= 7) return { label: `${days} days`, color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' };
    return { label: formatDate(nextDue), color: 'bg-muted text-muted-foreground' };
  };

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{activePayments.length} active · {formatCurrency(totalMonthly)}/mo</p>
        <Button className="rounded-xl gap-1.5 font-semibold" onClick={() => { resetForm(); setShowDialog(true); }}>
          <Plus className="w-4 h-4" /> Add Recurring
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Monthly Cost', value: formatCurrency(totalMonthly), color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', icon: Repeat2 },
          { label: 'Active Subscriptions', value: String(activePayments.length), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: CheckCircle2 },
          { label: 'Paused', value: String(payments.filter(p => !p.isActive).length), color: 'text-muted-foreground', bg: 'bg-muted', icon: PauseCircle },
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

      {/* Payments list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-card rounded-2xl border border-border/60 shimmer" />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-4xl mb-3">🔄</p>
          <p className="font-semibold">No recurring payments</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Track subscriptions and regular bills</p>
          <Button onClick={() => setShowDialog(true)} className="rounded-xl">Add first recurring payment</Button>
        </div>
      ) : (
        <div className="glass-card divide-y divide-border/40 overflow-hidden">
          {payments.map((p, i) => {
            const color = CATEGORY_COLORS[p.category as keyof typeof CATEGORY_COLORS] || '#6b7280';
            const icon = CATEGORY_ICONS[p.category as keyof typeof CATEGORY_ICONS] || '📦';
            const due = getDueBadge(p.nextDue);
            return (
              <motion.div key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className={cn('flex items-center gap-4 p-4 group hover:bg-accent/30 transition-colors', !p.isActive && 'opacity-50')}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: `${color}18` }}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{p.title}</p>
                    <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', due.color)}>{due.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">{p.category} · {p.interval}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold tabular-nums">{formatCurrency(p.amount, p.currency as any)}</p>
                  <p className="text-xs text-muted-foreground capitalize">per {p.interval}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg"
                    onClick={() => toggleActive(p)}
                    title={p.isActive ? 'Pause' : 'Activate'}>
                    {p.isActive ? <PauseCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg"
                    onClick={() => { setEditPayment(p); setForm({ title: p.title, amount: String(p.amount), category: p.category, interval: p.interval, nextDue: new Date(p.nextDue).toISOString().split('T')[0], walletId: p.walletId, isActive: p.isActive, currency: p.currency, description: p.description || '' }); setShowDialog(true); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-destructive hover:text-destructive"
                    onClick={() => handleDelete(p._id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(v) => { setShowDialog(v); if (!v) resetForm(); }}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editPayment ? 'Edit Recurring' : 'Add Recurring Payment'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Name</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1 rounded-xl" placeholder="e.g. Netflix, Spotify" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} type="number" step="0.01" className="pl-7 rounded-xl" placeholder="0.00" />
                </div>
              </div>
              <div>
                <Label>Interval</Label>
                <Select value={form.interval} onValueChange={v => setForm(f => ({ ...f, interval: v }))}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['daily','weekly','monthly','yearly'].map(i => <SelectItem key={i} value={i} className="capitalize">{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-48">
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Next Due</Label>
                <Input type="date" value={form.nextDue} onChange={e => setForm(f => ({ ...f, nextDue: e.target.value }))} className="mt-1 rounded-xl" />
              </div>
            </div>
            <div>
              <Label>Wallet</Label>
              <Select value={form.walletId} onValueChange={v => setForm(f => ({ ...f, walletId: v }))}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder="Select wallet" /></SelectTrigger>
                <SelectContent>
                  {wallets.map(w => <SelectItem key={w._id} value={w._id}>{w.icon} {w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between py-1">
              <Label>Active</Label>
              <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleSave} className="flex-1 rounded-xl font-semibold">{editPayment ? 'Update' : 'Add'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
