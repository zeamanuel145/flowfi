'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, ArrowLeftRight, BarChart3, Target,
  Wallet, Settings, ChevronLeft, TrendingUp, PiggyBank,
  Repeat2, Zap, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/goals', label: 'Savings Goals', icon: PiggyBank },
  { href: '/wallets', label: 'Wallets', icon: Wallet },
  { href: '/recurring', label: 'Recurring', icon: Repeat2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = mobileOpen !== undefined;

  if (isMobile && !mobileOpen) {
    return null;
  }

  return (
    <>
      {isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        animate={{ width: isMobile ? 240 : collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          isMobile
            ? 'fixed inset-y-0 left-0 z-50 flex flex-col h-screen w-72 bg-card border-r border-border/60 overflow-hidden shadow-xl md:hidden'
            : 'hidden md:flex flex-col h-screen bg-card border-r border-border/60 overflow-hidden flex-shrink-0 relative z-10'
        )}
      >
        <div className="flex items-center justify-between gap-3 p-4 h-16 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <span className="font-display text-lg font-bold tracking-tight">FlowFi</span>
                  <div className="flex items-center gap-1 -mt-0.5">
                    <Zap className="w-2.5 h-2.5 text-amber-500" />
                    <span className="text-[10px] text-muted-foreground font-medium">Money Tracker</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isMobile && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={href} href={href}>
                <div className={cn('sidebar-item', active && 'active')}>
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="truncate"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-card shadow-sm flex items-center justify-center hover:bg-accent transition-colors z-20"
          >
            <ChevronLeft className={cn('w-3 h-3 transition-transform duration-300', collapsed && 'rotate-180')} />
          </button>
        )}
      </motion.aside>
    </>
  );
}
