/**
 * Project STRIKE — AppContext
 * Philosophy: "Trusted Fintech Editorial"
 * Single source of truth for all app state: debts, bank account, settings, activity feed.
 * Seeded with Hawaii market data from the spec documents.
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

// ─── Data Model ────────────────────────────────────────────────────────────────

export type DebtType = 'Mortgage' | 'Student' | 'Auto' | 'Credit';
export type Strategy = 'Avalanche' | 'Snowball';

export interface Debt {
  id: string;
  name: string;
  lender: string;
  type: DebtType;
  balance: number;
  startBalance: number;
  rate: number;
  minPayment: number;
  dueDate: string;
  isPaidOff: boolean;
  autoStrike: boolean;
}

export interface UserSettings {
  safetyNet: number;
  strategy: Strategy;
  roundUpsEnabled: boolean;
  isPaused: boolean;
}

export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  isConnected: boolean;
  lastSync: string;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  description: string;
  amount: number;
  type: 'strike' | 'roundup' | 'surplus' | 'shield';
  debtName: string;
  debtId?: string;
}

// ─── Initial Mock Data (Hawaii market figures) ─────────────────────────────────

const INITIAL_DEBTS: Debt[] = [
  {
    id: 'debt-1',
    name: 'Primary Residence',
    lender: 'American Savings Bank',
    type: 'Mortgage',
    balance: 394_210,
    startBalance: 409_068,
    rate: 6.27,
    minPayment: 3_382,
    dueDate: '2054-03-01',
    isPaidOff: false,
    autoStrike: true,
  },
  {
    id: 'debt-2',
    name: 'Federal Student Loan',
    lender: 'MOHELA / Dept. of Education',
    type: 'Student',
    balance: 54_820,
    startBalance: 60_407,
    rate: 5.05,
    minPayment: 536,
    dueDate: '2035-08-01',
    isPaidOff: false,
    autoStrike: true,
  },
  {
    id: 'debt-3',
    name: 'Vehicle Loan',
    lender: 'Bank of Hawaii',
    type: 'Auto',
    balance: 18_440,
    startBalance: 28_500,
    rate: 7.49,
    minPayment: 520,
    dueDate: '2028-06-01',
    isPaidOff: false,
    autoStrike: false,
  },
  {
    id: 'debt-4',
    name: 'Chase Sapphire Reserve',
    lender: 'Chase',
    type: 'Credit',
    balance: 4_280,
    startBalance: 8_750,
    rate: 24.99,
    minPayment: 128,
    dueDate: '2026-04-15',
    isPaidOff: false,
    autoStrike: true,
  },
];

const INITIAL_BANK: BankAccount = {
  id: 'bank-1',
  name: 'Wells Fargo Checking',
  balance: 6_847,
  isConnected: true,
  lastSync: new Date().toISOString(),
};

const INITIAL_SETTINGS: UserSettings = {
  safetyNet: 2_000,
  strategy: 'Avalanche',
  roundUpsEnabled: true,
  isPaused: false,
};

const INITIAL_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    description: 'Surplus Detected. Auto-Strike executed.',
    amount: 247.00,
    type: 'surplus' as const,
    debtName: 'Primary Residence',
  },
  {
    id: 'act-2',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    description: 'Round-Up Detected (Starbucks $5.60 → $6.00)',
    amount: 0.40,
    type: 'roundup' as const,
    debtName: 'Chase Sapphire Reserve',
  },
  {
    id: 'act-3',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Surplus Detected. Auto-Strike executed.',
    amount: 124.00,
    type: 'surplus' as const,
    debtName: 'Federal Student Loan',
  },
  {
    id: 'act-4',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Round-Up Detected (Whole Foods $47.23 → $48.00)',
    amount: 0.77,
    type: 'roundup' as const,
    debtName: 'Chase Sapphire Reserve',
  },
  {
    id: 'act-5',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Manual Strike authorized by user.',
    amount: 500.00,
    type: 'strike' as const,
    debtName: 'Primary Residence',
  },
];

// ─── Context Definition ────────────────────────────────────────────────────────

interface AppContextValue {
  debts: Debt[];
  bankAccount: BankAccount;
  settings: UserSettings;
  activity: ActivityItem[];
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  showPlaidModal: boolean;
  connectedBanks: string[];

  // Actions
  setAuthenticated: (v: boolean) => void;
  setOnboardingComplete: (v: boolean) => void;
  setShowPlaidModal: (v: boolean) => void;
  addConnectedBank: (bankId: string) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  executeStrike: (debtId: string, amount: number) => void;
  toggleAutoStrike: (debtId: string) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  updateBankBalance: (balance: number) => void;
  sortedDebts: () => Debt[];
  totalDebt: () => number;
  totalInterestKilled: () => number;
  timeAssassinated: () => number; // months saved
  surplus: () => number;
  isShieldActive: () => boolean;
  addActivity: (item: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [debts, setDebts] = useState<Debt[]>(INITIAL_DEBTS);
  const [bankAccount, setBankAccount] = useState<BankAccount>(INITIAL_BANK);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [activity, setActivity] = useState<ActivityItem[]>(INITIAL_ACTIVITY);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [showPlaidModal, setShowPlaidModal] = useState(false);
  const [connectedBanks, setConnectedBanks] = useState<string[]>([]);
  const activityCounter = useRef(100);

  const addConnectedBank = useCallback((bankId: string) => {
    setConnectedBanks(prev => prev.includes(bankId) ? prev : [...prev, bankId]);
  }, []);

  const updateDebt = useCallback((id: string, updates: Partial<Debt>) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const executeStrike = useCallback((debtId: string, amount: number) => {
    setDebts(prev => prev.map(d => {
      if (d.id !== debtId) return d;
      const newBalance = Math.max(0, d.balance - amount);
      return { ...d, balance: newBalance, isPaidOff: newBalance === 0 };
    }));
    setBankAccount(prev => ({ ...prev, balance: Math.max(0, prev.balance - amount) }));
    const debt = debts.find(d => d.id === debtId);
    if (debt) {
      activityCounter.current += 1;
      const newItem: ActivityItem = {
        id: `act-${activityCounter.current}`,
        timestamp: new Date().toISOString(),
        description: 'Manual Strike authorized by user.',
        amount,
        type: 'strike',
        debtName: debt.name,
      };
      setActivity(prev => [newItem, ...prev].slice(0, 50));
    }
  }, [debts]);

  const toggleAutoStrike = useCallback((debtId: string) => {
    setDebts(prev => prev.map(d => d.id === debtId ? { ...d, autoStrike: !d.autoStrike } : d));
  }, []);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const updateBankBalance = useCallback((balance: number) => {
    setBankAccount(prev => ({ ...prev, balance }));
  }, []);

  const addActivity = useCallback((item: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    activityCounter.current += 1;
    const newItem: ActivityItem = {
      ...item,
      id: `act-${activityCounter.current}`,
      timestamp: new Date().toISOString(),
    };
    setActivity(prev => [newItem, ...prev].slice(0, 50));
  }, []);

  const sortedDebts = useCallback(() => {
    const active = debts.filter(d => !d.isPaidOff);
    const paid = debts.filter(d => d.isPaidOff);
    if (settings.strategy === 'Avalanche') {
      active.sort((a, b) => b.rate - a.rate);
    } else {
      active.sort((a, b) => a.balance - b.balance);
    }
    return [...active, ...paid];
  }, [debts, settings.strategy]);

  const totalDebt = useCallback(() => debts.reduce((sum, d) => sum + d.balance, 0), [debts]);

  const totalInterestKilled = useCallback(() => {
    return debts.reduce((sum, d) => {
      const paid = d.startBalance - d.balance;
      const monthlyRate = d.rate / 100 / 12;
      // Approximate interest saved from principal reduction
      const remainingMonths = d.type === 'Mortgage' ? 360 : d.type === 'Student' ? 120 : 60;
      return sum + paid * monthlyRate * remainingMonths * 0.4; // conservative estimate
    }, 0);
  }, [debts]);

  const timeAssassinated = useCallback(() => {
    const totalPaid = debts.reduce((sum, d) => sum + (d.startBalance - d.balance), 0);
    // Rough estimate: every $1000 extra principal saves ~0.5 months on a 30yr mortgage
    return Math.floor(totalPaid / 1000 * 0.5);
  }, [debts]);

  const surplus = useCallback(() => {
    return Math.max(0, bankAccount.balance - settings.safetyNet);
  }, [bankAccount.balance, settings.safetyNet]);

  const isShieldActive = useCallback(() => {
    return bankAccount.balance < settings.safetyNet || settings.isPaused;
  }, [bankAccount.balance, settings.safetyNet, settings.isPaused]);

  return (
    <AppContext.Provider value={{
      debts,
      bankAccount,
      settings,
      activity,
      isAuthenticated,
      onboardingComplete,
      showPlaidModal,
      connectedBanks,
      setAuthenticated,
      setOnboardingComplete,
      setShowPlaidModal,
      addConnectedBank,
      updateDebt,
      executeStrike,
      toggleAutoStrike,
      updateSettings,
      updateBankBalance,
      sortedDebts,
      totalDebt,
      totalInterestKilled,
      timeAssassinated,
      surplus,
      isShieldActive,
      addActivity,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
