import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Currency, IWallet, ITransaction } from '@/types';

interface AppState {
  // Settings
  currency: Currency;
  setCurrency: (currency: Currency) => void;

  // Active wallet filter
  activeWalletId: string | null;
  setActiveWalletId: (id: string | null) => void;

  // Wallets cache
  wallets: IWallet[];
  setWallets: (wallets: IWallet[]) => void;

  // Transaction filters
  filters: {
    search: string;
    category: string;
    type: string;
    startDate: string;
    endDate: string;
    walletId: string;
  };
  setFilters: (filters: Partial<AppState['filters']>) => void;
  resetFilters: () => void;

  // Recent transactions cache
  recentTransactions: ITransaction[];
  setRecentTransactions: (transactions: ITransaction[]) => void;
}

const defaultFilters = {
  search: '',
  category: '',
  type: '',
  startDate: '',
  endDate: '',
  walletId: '',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currency: 'USD',
      setCurrency: (currency) => set({ currency }),

      activeWalletId: null,
      setActiveWalletId: (id) => set({ activeWalletId: id }),

      wallets: [],
      setWallets: (wallets) => set({ wallets }),

      filters: defaultFilters,
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      resetFilters: () => set({ filters: defaultFilters }),

      recentTransactions: [],
      setRecentTransactions: (transactions) => set({ recentTransactions: transactions }),
    }),
    {
      name: 'flowfi-storage',
      partialize: (state) => ({
        currency: state.currency,
      }),
    }
  )
);
