/**
 * Project STRIKE — Spending / Budget / AI Analysis
 * Design: Origin Financial dark-card aesthetic
 * Sub-tabs: Overview | Breakdown & Budget | Transactions
 * Features: Spending chart, expense donut, cash flow, calendar, AI surplus analysis
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/AppShell';
import { useApp } from '@/contexts/AppContext';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  BarChart3,
  Brain,
  Zap,
  ShoppingBag,
  Coffee,
  Home,
  Car,
  Wifi,
  Dumbbell,
  Utensils,
  Fuel,
  CreditCard,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Mock Spending Data ───────────────────────────────────────────────────────

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

const MONTHLY_SPENDING = [
  { month: 'Oct', amount: 3420, income: 5800 },
  { month: 'Nov', amount: 4180, income: 5800 },
  { month: 'Dec', amount: 5240, income: 6200 },
  { month: 'Jan', amount: 3680, income: 5800 },
  { month: 'Feb', amount: 3920, income: 5800 },
  { month: 'Mar', amount: 2847, income: 5800 },
];

// Daily cumulative spending for the current month (March)
const DAILY_SPENDING_CURRENT = Array.from({ length: 11 }, (_, i) => {
  const day = i + 1;
  const cumulative = Math.round(
    day <= 3 ? day * 180 :
    day <= 7 ? 540 + (day - 3) * 320 :
    1820 + (day - 7) * 256
  );
  return { day: `${day}`, amount: cumulative, label: `Mar ${day}` };
});

// Previous month comparison (dashed line)
const DAILY_SPENDING_PREV = Array.from({ length: 28 }, (_, i) => {
  const day = i + 1;
  const cumulative = Math.round(
    day <= 5 ? day * 200 :
    day <= 14 ? 1000 + (day - 5) * 280 :
    3520 + (day - 14) * 28
  );
  return { day: `${day}`, amount: cumulative };
});

const EXPENSE_CATEGORIES = [
  { name: 'Housing', amount: 1420, pct: 49.9, color: '#3b82f6', icon: Home },
  { name: 'Dining & Drinks', amount: 524, pct: 18.4, color: '#f97316', icon: Utensils },
  { name: 'Transportation', amount: 340, pct: 11.9, color: '#8b5cf6', icon: Car },
  { name: 'Shopping', amount: 248, pct: 8.7, color: '#ef4444', icon: ShoppingBag },
  { name: 'Subscriptions', amount: 165, pct: 5.8, color: '#06b6d4', icon: Wifi },
  { name: 'Groceries', amount: 110, pct: 3.9, color: '#10b981', icon: Coffee },
  { name: 'Gas', amount: 40, pct: 1.4, color: '#eab308', icon: Fuel },
];

const BUDGET_CATEGORIES = [
  { name: 'Total Budget', spent: 2847, budget: 4200, color: '#10b981' },
  { name: 'Housing', spent: 1420, budget: 1500, color: '#3b82f6' },
  { name: 'Dining & Drinks', spent: 524, budget: 400, color: '#f97316', over: true },
  { name: 'Transportation', spent: 340, budget: 400, color: '#8b5cf6' },
  { name: 'Shopping', spent: 248, budget: 300, color: '#ef4444' },
  { name: 'Subscriptions', spent: 165, budget: 180, color: '#06b6d4' },
  { name: 'Groceries', spent: 110, budget: 350, color: '#10b981' },
];

const TRANSACTIONS = [
  { id: 't1', merchant: 'Safeway Kailua', category: 'Groceries', amount: 67.42, date: 'Mar 11', icon: Coffee, color: '#10b981' },
  { id: 't2', merchant: 'Shell Gas Station', category: 'Gas', amount: 40.00, date: 'Mar 10', icon: Fuel, color: '#eab308' },
  { id: 't3', merchant: 'Saito And Pho Kaneohe', category: 'Dining', amount: 41.78, date: 'Mar 9', icon: Utensils, color: '#f97316' },
  { id: 't4', merchant: 'ATM Withdrawal', category: 'Cash', amount: 20.00, date: 'Mar 9', icon: DollarSign, color: '#94a3b8' },
  { id: 't5', merchant: 'Netflix', category: 'Subscription', amount: 15.99, date: 'Mar 8', icon: Wifi, color: '#06b6d4' },
  { id: 't6', merchant: 'Costco Iwilei', category: 'Shopping', amount: 248.30, date: 'Mar 7', icon: ShoppingBag, color: '#ef4444' },
  { id: 't7', merchant: 'Starbucks Pearlridge', category: 'Dining', amount: 5.60, date: 'Mar 7', icon: Coffee, color: '#f97316' },
  { id: 't8', merchant: 'Planet Fitness', category: 'Subscription', amount: 24.99, date: 'Mar 6', icon: Dumbbell, color: '#06b6d4' },
  { id: 't9', merchant: 'Zippy\'s Kaneohe', category: 'Dining', amount: 32.15, date: 'Mar 5', icon: Utensils, color: '#f97316' },
  { id: 't10', merchant: 'American Savings Bank', category: 'Housing', amount: 1420.00, date: 'Mar 1', icon: Home, color: '#3b82f6' },
  { id: 't11', merchant: 'T-Mobile', category: 'Subscription', amount: 85.00, date: 'Mar 1', icon: Wifi, color: '#06b6d4' },
  { id: 't12', merchant: 'Hawaiian Electric', category: 'Housing', amount: 187.50, date: 'Mar 1', icon: Home, color: '#3b82f6' },
];

const UPCOMING_TRANSACTIONS = [
  { day: 13, label: 'Paycheck', amount: 2900, type: 'income' as const },
  { day: 15, label: 'Car Insurance', amount: -180, type: 'expense' as const },
  { day: 18, label: 'Student Loan', amount: -536, type: 'expense' as const },
  { day: 27, label: 'Paycheck', amount: 2900, type: 'income' as const },
];

// ─── Sub-Tab Type ─────────────────────────────────────────────────────────────

type SpendTab = 'overview' | 'breakdown' | 'transactions';

// ─── Dark Card Wrapper ────────────────────────────────────────────────────────

function DarkCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'bg-slate-900/95 backdrop-blur-sm rounded-2xl border border-slate-800/60 p-5',
      className
    )}>
      {children}
    </div>
  );
}

function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] font-body">{title}</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
      </div>
      {action}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const { bankAccount, settings, surplus: getSurplus } = useApp();
  const [compareMonth] = useState('February');

  const currentMonthSpend = 2847;
  const prevMonthSpend = 3920;
  const spendDelta = currentMonthSpend - prevMonthSpend;
  const spendDeltaPct = ((spendDelta / prevMonthSpend) * 100).toFixed(1);
  const budget = 4200;

  // Merge current + prev for the chart
  const chartData = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const current = DAILY_SPENDING_CURRENT.find(d => Number(d.day) === day);
    const prev = DAILY_SPENDING_PREV.find(d => Number(d.day) === day);
    return {
      day: day.toString().padStart(2, '0'),
      current: current?.amount ?? null,
      previous: prev?.amount ?? null,
      budget,
    };
  });

  return (
    <div className="space-y-4">
      {/* Spend This Month Card */}
      <DarkCard>
        <CardHeader
          title="Spend This Month"
          action={
            <div className="flex items-center gap-1.5">
              <button className="w-7 h-7 rounded-lg border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-colors">
                <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button className="w-7 h-7 rounded-lg border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-colors">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          }
        />

        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="font-display text-4xl font-extrabold text-white tabular-nums">
              ${currentMonthSpend.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-cyan-400 text-sm font-body font-medium">March</span>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors">
            <span className="text-slate-300 text-xs font-body">vs {compareMonth}</span>
            <ChevronRight className="w-3 h-3 text-slate-500 rotate-90" />
          </button>
        </div>

        {/* Spending Curve Chart */}
        <div className="h-48 mt-4 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#e2e8f0',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                labelFormatter={(label: string) => `Day ${label}`}
              />
              {/* Budget threshold line */}
              <Area
                type="monotone"
                dataKey="budget"
                stroke="#475569"
                strokeDasharray="6 4"
                fill="none"
                strokeWidth={1}
                dot={false}
                connectNulls={false}
              />
              {/* Previous month (dashed) */}
              <Area
                type="monotone"
                dataKey="previous"
                stroke="#64748b"
                strokeDasharray="4 4"
                fill="none"
                strokeWidth={1.5}
                dot={false}
                connectNulls={false}
              />
              {/* Current month */}
              <Area
                type="monotone"
                dataKey="current"
                stroke="#06b6d4"
                fill="url(#spendGradient)"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-xs font-body">$4,200 Budget</span>
            <span className="text-slate-600 text-xs font-body">|</span>
            <span className="text-slate-500 text-xs font-body">--- Feb</span>
          </div>
          <div className="flex items-center gap-1">
            {spendDelta < 0 ? (
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
            )}
            <span className={cn(
              'text-xs font-bold tabular-nums font-body',
              spendDelta < 0 ? 'text-emerald-400' : 'text-red-400'
            )}>
              {spendDeltaPct}% vs last month
            </span>
          </div>
        </div>
      </DarkCard>

      {/* AI Surplus Analysis Card */}
      <DarkCard className="border-emerald-900/40">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <Brain className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-[0.2em] font-body">AI Surplus Analysis</span>
        </div>

        <p className="text-slate-300 text-sm font-body leading-relaxed mb-4">
          Good morning. Based on your spending pattern this month, you're <strong className="text-emerald-400">$1,073 under budget</strong>.
          Your dining spend is <strong className="text-amber-400">31% over</strong> your $400 target — but your groceries and transport
          are well below threshold. Net surplus available for strike: <strong className="text-white">${getSurplus().toLocaleString()}</strong>.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
            <div className="font-display text-lg font-extrabold text-emerald-400 tabular-nums">
              ${getSurplus().toLocaleString()}
            </div>
            <div className="text-emerald-300/50 text-[10px] font-body mt-0.5">Strike Surplus</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 text-center">
            <div className="font-display text-lg font-extrabold text-white tabular-nums">
              ${(4200 - currentMonthSpend).toLocaleString()}
            </div>
            <div className="text-slate-500 text-[10px] font-body mt-0.5">Under Budget</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3 text-center">
            <div className="font-display text-lg font-extrabold text-cyan-400 tabular-nums">
              $437
            </div>
            <div className="text-slate-500 text-[10px] font-body mt-0.5">Avg Surplus/mo</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2.5 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
            <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-slate-400 text-xs font-body leading-relaxed">
              <strong className="text-emerald-300">Recommendation:</strong> Execute a $500 strike on your Chase Sapphire (24.99% APR)
              to eliminate $120 in future interest. Your Safety Net remains protected at ${settings.safetyNet.toLocaleString()}.
            </p>
          </div>
          <div className="flex items-start gap-2.5 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-slate-400 text-xs font-body leading-relaxed">
              <strong className="text-amber-300">Watch:</strong> Dining & Drinks is trending 31% over budget.
              At this pace, you'll exceed by $124 this month. Consider reducing by 2 meals out.
            </p>
          </div>
        </div>
      </DarkCard>

      {/* Latest Transactions Preview */}
      <DarkCard>
        <CardHeader title="Latest Transactions" />
        <div className="space-y-0">
          {TRANSACTIONS.slice(0, 5).map((tx) => {
            const Icon = tx.icon;
            return (
              <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-slate-800/40 last:border-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${tx.color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: tx.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium font-body truncate">{tx.merchant}</div>
                  <div className="text-slate-500 text-xs font-body">{tx.date}</div>
                </div>
                <span className="text-white text-sm font-semibold tabular-nums font-body">
                  ${tx.amount.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </DarkCard>
    </div>
  );
}

// ─── Breakdown & Budget Tab ───────────────────────────────────────────────────

function BreakdownTab() {
  const totalSpend = EXPENSE_CATEGORIES.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-4">
      {/* Budget Progress */}
      <DarkCard>
        <CardHeader title="Budget" />
        <div className="space-y-4">
          {BUDGET_CATEGORIES.map((cat) => {
            const pct = Math.min(100, (cat.spent / cat.budget) * 100);
            const isOver = cat.spent > cat.budget;
            return (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white text-sm font-medium font-body">{cat.name}</span>
                  <span className="text-slate-300 text-sm tabular-nums font-body">
                    <span className={isOver ? 'text-red-400' : 'text-white'}>${cat.spent.toLocaleString()}</span>
                    <span className="text-slate-600"> of </span>
                    ${cat.budget.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: isOver ? '#ef4444' : cat.color }}
                    />
                  </div>
                  <span className={cn(
                    'text-xs font-bold tabular-nums font-body w-10 text-right',
                    isOver ? 'text-red-400' : 'text-slate-400'
                  )}>
                    {Math.round(pct)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </DarkCard>

      {/* Expense Categories Donut */}
      <DarkCard>
        <CardHeader title="Expense Categories" />
        <div className="flex items-center gap-6">
          <div className="relative w-40 h-40 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={EXPENSE_CATEGORIES}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="amount"
                  stroke="none"
                >
                  {EXPENSE_CATEGORIES.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-extrabold text-white tabular-nums">
                ${totalSpend.toLocaleString()}
              </span>
              <span className="text-slate-500 text-[10px] font-body">Total</span>
            </div>
          </div>
          <div className="space-y-2.5 flex-1">
            {EXPENSE_CATEGORIES.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-300 text-xs font-body flex-1">{cat.name}</span>
                <span className="text-slate-500 text-xs tabular-nums font-body">{cat.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </DarkCard>

      {/* Cash Flow */}
      <DarkCard>
        <CardHeader title="Cash Flow" />
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-300 text-sm font-body">Income</span>
              <span className="text-emerald-400 text-sm font-bold tabular-nums font-body">$5,800.00</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-blue-500"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-300 text-sm font-body">Expenses</span>
              <span className="text-red-400 text-sm font-bold tabular-nums font-body">-$2,847.00</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '49%' }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                className="h-full rounded-full bg-blue-400"
              />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800/60">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-slate-500 text-[10px] font-body uppercase tracking-wider mb-1">Total Income</div>
                <div className="text-white text-sm font-bold tabular-nums font-display">$5,800</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] font-body uppercase tracking-wider mb-1">Total Expenses</div>
                <div className="text-white text-sm font-bold tabular-nums font-display">$2,847</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] font-body uppercase tracking-wider mb-1">Net Cash Flow</div>
                <div className="text-emerald-400 text-sm font-bold tabular-nums font-display">$2,953</div>
              </div>
            </div>
            <div className="text-center mt-3">
              <span className="text-slate-500 text-xs font-body">Avg cash flow / mo</span>
              <div className="text-white text-lg font-bold tabular-nums font-display">$2,437</div>
            </div>
          </div>
        </div>
      </DarkCard>

      {/* Reports Mini Chart */}
      <DarkCard>
        <CardHeader
          title="Reports"
          action={
            <div className="flex items-center gap-1.5">
              <button className="w-7 h-7 rounded-lg border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-colors">
                <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button className="w-7 h-7 rounded-lg border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-colors">
                <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          }
        />
        <div className="text-slate-500 text-xs font-body mb-3">Oct 2025 — Mar 2026</div>
        <div className="h-36 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_SPENDING} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#1e40af" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#e2e8f0',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spending']}
              />
              <Bar dataKey="amount" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DarkCard>
    </div>
  );
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────

function TransactionsTab() {
  const [filter, setFilter] = useState<string>('All');
  const categories = ['All', 'Housing', 'Dining', 'Shopping', 'Subscription', 'Groceries', 'Gas', 'Cash'];

  const filtered = filter === 'All'
    ? TRANSACTIONS
    : TRANSACTIONS.filter(tx => tx.category.toLowerCase().includes(filter.toLowerCase()));

  // Calendar data for upcoming transactions
  const today = 11; // March 11
  const daysInMonth = 31;
  const firstDayOfWeek = 6; // March 1 is Saturday (0=Sun)

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    // Pad start
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    // Pad end
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, []);

  return (
    <div className="space-y-4">
      {/* Upcoming Transactions Calendar */}
      <DarkCard>
        <CardHeader title="Upcoming Transactions" />
        <div className="grid grid-cols-7 gap-0 text-center mb-2">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} className="text-slate-500 text-[10px] font-bold tracking-wider font-body py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={i} className="aspect-square" />;
            const isToday = day === today;
            const isPast = day < today;
            const upcoming = UPCOMING_TRANSACTIONS.find(t => t.day === day);
            return (
              <div
                key={i}
                className={cn(
                  'aspect-square flex flex-col items-center justify-center border border-slate-800/30 relative',
                  isToday && 'bg-slate-800/60',
                  isPast && 'opacity-40'
                )}
              >
                <span className={cn(
                  'text-xs font-body tabular-nums',
                  isToday ? 'w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center font-bold' : 'text-slate-400'
                )}>
                  {day}
                </span>
                {upcoming && (
                  <span className={cn(
                    'text-[9px] font-bold tabular-nums font-body mt-0.5',
                    upcoming.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {upcoming.type === 'income' ? '+' : ''}{upcoming.amount < 0 ? '-' : ''}${Math.abs(upcoming.amount).toLocaleString()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </DarkCard>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium font-body whitespace-nowrap transition-all',
              filter === cat
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:bg-slate-700/60'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <DarkCard>
        <CardHeader title="All Transactions" />
        <div className="space-y-0">
          {filtered.map((tx) => {
            const Icon = tx.icon;
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 py-3 border-b border-slate-800/40 last:border-0"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${tx.color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: tx.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium font-body truncate">{tx.merchant}</div>
                  <div className="text-slate-500 text-xs font-body">{tx.date} · {tx.category}</div>
                </div>
                <span className="text-white text-sm font-semibold tabular-nums font-body">
                  ${tx.amount.toFixed(2)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </DarkCard>
    </div>
  );
}

// ─── Main Spending Page ───────────────────────────────────────────────────────

export default function Spending() {
  const [activeTab, setActiveTab] = useState<SpendTab>('overview');

  const tabs: { id: SpendTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'breakdown', label: 'Breakdown & budget' },
    { id: 'transactions', label: 'Transactions' },
  ];

  return (
    <AppShell title="Spend" subtitle="Track spending, find surplus, strike debt">
      {/* Sub-Tab Navigation — Origin style */}
      <div className="flex items-center gap-1 mb-6 border-b border-slate-200/60 -mx-5 lg:-mx-8 px-5 lg:px-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'relative px-4 py-3 text-sm font-medium font-body transition-colors',
              activeTab === tab.id
                ? 'text-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="spend-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Desktop: Two-column layout for overview */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-4">
            {/* Spend This Month + Latest Transactions on left */}
            <OverviewTab />
          </div>
          {/* Right sidebar: Quick stats */}
          <div className="space-y-4 hidden lg:block">
            {/* Quick Surplus Card */}
            <DarkCard className="border-emerald-900/40">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold font-body">Strike Ready</div>
                  <div className="text-emerald-400 text-xs font-body">Surplus detected</div>
                </div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center mb-3">
                <div className="text-emerald-300/50 text-[10px] font-body uppercase tracking-wider mb-1">Available to Strike</div>
                <div className="font-display text-3xl font-extrabold text-emerald-400 tabular-nums">$4,847</div>
              </div>
              <button className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold font-body hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Execute Strike
              </button>
            </DarkCard>

            {/* Monthly Comparison */}
            <DarkCard>
              <CardHeader title="Monthly Comparison" />
              <div className="space-y-3">
                {MONTHLY_SPENDING.slice(-3).reverse().map((m) => (
                  <div key={m.month} className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm font-body">{m.month}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-cyan-500/60"
                          style={{ width: `${(m.amount / 5500) * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-sm tabular-nums font-body w-16 text-right">${m.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </DarkCard>

            {/* Top Merchants */}
            <DarkCard>
              <CardHeader title="Top Merchants" />
              <div className="space-y-3">
                {[
                  { name: 'American Savings Bank', amount: 1420, count: 1 },
                  { name: 'Costco Iwilei', amount: 248.30, count: 1 },
                  { name: 'Hawaiian Electric', amount: 187.50, count: 1 },
                  { name: 'T-Mobile', amount: 85.00, count: 1 },
                  { name: 'Safeway Kailua', amount: 67.42, count: 1 },
                ].map((m) => (
                  <div key={m.name} className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium font-body">{m.name}</div>
                      <div className="text-slate-500 text-xs font-body">{m.count} transaction{m.count > 1 ? 's' : ''}</div>
                    </div>
                    <span className="text-white text-sm font-semibold tabular-nums font-body">${m.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </DarkCard>
          </div>
        </div>
      )}

      {activeTab === 'breakdown' && <BreakdownTab />}
      {activeTab === 'transactions' && <TransactionsTab />}
    </AppShell>
  );
}
