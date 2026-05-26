'use client';
import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Wallet, CreditCard, TrendingUp, Banknote, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { IWallet } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { WalletSchema, WalletInput } from '@/lib/validations';

const WALLET_COLORS = ['#10b981','#6366f1','#f59e0b','#ec4899','#ef4444','#14b8a6','#8b5cf6','#0ea5e9'];

const WalletIcon = ({ type }: { type: string }) => {
  const icons: Record<string, any> = { checking: CreditCard, savings: PiggyBank, credit: CreditCard, investment: TrendingUp, cash: Banknote };
  const Icon = icons[type] || Wallet;
  return <Icon className="w-5 h-5" />;
};

export default function WalletsPage() {
  const { setWallets: setStoreWallets } = useAppStore();
  const [wallets, setWallets] = useState<IWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editWallet, setEditWallet] = useState<IWallet | null>(null);
  const [selectedColor, setSelectedColor] = useState('#10b981');
  const [isShared, setIsShared] = useState(true);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<WalletInput>({
    resolver: zodResolver(WalletSchema),
    defaultValues: { type: 'checking', balance: 0, currency: 'USD', color: '#10b981', icon: '💳', isShared: true },
  });

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wallets');
      const data = await res.json();
      setWallets(data.wallets || []);
      setStoreWallets(data.wallets || []);
    } finally {
      setLoading(false);
    }
  }, [setStoreWallets]);

  useEffect(() => { fetchWallets(); }, [fetchWallets]);

  const onSubmit = async (data: WalletInput) => {
    try {
      const url = editWallet ? `/api/wallets/${editWallet._id}` : '/api/wallets';
      const method = editWallet ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, color: selectedColor, isShared }),
      });
      if (!res.ok) throw new Error();
      toast.success(editWallet ? 'Wallet updated!' : 'Wallet created!');
      setShowDialog(false);
      reset();
      fetchWallets();
    } catch {
      toast.error('Failed to save wallet');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this wallet? All associated transactions remain.')) return;
    try {
      await fetch(`/api/wallets/${id}`, { method: 'DELETE' });
      toast.success('Wallet deleted');
      fetchWallets();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);
  const positiveWallets = wallets.filter(w => w.balance >= 0);
  const totalAssets = positiveWallets.reduce((s, w) => s + w.balance, 0);
  const totalLiabilities = wallets.filter(w => w.balance < 0).reduce((s, w) => s + Math.abs(w.balance), 0);

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{wallets.length} accounts</p>
        <Button className="rounded-xl gap-1.5 font-semibold" onClick={() => { setEditWallet(null); reset({ type: 'checking', balance: 0, currency: 'USD', color: '#10b981', icon: '💳', isShared: true }); setSelectedColor('#10b981'); setIsShared(true); setShowDialog(true); }}>
          <Plus className="w-4 h-4" /> Add Wallet
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Net Worth', value: totalBalance, color: totalBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500', icon: ArrowUpRight, bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Total Assets', value: totalAssets, color: 'text-blue-600 dark:text-blue-400', icon: ArrowUpRight, bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Total Debt', value: totalLiabilities, color: 'text-red-600 dark:text-red-400', icon: ArrowDownRight, bg: 'bg-red-50 dark:bg-red-950/30' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass-card p-5">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', item.bg)}>
              <item.icon className={cn('w-4.5 h-4.5', item.color)} style={{ width: 18, height: 18 }} />
            </div>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className={cn('text-xl font-display font-bold mt-0.5 tabular-nums', item.color)}>{formatCurrency(item.value)}</p>
          </motion.div>
        ))}
      </div>

      {/* Wallets list */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-44 bg-card rounded-2xl border border-border/60 shimmer" />)}
        </div>
      ) : wallets.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-4xl mb-3">💳</p>
          <p className="font-semibold">No wallets yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Add your bank accounts, cards, and cash wallets</p>
          <Button onClick={() => setShowDialog(true)} className="rounded-xl">Add first wallet</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((w, i) => (
            <motion.div key={w._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass-card p-5 group relative overflow-hidden">
              {/* Color accent */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: w.color }} />

              <div className="flex items-start justify-between mb-4 mt-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${w.color}18` }}>
                    <span style={{ color: w.color }}><WalletIcon type={w.type} /></span>
                  </div>
                  <div>
                    <p className="font-semibold">{w.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{w.type}</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg"
                    onClick={() => { setEditWallet(w); setValue('name', w.name); setValue('type', w.type as any); setValue('balance', w.balance); setValue('currency', w.currency as any); setValue('description', w.description); setSelectedColor(w.color); setIsShared(w.isShared); setShowDialog(true); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-destructive hover:text-destructive"
                    onClick={() => handleDelete(w._id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-0.5">Balance</p>
                <p className={cn('text-2xl font-display font-bold tabular-nums', w.balance >= 0 ? 'text-foreground' : 'text-red-500')}>
                  {formatCurrency(w.balance, w.currency as any)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {w.isShared && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Shared</span>
                )}
                {w.description && (
                  <span className="text-xs text-muted-foreground truncate">{w.description}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editWallet ? 'Edit Wallet' : 'Add Wallet'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div>
              <Label>Wallet Name</Label>
              <Input {...register('name')} className="mt-1 rounded-xl" placeholder="e.g. Main Checking" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select onValueChange={(v) => setValue('type', v as any)} defaultValue={editWallet?.type || 'checking'}>
                  <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['checking','savings','credit','investment','cash'].map(t => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Balance</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input {...register('balance', { valueAsNumber: true })} type="number" step="0.01" className="pl-7 rounded-xl" placeholder="0.00" />
                </div>
              </div>
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-2">
                {WALLET_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setSelectedColor(c)}
                    className={cn('w-7 h-7 rounded-full transition-all', selectedColor === c ? 'ring-2 ring-offset-2 ring-offset-background scale-110' : '')}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea {...register('description')} className="mt-1 rounded-xl resize-none" rows={2} />
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <Label>Shared wallet</Label>
                <p className="text-xs text-muted-foreground">Shared with all users</p>
              </div>
              <Switch checked={isShared} onCheckedChange={setIsShared} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button type="submit" className="flex-1 rounded-xl font-semibold">{editWallet ? 'Update' : 'Add Wallet'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
