'use client';
import { ISavingsGoal } from '@/types';
import { formatCurrency, getDaysRemaining } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock } from 'lucide-react';

interface Props {
  goal: ISavingsGoal;
  compact?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddFunds?: () => void;
}

export function SavingsGoalCard({ goal, compact }: Props) {
  const { name, targetAmount, currentAmount, currency, color, icon, deadline, isCompleted } = goal;
  const percentage = Math.min((currentAmount / targetAmount) * 100, 100);
  const daysLeft = deadline ? getDaysRemaining(deadline) : null;

  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span>{icon}</span>
            <span className="font-medium truncate">{name}</span>
            {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
          </div>
          <span className="font-semibold tabular-nums" style={{ color }}>
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${color}18` }}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold">{name}</p>
              {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
            {daysLeft !== null && !isCompleted && (
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className={cn('text-xs', daysLeft < 30 ? 'text-amber-500' : 'text-muted-foreground')}>
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold tabular-nums" style={{ color }}>{Math.round(percentage)}%</p>
        </div>
      </div>

      <div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">
            {formatCurrency(currentAmount, currency as any)}
          </span>
          <span>{formatCurrency(targetAmount, currency as any)}</span>
        </div>
      </div>
    </div>
  );
}
