'use client';
import { IBudget } from '@/types';
import { CATEGORY_ICONS } from '@/types';
import { formatCurrency, getProgressColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  budget: IBudget;
  compact?: boolean;
}

export function BudgetProgress({ budget, compact }: Props) {
  const { category, limit, spent, currency } = budget;
  const percentage = Math.min((spent / limit) * 100, 100);
  const icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || '📦';
  const remaining = limit - spent;
  const isOverBudget = spent > limit;

  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span>{icon}</span>
            <span className="font-medium truncate">{category}</span>
          </div>
          <span className={cn('font-semibold tabular-nums', isOverBudget && 'text-red-500')}>
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', getProgressColor(percentage))}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="font-semibold text-sm">{category}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(spent, currency as any)} / {formatCurrency(limit, currency as any)}
            </p>
          </div>
        </div>
        <div className={cn(
          'text-right text-sm font-bold tabular-nums',
          isOverBudget ? 'text-red-500' : 'text-foreground'
        )}>
          {isOverBudget ? (
            <span>-{formatCurrency(Math.abs(remaining), currency as any)}</span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">
              {formatCurrency(remaining, currency as any)} left
            </span>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700', getProgressColor(percentage))}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(percentage)}% used</span>
          <span>Budget: {formatCurrency(limit, currency as any)}</span>
        </div>
      </div>
    </div>
  );
}
