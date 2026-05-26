'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/lib/store';
import { CURRENCIES, Currency } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Database, Download, RefreshCw, Palette, Bell, Globe, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSeed = async () => {
    if (!confirm('This will replace all existing data with sample data. Continue?')) return;
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('Database seeded with sample data!');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.error('Failed to seed database');
    } finally {
      setSeeding(false);
    }
  };

  const THEME_OPTIONS = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-display font-semibold">{title}</h3>
      </div>
      {children}
    </motion.div>
  );

  return (
    <div className="space-y-6 max-w-[720px]">
      {/* Appearance */}
      <Section title="Appearance" icon={Palette}>
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-medium">Theme</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
                const isActive = mounted && theme === value;
                const buttonClasses = cn(
                  'flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all',
                  isActive ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-border/80 hover:bg-accent'
                );

                return (
                  <button key={value} onClick={() => setTheme(value)} className={buttonClasses}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* Localization */}
      <Section title="Localization" icon={Globe}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Default Currency</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Used for display and new transactions</p>
            </div>
            <Select value={currency} onValueChange={(v) => { setCurrency(v as Currency); toast.success(`Currency set to ${v}`); }}>
              <SelectTrigger className="w-36 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
                  <SelectItem key={code} value={code}>
                    <span className="font-mono mr-1">{symbol}</span> {code} — {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <div className="space-y-4">
          {[
            { label: 'Budget alerts', desc: 'Notify when spending exceeds 80% of budget', default: true },
            { label: 'Recurring payment reminders', desc: '3 days before a payment is due', default: true },
            { label: 'Goal milestones', desc: 'When you reach 25%, 50%, 75%, and 100%', default: true },
            { label: 'Weekly spending report', desc: 'Summary every Monday morning', default: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.default} />
            </div>
          ))}
        </div>
      </Section>

      {/* Data Management */}
      <Section title="Data Management" icon={Database}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Seed sample data</p>
              <p className="text-xs text-muted-foreground mt-0.5">Replace all data with realistic example transactions</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={handleSeed} disabled={seeding}>
              <RefreshCw className={cn('w-3.5 h-3.5', seeding && 'animate-spin')} />
              {seeding ? 'Seeding...' : 'Seed Data'}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Export all data</p>
              <p className="text-xs text-muted-foreground mt-0.5">Download a full CSV export of all transactions</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5"
              onClick={async () => {
                const res = await fetch('/api/transactions?limit=10000');
                const data = await res.json();
                const Papa = (await import('papaparse')).default;
                const csv = Papa.unparse(data.transactions.map((t: any) => ({
                  Date: new Date(t.date).toLocaleDateString(),
                  Title: t.title, Amount: t.amount, Type: t.type,
                  Category: t.category, Wallet: t.walletName || '', Note: t.note || '', User: t.userName || '',
                })));
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `flowfi-export-${Date.now()}.csv`; a.click();
                toast.success('Exported!');
              }}>
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          </div>
        </div>
      </Section>

      {/* About */}
      <Section title="About FlowFi" icon={ShieldCheck}>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Version 1.0.0 · Built with Next.js 15, MongoDB, and Tailwind CSS</p>
          <p>Private money tracker for unlimited users. No authentication required.</p>
          <p className="mt-3 text-xs">
            Stack: Next.js 15 · TypeScript · Tailwind CSS · Shadcn UI · MongoDB · Mongoose · Recharts · Framer Motion · Zustand
          </p>
        </div>
      </Section>
    </div>
  );
}
