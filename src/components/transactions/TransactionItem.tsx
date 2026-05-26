'use client';
import { ITransaction } from '@/types';
import { CATEGORY_COLORS, CATEGORY_ICONS, SHARED_USERS } from '@/types';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface TransactionItemProps {
  transaction: ITransaction;
  onEdit?: (t: ITransaction) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export function TransactionItem({ transaction, onEdit, onDelete, compact }: TransactionItemProps) {
  const { title, amount, type, category, date, userName, walletName } = transaction;
  const color = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#6b7280';
  const icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || '📦';
  const user = SHARED_USERS.find((u) => u.name === userName);

  return (
    <div className={cn(
      'flex items-center gap-3 py-3 group hover:bg-accent/40 rounded-xl px-3 -mx-3 transition-colors',
      compact && 'py-2'
    )}>
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
        style={{ backgroundColor: `${color}18` }}
      >
        {icon}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted-foreground">{formatRelativeDate(date)}</span>
          {!compact && (
            <>
              <span className="text-border">·</span>
              <span
                className="text-xs font-medium rounded-full px-1.5 py-0.5"
                style={{ color, backgroundColor: `${color}18` }}
              >
                {category}
              </span>
            </>
          )}
          {user && !compact && (
            <>
              <span className="text-border">·</span>
              <span
                className="text-xs font-semibold"
                style={{ color: user.color }}
              >
                {user.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className={cn(
          'text-sm font-bold tabular-nums',
          type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
        )}>
          {type === 'income' ? '+' : '-'}{formatCurrency(amount, transaction.currency as any)}
        </p>
        {!compact && walletName && (
          <p className="text-xs text-muted-foreground">{walletName}</p>
        )}
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex-shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(transaction)} className="gap-2">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(transaction._id)}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
