'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TransactionSchema, TransactionInput } from '@/lib/validations';
import { ITransaction } from '@/types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';

const EXPENSE_CATEGORIES = [
  'Food & Dining','Transport','Bills & Utilities','Shopping','Entertainment',
  'Health & Medical','Travel','Education','Subscriptions','Personal Care',
  'Home & Garden','Sports & Fitness','Gift','Other',
];

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Interest', 'Refund', 'Bonus'];
const TRANSFER_CATEGORIES = ['Bank Transfer', 'Credit Card Payment', 'Cash Transfer', 'Peer-to-Peer', 'Internal Transfer'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  transaction?: ITransaction | null;
}

export function AddTransactionDialog({ open, onOpenChange, onSuccess, transaction }: Props) {
  const { wallets } = useAppStore();
  const [loading, setLoading] = useState(false);
  const isEdit = !!transaction;

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransactionInput>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      currency: 'USD',
    },
  });

  const selectedType = watch('type');
  const selectedCategory = watch('category');
  const categoryOptions = selectedType === 'income'
    ? INCOME_CATEGORIES
    : selectedType === 'transfer'
      ? TRANSFER_CATEGORIES
      : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (transaction && open) {
      reset({
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: new Date(transaction.date).toISOString().split('T')[0],
        walletId: transaction.walletId,
        note: transaction.note,
        isRecurring: transaction.isRecurring,
        currency: transaction.currency as any,
      });
    } else if (!isEdit && open) {
      reset({
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        currency: 'USD',
      });
    }
  }, [transaction, open, isEdit, reset]);

  useEffect(() => {
    if (selectedCategory && !categoryOptions.includes(selectedCategory)) {
      setValue('category', '');
    }
  }, [selectedType, selectedCategory, categoryOptions, setValue]);

  const onSubmit = async (data: TransactionInput) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/transactions/${transaction!._id}` : '/api/transactions';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(isEdit ? 'Transaction updated!' : 'Transaction added!');
      onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Type selector */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            {(['expense', 'income', 'transfer'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setValue('type', t);
                  if (t !== selectedType) setValue('category', '');
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${
                  selectedType === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <Label>Amount</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
              <Input
                {...register('amount', { valueAsNumber: true })}
                className="pl-7 text-lg font-bold rounded-xl"
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </div>
            {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
          </div>

          {/* Title */}
          <div>
            <Label>Description</Label>
            <Input {...register('title')} className="mt-1 rounded-xl" placeholder="e.g. Grocery Shopping" />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <Label>Category</Label>
              <Select onValueChange={(v) => setValue('category', v)} defaultValue={transaction?.category}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
            </div>

            {/* Date */}
            <div>
              <Label>Date</Label>
              <Input {...register('date')} type="date" className="mt-1 rounded-xl" />
            </div>
          </div>

          {/* Wallet */}
          <div>
            <Label>Wallet</Label>
            <Select onValueChange={(v) => setValue('walletId', v)} defaultValue={transaction?.walletId}>
              <SelectTrigger className="mt-1 rounded-xl">
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((w) => (
                  <SelectItem key={w._id} value={w._id}>
                    {w.icon} {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.walletId && <p className="text-xs text-destructive mt-1">{errors.walletId.message}</p>}
          </div>

          {/* Note */}
          <div>
            <Label>Note (optional)</Label>
            <Textarea {...register('note')} className="mt-1 rounded-xl resize-none" rows={2} placeholder="Add a note..." />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 rounded-xl font-semibold">
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
