/**
 * Project STRIKE — Net Worth Tracker
 * High-level chart showing Assets vs. Liabilities over time.
 * Glassmorphism + spring animations + desktop bento grid
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  Car,
  Briefcase,
  PiggyBank,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AppShell } from '@/components/AppShell';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

function formatCurrency(n: number, compact = false): string {
  if (compact && Math.abs(n) >= 1000) {
    return (n < 0 ? '-' : '') + '$' + (Math.abs(n) / 1000).toFixed(0) + 'k';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

// ─── Mock Asset Data ──────────────────────────────────────────────────────────

interface Asset {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  value: number;
  change: number; // monthly change %
}

const ASSETS: Asset[] = [
  { id: 'a-1', name: 'Primary Residence', category: 'Real Estate', icon: Home, value: 715_000, change: 0.3 },
  { id: 'a-2', name: 'Vehicle (2023 RAV4)', category: 'Auto', icon: Car, value: 24_500, change: -1.2 },
  { id: 'a-3', name: '401(k) + Roth IRA', category: 'Retirement', icon: Briefcase, value: 87_400, change: 1.8 },
  { id: 'a-4', name: 'Emergency Savings', category: 'Cash', icon: PiggyBank, value: 12_300, change: 0.1 },
];

// ─── Generate Historical Net Worth Data ───────────────────────────────────────

function generateHistoricalData(totalDebt: number, totalAssets: number) {
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const data = [];

  for (let i = 0; i < months.length; i++) {
    const progress = i / (months.length - 1);
    // Assets grow slowly
    const assets = Math.round(totalAssets * (0.94 + progress * 0.06));
    // Liabilities decrease as strikes happen
    const liabilities = Math.round((totalDebt * 1.04) * (1 - progress * 0.04));
    const netWorth = assets - liabilities;

    data.push({
      month: months[i],
      assets,
      liabilities,
      netWorth,
    });
  }
  return data;
}

// ─── Asset Card ───────────────────────────────────────────────────────────────

function AssetCard({ asset, delay }: { asset: Asset; delay: number }) {
  const Icon = asset.icon;
  const isPositive = asset.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-slate-100/80 rounded-2xl flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-slate-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-slate-900 text-sm truncate">{asset.name}</div>
          <div className="text-slate-400 text-xs font-body">{asset.category}</div>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="font-display text-xl font-extrabold text-slate-900 tabular-nums tracking-tight">
          {formatCurrency(asset.value)}
        </div>
        <div className={cn(
          'flex items-center gap-0.5 text-xs font-bold font-body',
          isPositive ? 'text-emerald-600' : 'text-red-500'
        )}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(asset.change).toFixed(1)}%
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NetWorth() {
  const { totalDebt, debts, bankAccount } = useApp();
  const [timeRange, setTimeRange] = useState<'6m' | '1y' | 'all'>('6m');

  const totalAssets = ASSETS.reduce((s, a) => s + a.value, 0) + bankAccount.balance;
  const totalLiabilities = totalDebt();
  const netWorth = totalAssets - totalLiabilities;
  const isPositiveNet = netWorth >= 0;

  const chartData = useMemo(() => generateHistoricalData(totalLiabilities, totalAssets), [totalLiabilities, totalAssets]);

  // Monthly change estimate
  const prevNetWorth = chartData.length >= 2 ? chartData[chartData.length - 2].netWorth : netWorth;
  const monthlyChange = netWorth - prevNetWorth;
  const monthlyChangePct = prevNetWorth !== 0 ? (monthlyChange / Math.abs(prevNetWorth)) * 100 : 0;

  return (
    <AppShell
      title="Net Worth"
      subtitle="Assets vs. Liabilities over time"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">

        {/* Net Worth Hero — span 2 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className={cn(
            'lg:col-span-2 glass-card-dark p-6 lg:p-8',
            isPositiveNet ? '' : 'border-red-500/20'
          )}
        >
          <div className="text-slate-400 text-xs font-body uppercase tracking-wider mb-2">Net Worth</div>
          <div className={cn(
            'font-display text-5xl lg:text-6xl font-extrabold tabular-nums tracking-tight mb-3',
            isPositiveNet ? 'text-white' : 'text-red-400'
          )}>
            {formatCurrency(netWorth)}
          </div>
          <div className="flex items-center gap-4">
            <div className={cn(
              'flex items-center gap-1 text-sm font-bold font-body',
              monthlyChange >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}>
              {monthlyChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {formatCurrency(Math.abs(monthlyChange))} ({monthlyChangePct >= 0 ? '+' : ''}{monthlyChangePct.toFixed(1)}%)
            </div>
            <span className="text-slate-500 text-xs font-body">this month</span>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-500 text-xs font-body uppercase tracking-wider">Total Assets</span>
            </div>
            <div className="font-display text-2xl font-extrabold text-emerald-600 tabular-nums tracking-tight">
              {formatCurrency(totalAssets)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-slate-500 text-xs font-body uppercase tracking-wider">Total Liabilities</span>
            </div>
            <div className="font-display text-2xl font-extrabold text-red-500 tabular-nums tracking-tight">
              {formatCurrency(totalLiabilities)}
            </div>
          </motion.div>
        </div>

        {/* Chart — full width */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.15 }}
          className="lg:col-span-3 glass-card p-5 lg:p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <span className="font-display font-bold text-slate-900 text-base">Wealth Trajectory</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100/60 rounded-xl p-1 backdrop-blur-sm">
              {(['6m', '1y', 'all'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold font-body transition-all uppercase',
                    timeRange === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradAssets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLiabilities" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => formatCurrency(v, true)}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(148,163,184,0.15)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(15,23,42,0.08)',
                    fontSize: '12px',
                  }}
                  formatter={(v: number, name: string) => [formatCurrency(v), name]}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter', color: '#64748b' }}
                />
                <Area
                  type="monotone"
                  dataKey="assets"
                  name="Assets"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#gradAssets)"
                />
                <Area
                  type="monotone"
                  dataKey="liabilities"
                  name="Liabilities"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#gradLiabilities)"
                />
                <Area
                  type="monotone"
                  dataKey="netWorth"
                  name="Net Worth"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#gradNetWorth)"
                  strokeDasharray="6 3"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Asset Breakdown */}
        <div className="lg:col-span-3">
          <div className="text-slate-400 text-xs font-body uppercase tracking-wider mb-3 px-1">
            Asset Breakdown
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ASSETS.map((asset, i) => (
              <AssetCard key={asset.id} asset={asset} delay={0.2 + i * 0.05} />
            ))}
          </div>
        </div>

        {/* Debt Breakdown Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.4 }}
          className="lg:col-span-3 glass-card p-5 lg:p-6"
        >
          <div className="text-slate-400 text-xs font-body uppercase tracking-wider mb-4">Liability Breakdown</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {debts.filter(d => !d.isPaidOff).map(debt => (
              <div key={debt.id} className="bg-slate-50/60 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-slate-500 text-xs font-body mb-1 truncate">{debt.name}</div>
                <div className="font-display font-bold text-slate-900 tabular-nums">
                  {formatCurrency(debt.balance)}
                </div>
                <div className="text-red-500 text-xs font-bold font-body mt-0.5">{debt.rate}% APR</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
