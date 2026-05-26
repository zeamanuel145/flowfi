'use client';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Currency } from '@/types';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number;
  currency?: Currency;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  prefix?: string;
  suffix?: string;
  variant?: 'default' | 'positive' | 'negative' | 'neutral';
  index?: number;
}

export function StatCard({
  title, value, currency = 'USD', change, changeLabel,
  icon: Icon, iconColor, iconBg, variant = 'default', index = 0,
}: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg || 'bg-primary/10')}
        >
          <Icon className={cn('w-5 h-5', iconColor || 'text-primary')} />
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
            isPositive
              ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40'
              : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40'
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
        <p className={cn(
          'text-2xl font-display font-bold tabular-nums tracking-tight',
          variant === 'positive' && 'text-emerald-600 dark:text-emerald-400',
          variant === 'negative' && 'text-red-600 dark:text-red-400',
        )}>
          {formatCurrency(value, currency)}
        </p>
        {changeLabel && (
          <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>
        )}
      </div>
    </motion.div>
  );
}
