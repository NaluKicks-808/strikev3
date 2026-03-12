/**
 * Project STRIKE — Universal Debt Map v2.0
 * Features: Drill-down modal with amortization curve, Avalanche vs Snowball comparative visualizer,
 *           glassmorphism cards, desktop bento grid, spring animations
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Target,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Trophy,
  AlertTriangle,
  Home,
  GraduationCap,
  Car,
  CreditCard,
  X,
  BarChart3,
  Calendar,
  DollarSign,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from 'recharts';
import { AppShell } from '@/components/AppShell';
import { useApp, type Debt, type Strategy } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatCurrency(n: number, compact = false): string {
  if (compact && Math.abs(n) >= 1000) {
    return '$' + (n / 1000).toFixed(1) + 'k';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function getThreatLevel(rate: number): 'high' | 'medium' | 'low' {
  if (rate > 10) return 'high';
  if (rate > 5) return 'medium';
  return 'low';
}

function getDebtIcon(type: Debt['type']) {
  switch (type) {
    case 'Mortgage': return Home;
    case 'Student': return GraduationCap;
    case 'Auto': return Car;
    case 'Credit': return CreditCard;
  }
}

function getDebtColor(type: Debt['type']) {
  switch (type) {
    case 'Mortgage': return { bg: 'bg-slate-900', text: 'text-white', hex: '#0f172a' };
    case 'Student': return { bg: 'bg-blue-600', text: 'text-white', hex: '#2563eb' };
    case 'Auto': return { bg: 'bg-amber-500', text: 'text-white', hex: '#f59e0b' };
    case 'Credit': return { bg: 'bg-red-500', text: 'text-white', hex: '#ef4444' };
  }
}

// ─── Amortization Calculator ──────────────────────────────────────────────────

function generateAmortization(debt: Debt, extraMonthly: number = 0) {
  const monthlyRate = debt.rate / 100 / 12;
  let balance = debt.balance;
  const data: { month: number; balance: number; interest: number; principal: number }[] = [];
  let month = 0;
  const maxMonths = 360;

  while (balance > 0 && month < maxMonths) {
    const interest = balance * monthlyRate;
    const totalPayment = Math.min(balance + interest, debt.minPayment + extraMonthly);
    const principal = totalPayment - interest;
    balance = Math.max(0, balance - principal);
    month++;
    if (month % 3 === 0 || balance === 0) {
      data.push({ month, balance: Math.round(balance), interest: Math.round(interest), principal: Math.round(principal) });
    }
  }
  return { data, totalMonths: month };
}

function computeStrategyComparison(debts: Debt[]) {
  const active = debts.filter(d => !d.isPaidOff);

  function simulate(strategy: Strategy) {
    const debtsCopy = active.map(d => ({ ...d }));
    let totalInterest = 0;
    let months = 0;
    const maxMonths = 600;
    const extraBudget = 200;

    while (debtsCopy.some(d => d.balance > 0) && months < maxMonths) {
      months++;
      let extraRemaining = extraBudget;

      // Sort based on strategy
      if (strategy === 'Avalanche') {
        debtsCopy.sort((a, b) => b.rate - a.rate);
      } else {
        debtsCopy.sort((a, b) => a.balance - b.balance);
      }

      for (const d of debtsCopy) {
        if (d.balance <= 0) continue;
        const monthlyRate = d.rate / 100 / 12;
        const interest = d.balance * monthlyRate;
        totalInterest += interest;
        const payment = Math.min(d.balance + interest, d.minPayment + (debtsCopy.indexOf(d) === 0 ? extraRemaining : 0));
        d.balance = Math.max(0, d.balance - (payment - interest));
        if (debtsCopy.indexOf(d) === 0) {
          extraRemaining = Math.max(0, extraRemaining - (payment - d.minPayment));
        }
      }
    }
    return { totalInterest: Math.round(totalInterest), months };
  }

  const avalanche = simulate('Avalanche');
  const snowball = simulate('Snowball');
  return { avalanche, snowball, savings: Math.round(snowball.totalInterest - avalanche.totalInterest) };
}

// ─── Drill-Down Debt Detail Modal ─────────────────────────────────────────────

function DebtDetailModal({ debt, onClose }: { debt: Debt; onClose: () => void }) {
  const { activity } = useApp();
  const [tab, setTab] = useState<'overview' | 'amortization' | 'strikes'>('overview');
  const Icon = getDebtIcon(debt.type);
  const { bg, text, hex } = getDebtColor(debt.type);
  const progress = ((debt.startBalance - debt.balance) / debt.startBalance) * 100;

  const normalAmort = useMemo(() => generateAmortization(debt, 0), [debt]);
  const boostAmort = useMemo(() => generateAmortization(debt, 200), [debt]);

  const debtStrikes = activity.filter(a => a.debtName === debt.name && (a.type === 'strike' || a.type === 'surplus'));
  const totalStruck = debtStrikes.reduce((s, a) => s + a.amount, 0);
  const dailyInterest = debt.balance * (debt.rate / 100) / 365;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" />
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-100/50 p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 ${bg} rounded-2xl flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${text}`} />
              </div>
              <div>
                <h2 className="font-display text-xl font-extrabold text-slate-900 tracking-tight">{debt.name}</h2>
                <p className="text-slate-400 text-sm font-body">{debt.lender}</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-9 h-9 bg-slate-100/80 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100/60 rounded-xl p-1">
            {(['overview', 'amortization', 'strikes'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-xs font-semibold font-body transition-all capitalize',
                  tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === 'overview' && (
            <div className="space-y-5">
              {/* Balance Hero */}
              <div className="text-center py-4">
                <div className="text-slate-400 text-xs font-body uppercase tracking-wider mb-1">Current Balance</div>
                <div className="font-display text-4xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                  {formatCurrency(debt.balance)}
                </div>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className={cn(
                    'text-xs font-bold px-2.5 py-1 rounded-lg',
                    getThreatLevel(debt.rate) === 'high' ? 'threat-high' : getThreatLevel(debt.rate) === 'medium' ? 'threat-medium' : 'threat-low'
                  )}>
                    {debt.rate}% APR
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-emerald-600 text-xs font-bold font-body">{progress.toFixed(1)}% paid</span>
                </div>
              </div>

              {/* Progress */}
              <div className="progress-bar-debt">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="progress-bar-fill"
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/60 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-body mb-1">Original Balance</div>
                  <div className="font-display font-bold text-slate-800 tabular-nums">{formatCurrency(debt.startBalance)}</div>
                </div>
                <div className="bg-slate-50/60 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-body mb-1">Min. Payment</div>
                  <div className="font-display font-bold text-slate-800 tabular-nums">{formatCurrency(debt.minPayment)}/mo</div>
                </div>
                <div className="bg-emerald-50/60 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-body mb-1">Principal Paid</div>
                  <div className="font-display font-bold text-emerald-600 tabular-nums">{formatCurrency(debt.startBalance - debt.balance)}</div>
                </div>
                <div className="bg-red-50/60 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-body mb-1">Daily Interest</div>
                  <div className="font-display font-bold text-red-500 tabular-nums">${dailyInterest.toFixed(2)}/day</div>
                </div>
                <div className="bg-slate-50/60 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-body mb-1">Payoff Date</div>
                  <div className="font-display font-bold text-slate-800">{new Date(debt.dueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                </div>
                <div className="bg-emerald-50/60 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-body mb-1">Total Struck</div>
                  <div className="font-display font-bold text-emerald-600 tabular-nums">{formatCurrency(totalStruck)}</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'amortization' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base mb-1">Amortization Curve</h3>
                <p className="text-slate-400 text-xs font-body">
                  Solid line: minimum payments only ({normalAmort.totalMonths} months).
                  Dashed line: with +$200/mo extra ({boostAmort.totalMonths} months).
                  <strong className="text-emerald-600"> Saves {normalAmort.totalMonths - boostAmort.totalMonths} months.</strong>
                </p>
              </div>

              <div className="h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={normalAmort.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradNormal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradBoost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                      label={{ value: 'Months', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#94a3b8' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
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
                      formatter={(v: number) => [formatCurrency(v), '']}
                      labelFormatter={(l: number) => `Month ${l}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      fill="url(#gradNormal)"
                      name="Min. Payments"
                    />
                    {boostAmort.data.length > 0 && (
                      <Area
                        type="monotone"
                        data={boostAmort.data}
                        dataKey="balance"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="6 3"
                        fill="url(#gradBoost)"
                        name="With +$200/mo"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50/60 rounded-xl p-3 text-center backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-body mb-1">Normal Payoff</div>
                  <div className="font-display font-bold text-slate-800 tabular-nums">{normalAmort.totalMonths} mo</div>
                </div>
                <div className="bg-emerald-50/60 rounded-xl p-3 text-center backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-body mb-1">Boosted Payoff</div>
                  <div className="font-display font-bold text-emerald-600 tabular-nums">{boostAmort.totalMonths} mo</div>
                </div>
                <div className="bg-emerald-50/60 rounded-xl p-3 text-center backdrop-blur-sm">
                  <div className="text-slate-400 text-xs font-body mb-1">Time Saved</div>
                  <div className="font-display font-bold text-emerald-600 tabular-nums">{normalAmort.totalMonths - boostAmort.totalMonths} mo</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'strikes' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base mb-1">Strike History</h3>
                <p className="text-slate-400 text-xs font-body">
                  {debtStrikes.length} strikes totaling {formatCurrency(totalStruck)} against this loan.
                </p>
              </div>

              {debtStrikes.length === 0 ? (
                <div className="text-center py-12 text-slate-300 text-sm font-body">
                  No strikes executed against this loan yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {debtStrikes.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-slate-50/60 rounded-xl backdrop-blur-sm"
                    >
                      <div className="w-8 h-8 bg-emerald-50/80 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-700 text-sm font-medium font-body truncate">{s.description}</div>
                        <div className="text-slate-400 text-xs font-body">
                          {new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="font-display font-bold text-emerald-600 text-sm tabular-nums">
                        -{formatCurrency(s.amount)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Manual Strike Modal ──────────────────────────────────────────────────────

function StrikeModal({ debt, onClose, onExecute }: {
  debt: Debt;
  onClose: () => void;
  onExecute: (amount: number) => void;
}) {
  const { surplus } = useApp();
  const maxStrike = Math.min(surplus(), debt.balance);
  const [amount, setAmount] = useState(Math.min(200, maxStrike));
  const [executing, setExecuting] = useState(false);
  const [done, setDone] = useState(false);

  const handleExecute = () => {
    setExecuting(true);
    setTimeout(() => {
      onExecute(amount);
      setExecuting(false);
      setDone(true);
      setTimeout(onClose, 1500);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-md bg-white rounded-t-3xl lg:rounded-3xl p-6 pb-10 lg:pb-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6 lg:hidden" />

        {done ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-6"
          >
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="font-display text-xl font-bold text-slate-900 mb-1">Strike Executed!</div>
            <div className="text-slate-400 text-sm font-body">{formatCurrency(amount)} applied to {debt.name}</div>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="font-display font-bold text-slate-900">Manual Strike</div>
                <div className="text-slate-400 text-xs font-body">{debt.name}</div>
              </div>
            </div>

            <div className="bg-slate-50/60 rounded-2xl p-4 mb-5 backdrop-blur-sm">
              <div className="flex justify-between text-sm font-body mb-2">
                <span className="text-slate-500">Available Surplus</span>
                <span className="font-semibold text-emerald-600 tabular-nums">{formatCurrency(surplus())}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-slate-500">Debt Balance</span>
                <span className="font-semibold text-slate-700 tabular-nums">{formatCurrency(debt.balance)}</span>
              </div>
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 text-xs font-body uppercase tracking-wider">Strike Amount</span>
                <span className="font-display font-bold text-emerald-600 text-xl tabular-nums">
                  {formatCurrency(amount)}
                </span>
              </div>
              <input
                type="range"
                min={25}
                max={Math.max(25, maxStrike)}
                step={25}
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-300 font-body mt-1">
                <span>$25</span>
                <span>{formatCurrency(maxStrike)}</span>
              </div>
            </div>

            {maxStrike <= 0 && (
              <div className="flex items-center gap-2 p-4 bg-amber-50/80 rounded-xl mb-4 backdrop-blur-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-amber-700 text-xs font-body">
                  Insufficient surplus. Balance is at or below Safety Net.
                </p>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleExecute}
              disabled={executing || maxStrike <= 0}
              className="strike-btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {executing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Zap className="w-4 h-4" /> Execute Strike — {formatCurrency(amount)}</>
              )}
            </motion.button>
            <button onClick={onClose} className="w-full mt-3 text-slate-400 text-sm font-body py-2">
              Cancel
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Strategy Comparison Visualizer ───────────────────────────────────────────

function StrategyComparison({ debts }: { debts: Debt[] }) {
  const comparison = useMemo(() => computeStrategyComparison(debts), [debts]);

  const chartData = [
    { name: 'Avalanche', interest: comparison.avalanche.totalInterest, months: comparison.avalanche.months, fill: '#10b981' },
    { name: 'Snowball', interest: comparison.snowball.totalInterest, months: comparison.snowball.months, fill: '#94a3b8' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="glass-card p-5 lg:p-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="w-4 h-4 text-emerald-500" />
        <span className="font-display font-bold text-slate-900 text-base">Strategy Comparison</span>
      </div>
      <p className="text-slate-400 text-xs font-body mb-5">
        With $200/mo extra payments, see how each strategy performs.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
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
                formatter={(v: number) => [formatCurrency(v), 'Total Interest']}
              />
              <Bar dataKey="interest" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Cards */}
        <div className="space-y-3">
          <div className="bg-emerald-50/60 rounded-xl p-4 backdrop-blur-sm border border-emerald-100/50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-emerald-700 text-sm">Avalanche</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-md">OPTIMAL</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-slate-400 text-xs font-body">Total Interest</div>
                <div className="font-display font-bold text-emerald-700 tabular-nums">{formatCurrency(comparison.avalanche.totalInterest, true)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-body">Debt-Free In</div>
                <div className="font-display font-bold text-emerald-700 tabular-nums">{Math.floor(comparison.avalanche.months / 12)}y {comparison.avalanche.months % 12}m</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/60 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-slate-700 text-sm">Snowball</span>
              <span className="text-xs font-bold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md">MOTIVATING</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-slate-400 text-xs font-body">Total Interest</div>
                <div className="font-display font-bold text-slate-700 tabular-nums">{formatCurrency(comparison.snowball.totalInterest, true)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs font-body">Debt-Free In</div>
                <div className="font-display font-bold text-slate-700 tabular-nums">{Math.floor(comparison.snowball.months / 12)}y {comparison.snowball.months % 12}m</div>
              </div>
            </div>
          </div>

          {comparison.savings > 0 && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50/60 rounded-xl backdrop-blur-sm">
              <ArrowRight className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-emerald-700 text-xs font-bold font-body">
                Avalanche saves you {formatCurrency(comparison.savings)} more than Snowball
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Debt Card ────────────────────────────────────────────────────────────────

function DebtCard({ debt, rank, onStrike, onDrillDown }: {
  debt: Debt;
  rank: number;
  onStrike: (debt: Debt) => void;
  onDrillDown: (debt: Debt) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { toggleAutoStrike, updateDebt } = useApp();
  const progress = ((debt.startBalance - debt.balance) / debt.startBalance) * 100;
  const threat = getThreatLevel(debt.rate);
  const Icon = getDebtIcon(debt.type);
  const { bg, text } = getDebtColor(debt.type);

  if (debt.isPaidOff) {
    return (
      <motion.div layout className="card-eliminated rounded-2xl p-5 border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="font-display font-bold text-amber-800">{debt.name}</div>
            <div className="text-amber-600 text-xs font-body">{debt.lender}</div>
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-amber-700 text-sm">ELIMINATED</div>
            <div className="text-amber-500 text-xs font-body">$0 remaining</div>
          </div>
        </div>
        <div className="mt-3 progress-bar-debt bg-amber-100">
          <div className="h-full w-full rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div layout className="glass-card overflow-hidden">
      {/* Card Header — clickable for drill-down */}
      <div className="p-5 cursor-pointer" onClick={() => onDrillDown(debt)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-slate-100/80 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-slate-500 text-xs font-bold font-display">{rank}</span>
          </div>
          <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-slate-900 text-sm truncate">{debt.name}</div>
            <div className="text-slate-400 text-xs font-body">{debt.lender}</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn(
              'text-xs font-bold font-body px-2.5 py-1 rounded-lg',
              threat === 'high' ? 'threat-high' : threat === 'medium' ? 'threat-medium' : 'threat-low'
            )}>
              {debt.rate}%
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-slate-400 text-xs font-body">Remaining</div>
            <div className="font-display text-2xl font-extrabold text-slate-900 tabular-nums tracking-tight">
              {formatCurrency(debt.balance)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-slate-400 text-xs font-body">Paid off</div>
            <div className="font-display font-bold text-emerald-600 tabular-nums text-lg">
              {progress.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="progress-bar-debt">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="progress-bar-fill"
          />
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="px-5 pb-4 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-slate-500 text-xs font-body">Auto-Strike</span>
          <button
            onClick={(e) => { e.stopPropagation(); toggleAutoStrike(debt.id); }}
            className={cn(
              'w-10 h-5 rounded-full transition-all duration-300 relative',
              debt.autoStrike ? 'bg-emerald-500' : 'bg-slate-200'
            )}
          >
            <motion.div
              animate={{ x: debt.autoStrike ? 20 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-4 h-4 bg-white rounded-full shadow-sm absolute top-0.5"
            />
          </button>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => { e.stopPropagation(); onStrike(debt); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold font-body hover:bg-slate-800 transition-colors"
        >
          <Zap className="w-3 h-3 text-emerald-400" /> Strike
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Main Targets Page ────────────────────────────────────────────────────────

export default function Targets() {
  const { settings, updateSettings, sortedDebts, totalDebt, debts, executeStrike } = useApp();
  const [strikeTarget, setStrikeTarget] = useState<Debt | null>(null);
  const [detailTarget, setDetailTarget] = useState<Debt | null>(null);

  const sorted = sortedDebts();
  const eliminated = debts.filter(d => d.isPaidOff).length;

  return (
    <AppShell
      title="Debt Map"
      subtitle={`${debts.filter(d => !d.isPaidOff).length} active targets · ${eliminated} eliminated`}
      headerRight={
        <div className="flex items-center gap-1 bg-slate-100/60 rounded-xl p-1 backdrop-blur-sm">
          {(['Avalanche', 'Snowball'] as Strategy[]).map(s => (
            <button
              key={s}
              onClick={() => updateSettings({ strategy: s })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold font-body transition-all',
                settings.strategy === s
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">

        {/* Strategy Comparison — full width */}
        <div className="lg:col-span-3">
          <StrategyComparison debts={debts} />
        </div>

        {/* Strategy explanation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.05 }}
          className="lg:col-span-2 glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700 text-sm font-body">
              {settings.strategy === 'Avalanche' ? 'Avalanche Strategy' : 'Snowball Strategy'}
            </span>
          </div>
          <p className="text-slate-400 text-xs font-body leading-relaxed">
            {settings.strategy === 'Avalanche'
              ? 'Targeting highest interest rate first. Mathematically optimal — saves the most money in total interest paid.'
              : 'Targeting smallest balance first. Psychologically motivating — eliminates debts faster for momentum.'
            }
          </p>
        </motion.div>

        {/* Total debt summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.1 }}
          className="glass-card p-5"
        >
          <div className="text-slate-400 text-xs font-body uppercase tracking-wider mb-1">Total Remaining</div>
          <div className="font-display text-2xl font-extrabold text-slate-900 tabular-nums tracking-tight">
            {formatCurrency(totalDebt())}
          </div>
          <div className="text-emerald-600 text-xs font-bold font-body mt-1">
            {eliminated} / {debts.length} eliminated
          </div>
        </motion.div>

        {/* Debt Cards — span full width, grid on desktop */}
        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <AnimatePresence>
            {sorted.map((debt, i) => (
              <motion.div
                key={debt.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <DebtCard
                  debt={debt}
                  rank={i + 1}
                  onStrike={setStrikeTarget}
                  onDrillDown={setDetailTarget}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Threat Level Guide */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 glass-card p-4"
        >
          <div className="text-slate-400 text-xs font-body uppercase tracking-wider mb-3">Threat Level Guide</div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="threat-high">HIGH</span>
              <span className="text-slate-400 text-xs font-body">&gt;10% APR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="threat-medium">MED</span>
              <span className="text-slate-400 text-xs font-body">5–10%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="threat-low">LOW</span>
              <span className="text-slate-400 text-xs font-body">&lt;5%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {strikeTarget && (
          <StrikeModal
            debt={strikeTarget}
            onClose={() => setStrikeTarget(null)}
            onExecute={(amount) => {
              executeStrike(strikeTarget.id, amount);
              setStrikeTarget(null);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {detailTarget && (
          <DebtDetailModal
            debt={detailTarget}
            onClose={() => setDetailTarget(null)}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
