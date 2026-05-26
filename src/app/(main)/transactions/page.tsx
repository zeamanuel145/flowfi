'use client';
import { useCallback, useEffect, useState } from 'react';
import { Search, Download, Plus, X } from 'lucide-react';
import { ITransaction } from '@/types';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

const EXPENSE_CATEGORIES = [
  'Food & Dining','Transport','Bills & Utilities','Shopping','Entertainment',
  'Health & Medical','Travel','Education','Subscriptions','Personal Care',
  'Home & Garden','Sports & Fitness','Gift','Other',
];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Interest', 'Refund', 'Bonus'];
const TRANSFER_CATEGORIES = ['Bank Transfer', 'Credit Card Payment', 'Cash Transfer', 'Peer-to-Peer', 'Internal Transfer'];
const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, ...TRANSFER_CATEGORIES];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editTx, setEditTx] = useState<ITransaction | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');

  const categoryOptions = type === 'income'
    ? INCOME_CATEGORIES
    : type === 'transfer'
      ? TRANSFER_CATEGORIES
      : type === 'expense'
        ? EXPENSE_CATEGORIES
        : ALL_CATEGORIES;

  useEffect(() => {
    if (category && !categoryOptions.includes(category)) {
      setCategory('');
    }
  }, [type, category, categoryOptions]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    if (category) params.set('category', category);

    try {
      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
      setTotal(data.pagination?.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, search, type, category]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const exportCSV = () => {
    const csv = Papa.unparse(transactions.map((t) => ({
      Date: new Date(t.date).toLocaleDateString(),
      Title: t.title,
      Amount: t.amount,
      Type: t.type,
      Category: t.category,
      Wallet: t.walletName || '',
      Note: t.note || '',
      User: t.userName || '',
    })));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `transactions-${Date.now()}.csv`;
    a.click();
    toast.success('Exported to CSV!');
  };

  const hasFilters = search || type || category;

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">{total} total transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={exportCSV}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
          <Button size="sm" className="rounded-xl gap-1.5 font-semibold" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search transactions..."
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={type || 'all'} onValueChange={(v) => { setType(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-36 rounded-xl">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category || 'all'} onValueChange={(v) => { setCategory(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44 rounded-xl">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="all">All categories</SelectItem>
            {categoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="icon" className="rounded-xl flex-shrink-0"
            onClick={() => { setSearch(''); setType(''); setCategory(''); setPage(1); }}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Transactions list */}
      <div className="glass-card p-4 md:p-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-xl shimmer" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💸</p>
            <p className="font-semibold">No transactions found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasFilters ? 'Try adjusting your filters' : 'Add your first transaction to get started'}
            </p>
          </div>
        ) : (
          <div>
            {transactions.map((t, i) => (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <TransactionItem
                  transaction={t}
                  onEdit={(tx) => { setEditTx(tx); setShowAdd(true); }}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl">
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="rounded-xl">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <AddTransactionDialog
        open={showAdd}
        onOpenChange={(v) => { setShowAdd(v); if (!v) setEditTx(null); }}
        onSuccess={fetchTransactions}
        transaction={editTx}
      />
    </div>
  );
}
