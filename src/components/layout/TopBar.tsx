'use client';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Bell, Plus, LogOut, User, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { useState } from 'react';

interface TopBarProps {
  onMobileMenuToggle?: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/analytics': 'Analytics',
  '/budgets': 'Budgets',
  '/goals': 'Savings Goals',
  '/wallets': 'Wallets',
  '/recurring': 'Recurring Payments',
  '/settings': 'Settings',
};

export function TopBar({ onMobileMenuToggle }: TopBarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [showAdd, setShowAdd] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const title = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname === key || (key !== '/dashboard' && pathname.startsWith(key))
  )?.[1] || 'FlowFi';

  return (
    <>
      <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border/60 bg-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-xl md:hidden"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="font-display text-xl font-bold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-xl"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          {/* Quick Add */}
          <Button
            size="sm"
            className="gap-1.5 rounded-xl font-semibold"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl gap-2"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">{session?.user?.name || 'User'}</span>
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50">
                <div className="p-4 border-b border-border">
                  <p className="text-sm font-semibold">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                </div>
                <button
                  onClick={() => signOut({ redirect: true, callbackUrl: '/auth/login' })}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AddTransactionDialog open={showAdd} onOpenChange={setShowAdd} onSuccess={() => setShowAdd(false)} />
    </>
  );
}
