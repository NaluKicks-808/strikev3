/**
 * Project STRIKE — War Room Dashboard v3.1
 * Merged: StrikePay dark-themed bento layout + StrikeWealth data model
 * V3.1: Added drill-down modals with Recharts for Total Debt, Net Worth, Target Details
 * Cards: Safety Net, Total Debt, Net Worth, Debt-Free Date,
 *        Strategy, Active Targets, AI Daily Recap, Recent Strikes, Subscriptions
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import {
  Zap,
  Clock,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
  Crosshair,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Coffee,
  CreditCard,
  Target,
  Calendar,
  BarChart3,
  Home,
  GraduationCap,
  Car,
  DollarSign,
  X,
  Info,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
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

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatCurrency(n: number, compact = false): string {
  if (compact && Math.abs(n) >= 1000) {
    return (n < 0 ? '-' : '') + '$' + (Math.abs(n) / 1000).toFixed(1) + 'k';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getGreeting(): { text: string; icon: React.ElementType } {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', icon: Coffee };
  if (h < 17) return { text: 'Good afternoon', icon: Sun };
  return { text: 'Good evening', icon: Moon };
}

function getDateString(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

const DEBT_ICONS: Record<string, React.ElementType> = {
  Mortgage: Home,
  Student: GraduationCap,
  Auto: Car,
  Credit: CreditCard,
};

const DEBT_EMOJI: Record<string, string> = {
  Mortgage: '🏠',
  Student: '🎓',
  Auto: '🚗',
  Credit: '💳',
};

const PIE_COLORS = ['#0f172a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

// ─── Spring Animated Number ───────────────────────────────────────────────────

function AnimatedNumber({ value, prefix = '', suffix = '', className = '' }: {
  value: number; prefix?: string; suffix?: string; className?: string;
}) {
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v: number) => Math.round(v).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.span className={className}>
      {prefix}<motion.span>{display}</motion.span>{suffix}
    </motion.span>
  );
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_SUBSCRIPTIONS = [
  { name: 'Netflix', amount: 15.99 },
  { name: 'Spotify', amount: 10.99 },
  { name: 'iCloud+', amount: 2.99 },
  { name: 'YouTube Premium', amount: 13.99 },
  { name: 'Planet Fitness', amount: 24.99 },
  { name: 'Adobe CC', amount: 54.99 },
  { name: 'ChatGPT Plus', amount: 20.00 },
  { name: 'Costco', amount: 5.00 },
];

const MOCK_ASSETS = [
  { name: 'Primary Residence', value: 715_000 },
  { name: 'Vehicle (2023 RAV4)', value: 24_500 },
  { name: '401(k) + Roth IRA', value: 87_400 },
  { name: 'Emergency Savings', value: 12_300 },
];

// ─── Modal Wrapper ──────────────────────────────────────────────────────────

function DrillDownModal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Total Debt Modal ───────────────────────────────────────────────────────

function TotalDebtModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { debts } = useApp();
  const activeDebts = debts.filter(d => !d.isPaidOff);

  // Pie chart data
  const pieData = activeDebts.map(d => ({
    name: d.name.length > 20 ? d.name.substring(0, 18) + '...' : d.name,
    value: d.balance,
    type: d.type,
    rate: d.rate,
  }));

  // Payoff velocity line chart — mock 12 months of data
  const velocityData = useMemo(() => {
    const totalStart = activeDebts.reduce((s, d) => s + d.balance, 0);
    const months: { month: string; standard: number; strike: number }[] = [];
    let stdBalance = totalStart;
    let strikeBalance = totalStart;
    const minPayments = activeDebts.reduce((s, d) => s + d.minPayment, 0);
    const avgRate = activeDebts.reduce((s, d) => s + d.rate, 0) / activeDebts.length / 100;

    for (let i = 0; i <= 12; i++) {
      const monthName = new Date(Date.now() + i * 30 * 86400000).toLocaleDateString('en-US', { month: 'short' });
      months.push({
        month: monthName,
        standard: Math.round(stdBalance),
        strike: Math.round(strikeBalance),
      });
      // Standard: min payments only
      stdBalance = stdBalance * (1 + avgRate / 12) - minPayments;
      // STRIKE: min payments + $500 extra principal
      strikeBalance = strikeBalance * (1 + avgRate / 12) - minPayments - 500;
      if (stdBalance < 0) stdBalance = 0;
      if (strikeBalance < 0) strikeBalance = 0;
    }
    return months;
  }, [activeDebts]);

  return (
    <DrillDownModal open={open} onClose={onClose} title="Total Debt Breakdown">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div>
          <h4 className="text-slate-400 text-xs font-body uppercase tracking-widest font-semibold mb-4">Debt Composition</h4>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Debt list */}
        <div>
          <h4 className="text-slate-400 text-xs font-body uppercase tracking-widest font-semibold mb-4">By Account</h4>
          <div className="space-y-3">
            {activeDebts.map((debt, i) => (
              <div key={debt.id} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 font-body truncate">{debt.name}</div>
                  <div className="text-xs text-slate-400 font-body">{debt.rate}% APR</div>
                </div>
                <div className="font-display font-bold text-slate-900 tabular-nums text-sm">
                  {formatCurrency(debt.balance)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payoff Velocity Chart */}
      <div>
        <h4 className="text-slate-400 text-xs font-body uppercase tracking-widest font-semibold mb-4">Payoff Velocity — Next 12 Months</h4>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'standard' ? 'Min. Payments Only' : 'With STRIKE'
                ]}
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <Line
                type="monotone"
                dataKey="standard"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                strokeDasharray="6 3"
                name="standard"
              />
              <Line
                type="monotone"
                dataKey="strike"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                name="strike"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-3 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-red-500 rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #ef4444 0, #ef4444 6px, transparent 6px, transparent 9px)' }} />
            <span className="text-xs text-slate-400 font-body">Min. Payments Only</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-emerald-500 rounded-full" />
            <span className="text-xs text-slate-400 font-body">With STRIKE</span>
          </div>
        </div>
      </div>
    </DrillDownModal>
  );
}

// ─── Net Worth Modal ────────────────────────────────────────────────────────

function NetWorthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { totalDebt, bankAccount } = useApp();
  const totalAssets = MOCK_ASSETS.reduce((s, a) => s + a.value, 0) + bankAccount.balance;
  const totalLiabilities = totalDebt();

  // Mock 12-month net worth history
  const netWorthHistory = useMemo(() => {
    const months: { month: string; assets: number; liabilities: number; netWorth: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const assetGrowth = totalAssets * (1 - i * 0.008); // slight growth
      const liabDecline = totalLiabilities * (1 + i * 0.005); // debts were higher
      months.push({
        month: monthName,
        assets: Math.round(assetGrowth),
        liabilities: Math.round(liabDecline),
        netWorth: Math.round(assetGrowth - liabDecline),
      });
    }
    return months;
  }, [totalAssets, totalLiabilities]);

  return (
    <DrillDownModal open={open} onClose={onClose} title="Net Worth Details">
      {/* Asset vs Liability Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <div className="text-emerald-600 text-xs font-body uppercase tracking-widest font-semibold mb-2">Total Assets</div>
          <div className="font-display text-2xl font-extrabold text-emerald-700 tabular-nums">
            {formatCurrency(totalAssets)}
          </div>
          <div className="mt-3 space-y-2">
            {MOCK_ASSETS.map(a => (
              <div key={a.name} className="flex justify-between text-xs font-body">
                <span className="text-emerald-600">{a.name}</span>
                <span className="font-semibold text-emerald-700 tabular-nums">{formatCurrency(a.value, true)}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs font-body pt-1 border-t border-emerald-200">
              <span className="text-emerald-600">Bank Balance</span>
              <span className="font-semibold text-emerald-700 tabular-nums">{formatCurrency(bankAccount.balance, true)}</span>
            </div>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="text-red-600 text-xs font-body uppercase tracking-widest font-semibold mb-2">Total Liabilities</div>
          <div className="font-display text-2xl font-extrabold text-red-700 tabular-nums">
            {formatCurrency(totalLiabilities)}
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <h4 className="text-slate-400 text-xs font-body uppercase tracking-widest font-semibold mb-4">Net Worth Trend — 12 Months</h4>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={netWorthHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'assets' ? 'Assets' : name === 'liabilities' ? 'Liabilities' : 'Net Worth'
              ]}
              contentStyle={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            />
            <Area
              type="monotone"
              dataKey="assets"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.1}
              strokeWidth={2}
              name="assets"
            />
            <Area
              type="monotone"
              dataKey="liabilities"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.08}
              strokeWidth={2}
              strokeDasharray="6 3"
              name="liabilities"
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.05}
              strokeWidth={2.5}
              name="netWorth"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DrillDownModal>
  );
}

// ─── Target Detail Modal ────────────────────────────────────────────────────

function TargetDetailModal({ open, onClose, debtId }: { open: boolean; onClose: () => void; debtId: string | null }) {
  const { debts, activity } = useApp();
  const debt = debts.find(d => d.id === debtId);

  // Generate amortization schedule for this debt
  const amortData = useMemo(() => {
    if (!debt) return [];
    const months: { month: number; standard: number; strike: number }[] = [];
    let stdBal = debt.balance;
    let strikeBal = debt.balance;
    const monthlyRate = debt.rate / 100 / 12;
    const minPay = debt.minPayment;
    const extraPrincipal = 200; // mock extra

    for (let m = 0; m <= 60; m += 3) { // every 3 months for 5 years
      months.push({
        month: m,
        standard: Math.round(stdBal),
        strike: Math.round(strikeBal),
      });
      for (let j = 0; j < 3; j++) {
        const stdInterest = stdBal * monthlyRate;
        stdBal = stdBal + stdInterest - minPay;
        const strikeInterest = strikeBal * monthlyRate;
        strikeBal = strikeBal + strikeInterest - minPay - extraPrincipal;
        if (stdBal < 0) stdBal = 0;
        if (strikeBal < 0) strikeBal = 0;
      }
    }
    return months;
  }, [debt]);

  // Filter strikes for this debt
  const debtStrikes = activity.filter(a =>
    a.debtId === debtId && (a.type === 'strike' || a.type === 'surplus')
  );

  if (!debt) return null;

  const paidPct = ((debt.startBalance - debt.balance) / debt.startBalance) * 100;
  const totalPaid = debt.startBalance - debt.balance;
  const totalInterestOnLoan = debt.balance * (debt.rate / 100) * 30; // rough estimate

  return (
    <DrillDownModal open={open} onClose={onClose} title={debt.name}>
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-slate-50 rounded-xl p-3.5">
          <div className="text-slate-400 text-[10px] font-body uppercase tracking-widest font-semibold mb-1">Balance</div>
          <div className="font-display text-xl font-extrabold text-slate-900 tabular-nums">{formatCurrency(debt.balance)}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3.5">
          <div className="text-slate-400 text-[10px] font-body uppercase tracking-widest font-semibold mb-1">APR</div>
          <div className={cn(
            'font-display text-xl font-extrabold tabular-nums',
            debt.rate > 10 ? 'text-red-500' : debt.rate > 6 ? 'text-amber-600' : 'text-emerald-600'
          )}>
            {debt.rate}%
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3.5">
          <div className="text-slate-400 text-[10px] font-body uppercase tracking-widest font-semibold mb-1">Min. Payment</div>
          <div className="font-display text-xl font-extrabold text-slate-900 tabular-nums">{formatCurrency(debt.minPayment)}</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-100">
          <div className="text-emerald-600 text-[10px] font-body uppercase tracking-widest font-semibold mb-1">Principal Paid</div>
          <div className="font-display text-xl font-extrabold text-emerald-700 tabular-nums">{paidPct.toFixed(1)}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-body text-slate-400 mb-2">
          <span>Progress: {formatCurrency(totalPaid)} paid</span>
          <span>{formatCurrency(debt.balance)} remaining</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${paidPct}%` }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          />
        </div>
      </div>

      {/* Amortization Chart */}
      <h4 className="text-slate-400 text-xs font-body uppercase tracking-widest font-semibold mb-4">Amortization Projection — 5 Years</h4>
      <div className="h-[260px] mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={amortData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              label={{ value: 'Months', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#94a3b8' }}
            />
            <YAxis
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'standard' ? 'Min. Payments Only' : 'With STRIKE'
              ]}
              contentStyle={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            />
            <Area
              type="monotone"
              dataKey="standard"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.06}
              strokeWidth={2}
              strokeDasharray="6 3"
              name="standard"
            />
            <Area
              type="monotone"
              dataKey="strike"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.1}
              strokeWidth={2.5}
              name="strike"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Strike History for this loan */}
      <h4 className="text-slate-400 text-xs font-body uppercase tracking-widest font-semibold mb-4">
        Strike History — {debt.name}
      </h4>
      {debtStrikes.length > 0 ? (
        <div className="space-y-2">
          {debtStrikes.slice(0, 8).map(strike => (
            <div key={strike.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-700 font-body">
                  {strike.type === 'surplus' ? 'Surplus Strike' : 'Manual Strike'}
                </div>
                <div className="text-xs text-slate-400 font-body">{timeAgo(strike.timestamp)}</div>
              </div>
              <div className="font-display font-bold text-emerald-600 tabular-nums text-sm">
                +{formatCurrency(strike.amount)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-300 text-sm font-body">
          No strikes executed against this target yet.
        </div>
      )}
    </DrillDownModal>
  );
}

// ─── Card Components ─────────────────────────────────────────────────────────

/** Safety Net Card */
function SafetyNetCard() {
  const { bankAccount, settings, updateSettings, surplus } = useApp();
  const [safetyNetDrag, setSafetyNetDrag] = useState(settings.safetyNet);
  const liveSurplus = Math.max(0, bankAccount.balance - safetyNetDrag);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="lg:col-span-3 rounded-2xl p-6 lg:p-7"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 text-xs font-body uppercase tracking-widest font-semibold">Safety Net</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-slate-400 text-xs font-body font-medium">Auto-Strike</span>
          <button
            onClick={() => updateSettings({ isPaused: !settings.isPaused })}
            className={cn(
              'relative w-11 h-[26px] rounded-full transition-all duration-300',
              settings.isPaused ? 'bg-slate-600' : 'bg-emerald-500'
            )}
          >
            <motion.div
              animate={{ x: settings.isPaused ? 2 : 18 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-[3px] w-5 h-5 bg-white rounded-full shadow-sm"
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div>
          <div className="text-slate-500 text-xs font-body mb-1.5">Bank Balance</div>
          <div className="font-display text-3xl lg:text-4xl font-extrabold text-white tabular-nums tracking-tight">
            <AnimatedNumber value={bankAccount.balance} prefix="$" />
          </div>
        </div>
        <div>
          <div className="text-slate-500 text-xs font-body mb-1.5">Safety Floor</div>
          <div className="font-display text-3xl lg:text-4xl font-extrabold text-slate-300 tabular-nums tracking-tight">
            {formatCurrency(safetyNetDrag)}
          </div>
        </div>
        <div>
          <div className="text-slate-500 text-xs font-body mb-1.5">Strike Surplus</div>
          <div className={cn(
            'font-display text-3xl lg:text-4xl font-extrabold tabular-nums tracking-tight',
            liveSurplus > 0 ? 'text-emerald-400' : 'text-red-400'
          )}>
            {formatCurrency(liveSurplus)}
          </div>
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min={1000}
          max={25000}
          step={500}
          value={safetyNetDrag}
          onChange={e => {
            const v = Number(e.target.value);
            setSafetyNetDrag(v);
            updateSettings({ safetyNet: v });
          }}
          className="w-full range-dark"
        />
        <div className="flex justify-between text-xs text-slate-600 font-body mt-2">
          <span>$1,000</span>
          <span>{formatCurrency(safetyNetDrag)}</span>
          <span>$25,000</span>
        </div>
      </div>
    </motion.div>
  );
}

/** Total Debt Card — Now clickable */
function TotalDebtCard({ onClick }: { onClick: () => void }) {
  const { totalDebt, debts } = useApp();
  const minPayments = debts.reduce((s, d) => s + d.minPayment, 0);
  const activeCount = debts.filter(d => !d.isPaidOff).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.05 }}
      onClick={onClick}
      className="rounded-2xl p-5 lg:p-6 cursor-pointer group hover:ring-2 hover:ring-emerald-500/20 transition-all"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-slate-400 text-xs font-body uppercase tracking-widest font-semibold">Total Debt</div>
        <Info className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
      </div>
      <div className="font-display text-4xl lg:text-5xl font-extrabold text-white tabular-nums tracking-tight mb-2">
        <AnimatedNumber value={Math.round(totalDebt())} prefix="$" />
      </div>
      <div className="text-slate-500 text-xs font-body mb-4">
        Across {activeCount} active accounts
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
        <span className="text-slate-500 text-xs font-body">Min. Payments</span>
        <span className="ml-auto font-display font-bold text-slate-300 tabular-nums text-sm">
          {formatCurrency(minPayments)}/mo
        </span>
      </div>
    </motion.div>
  );
}

/** Net Worth Card — Now clickable */
function NetWorthCard({ onClick }: { onClick: () => void }) {
  const { totalDebt, bankAccount } = useApp();
  const totalAssets = MOCK_ASSETS.reduce((s, a) => s + a.value, 0) + bankAccount.balance;
  const totalLiabilities = totalDebt();
  const netWorth = totalAssets - totalLiabilities;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.1 }}
      onClick={onClick}
      className="rounded-2xl p-5 lg:p-6 cursor-pointer group hover:ring-2 hover:ring-emerald-500/20 transition-all"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-slate-400 text-xs font-body uppercase tracking-widest font-semibold">Net Worth</div>
        <Info className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
      </div>
      <div className={cn(
        'font-display text-4xl lg:text-5xl font-extrabold tabular-nums tracking-tight mb-2',
        netWorth >= 0 ? 'text-white' : 'text-red-400'
      )}>
        <AnimatedNumber value={Math.round(netWorth)} prefix="$" />
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div>
          <span className="text-slate-500 text-xs font-body">Assets</span>
          <div className="font-display font-bold text-emerald-400 tabular-nums text-sm">
            {formatCurrency(totalAssets, true)}
          </div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div>
          <span className="text-slate-500 text-xs font-body">Liabilities</span>
          <div className="font-display font-bold text-red-400 tabular-nums text-sm">
            {formatCurrency(totalLiabilities, true)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Debt-Free Date Card */
function DebtFreeDateCard() {
  const { totalInterestKilled, timeAssassinated } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.15 }}
      className="rounded-2xl p-5 lg:p-6"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="text-slate-400 text-xs font-body uppercase tracking-widest font-semibold mb-3">Debt-Free Date</div>
      <div className="font-display text-4xl lg:text-5xl font-extrabold text-white tabular-nums tracking-tight mb-1">
        May 2028
      </div>
      <div className="text-slate-500 text-xs font-body mb-4">26 months remaining</div>
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
        <div>
          <span className="text-slate-500 text-xs font-body">Interest Saved</span>
          <div className="font-display font-bold text-emerald-400 tabular-nums text-sm">
            {formatCurrency(Math.round(totalInterestKilled()), true)}
          </div>
        </div>
        <div>
          <span className="text-slate-500 text-xs font-body">Months Saved</span>
          <div className="font-display font-bold text-emerald-400 tabular-nums text-sm">
            {timeAssassinated()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Strategy Toggle Card */
function StrategyCard() {
  const { settings, updateSettings } = useApp();

  const descriptions = {
    Avalanche: 'Targeting highest interest rate first. Saves the most money.',
    Snowball: 'Targeting smallest balance first. Fastest psychological wins.',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.2 }}
      className="glass-card p-5 lg:p-6"
    >
      <div className="text-slate-400 text-xs font-body uppercase tracking-widest font-semibold mb-4">Strategy</div>
      <div className="flex items-center gap-2 mb-4">
        {(['Avalanche', 'Snowball'] as const).map(s => (
          <button
            key={s}
            onClick={() => updateSettings({ strategy: s })}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-semibold font-body transition-all duration-300',
              settings.strategy === s
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-100/60 text-slate-500 hover:bg-slate-200/60'
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="text-slate-400 text-xs font-body leading-relaxed">
        {descriptions[settings.strategy]}
      </p>
    </motion.div>
  );
}

/** Active Targets Card — Now with clickable debt rows */
function ActiveTargetsCard({ onTargetClick }: { onTargetClick: (debtId: string) => void }) {
  const { sortedDebts, settings } = useApp();
  const activeDebts = sortedDebts().filter(d => !d.isPaidOff);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.25 }}
      className="glass-card p-5 lg:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-slate-400 text-xs font-body uppercase tracking-widest font-semibold">
          Active Targets — {settings.strategy}
        </div>
        <Link href="/targets">
          <span className="text-emerald-600 text-xs font-semibold font-body hover:text-emerald-700 transition-colors cursor-pointer flex items-center gap-1">
            View Map <ChevronRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      <div className="space-y-1">
        {activeDebts.map((debt, i) => {
          const paidPct = ((debt.startBalance - debt.balance) / debt.startBalance) * 100;
          return (
            <motion.div
              key={debt.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 + i * 0.04 }}
              onClick={() => onTargetClick(debt.id)}
              className="flex items-center gap-3 py-3 border-b border-slate-100/50 last:border-0 cursor-pointer group hover:bg-slate-50/40 rounded-xl px-2 -mx-2 transition-colors"
            >
              <span className="text-xl flex-shrink-0">{DEBT_EMOJI[debt.type] || '💰'}</span>
              <div className="flex-1 min-w-0">
                <div className="font-body font-semibold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">{debt.name}</div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 mt-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${paidPct}%` }}
                    transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.4 + i * 0.05 }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-display font-bold text-slate-900 tabular-nums text-sm">
                  {formatCurrency(debt.balance)}
                </div>
                <div className={cn(
                  'text-xs font-bold font-body tabular-nums',
                  debt.rate > 10 ? 'text-red-500' : debt.rate > 6 ? 'text-amber-500' : 'text-emerald-500'
                )}>
                  {debt.rate}%
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/** AI Daily Recap Card */
function AIRecapCard() {
  const { debts, activity, totalInterestKilled } = useApp();
  const greeting = getGreeting();

  const todayStrikes = activity.filter(a =>
    (a.type === 'strike' || a.type === 'surplus') &&
    Date.now() - new Date(a.timestamp).getTime() < 24 * 60 * 60 * 1000
  );
  const todayTotal = todayStrikes.reduce((s, a) => s + a.amount, 0);

  const topDebt = debts.find(d => !d.isPaidOff && d.rate === Math.max(...debts.filter(x => !x.isPaidOff).map(x => x.rate)));
  const dailyInterest = topDebt ? (topDebt.balance * (topDebt.rate / 100) / 365) : 0;

  const recaps = [
    {
      date: new Date().toISOString().split('T')[0],
      text: topDebt
        ? `Your ${topDebt.name} accrued $${dailyInterest.toFixed(2)} in interest yesterday, but your $${todayTotal > 0 ? todayTotal.toFixed(0) : '200'} manual strike outpaced it by ${todayTotal > 0 ? Math.floor(todayTotal / dailyInterest) : 68}x. At this rate, you'll eliminate it 4 months early.`
        : 'All systems nominal. Monitoring for surplus.',
    },
    {
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      text: 'Round-ups generated $1.55 this week across 3 transactions. Small, but that\'s $80/year in free principal reduction.',
    },
    {
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      text: `Your Safety Net is at $${(8420).toLocaleString()} — well above your $5,000 threshold. STRIKE is fully armed and operational.`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.3 }}
      className="glass-card p-5 lg:p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-emerald-500" />
        <span className="text-slate-400 text-xs font-body uppercase tracking-widest font-semibold">AI Daily Recap</span>
      </div>

      <div className="space-y-4">
        {recaps.map((recap, i) => (
          <motion.div
            key={recap.date}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.35 + i * 0.05 }}
            className={cn(
              'p-4 rounded-xl',
              i === 0 ? 'bg-emerald-50/60 border border-emerald-100/50' : 'bg-slate-50/40'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className={cn('w-3 h-3', i === 0 ? 'text-emerald-500' : 'text-slate-400')} />
              <span className="text-slate-400 text-xs font-body font-medium">{recap.date}</span>
            </div>
            <p className="text-slate-600 text-sm font-body leading-relaxed">
              {recap.text}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/** Recent Strikes Feed */
function RecentStrikesCard() {
  const { activity } = useApp();

  const icons: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
    strike: { icon: Zap, bg: 'bg-emerald-50/80', color: 'text-emerald-600' },
    roundup: { icon: ArrowUpRight, bg: 'bg-blue-50/80', color: 'text-blue-600' },
    surplus: { icon: Zap, bg: 'bg-emerald-50/80', color: 'text-emerald-600' },
    shield: { icon: ShieldCheck, bg: 'bg-amber-50/80', color: 'text-amber-600' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.35 }}
      className="glass-card p-5 lg:p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-slate-400" />
        <span className="text-slate-400 text-xs font-body uppercase tracking-widest font-semibold">Recent Strikes</span>
      </div>

      <div className="space-y-1">
        {activity.slice(0, 5).map((item, i) => {
          const { icon: Icon, bg, color } = icons[item.type] || icons.strike;
          const typeLabels: Record<string, string> = {
            strike: 'Manual Strike',
            surplus: 'Surplus Strike',
            roundup: 'Round-Up',
            shield: 'Shield Event',
          };
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.4 + i * 0.03 }}
              className="flex items-center gap-3 py-3 border-b border-slate-100/50 last:border-0"
            >
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
                <Icon className={cn('w-4 h-4', color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-body font-semibold text-slate-700 text-sm">{typeLabels[item.type] || 'Strike'}</div>
                <div className="text-slate-400 text-xs font-body mt-0.5 truncate">
                  {item.description.length > 40
                    ? item.description.substring(0, 40) + '...'
                    : item.description}
                  {' → '}{item.debtName}
                </div>
              </div>
              <div className="font-display font-bold text-emerald-600 tabular-nums text-sm flex-shrink-0">
                +{formatCurrency(item.amount)}
              </div>
            </motion.div>
          );
        })}
        {activity.length === 0 && (
          <div className="text-center py-6 text-slate-300 text-sm font-body">
            No strikes yet. Connect your bank to begin.
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** Subscriptions Summary Card */
function SubscriptionsCard() {
  const totalSubs = MOCK_SUBSCRIPTIONS.reduce((s, sub) => s + sub.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.4 }}
      className="glass-card p-5 lg:p-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 text-xs font-body uppercase tracking-widest font-semibold">Subscriptions</span>
        </div>
        <Link href="/subscriptions">
          <span className="text-emerald-600 text-xs font-semibold font-body hover:text-emerald-700 transition-colors cursor-pointer">
            Manage
          </span>
        </Link>
      </div>
      <div className="font-display text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
        ${totalSubs.toFixed(2)}<span className="text-lg text-slate-400 font-normal">/mo</span>
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { settings } = useApp();
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showNetWorthModal, setShowNetWorthModal] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  return (
    <AppShell
      title="War Room"
      subtitle={getDateString()}
    >
      {/* Modals */}
      <TotalDebtModal open={showDebtModal} onClose={() => setShowDebtModal(false)} />
      <NetWorthModal open={showNetWorthModal} onClose={() => setShowNetWorthModal(false)} />
      <TargetDetailModal
        open={selectedTargetId !== null}
        onClose={() => setSelectedTargetId(null)}
        debtId={selectedTargetId}
      />

      {/* Paused Banner */}
      <AnimatePresence>
        {settings.isPaused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="mb-5"
          >
            <div className="glass-card p-4 flex items-center gap-3 border-amber-200/50 bg-amber-50/60">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <div className="font-display font-bold text-amber-800 text-sm">All Strikes Paused</div>
                <div className="text-amber-600 text-xs font-body">Toggle Auto-Strike in the Safety Net card to resume</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">

        {/* Row 1: Safety Net — full width dark card */}
        <SafetyNetCard />

        {/* Row 2: Total Debt + Net Worth + Debt-Free Date */}
        <TotalDebtCard onClick={() => setShowDebtModal(true)} />
        <NetWorthCard onClick={() => setShowNetWorthModal(true)} />
        <DebtFreeDateCard />

        {/* Row 3: Strategy + Active Targets (span 2) */}
        <StrategyCard />
        <div className="lg:col-span-2">
          <ActiveTargetsCard onTargetClick={(id) => setSelectedTargetId(id)} />
        </div>

        {/* Row 4: AI Recap + Recent Strikes */}
        <div className="lg:col-span-2">
          <AIRecapCard />
        </div>
        <RecentStrikesCard />

        {/* Row 5: Subscriptions */}
        <SubscriptionsCard />

      </div>
    </AppShell>
  );
}
