/**
 * Project STRIKE — Subscription Assassin
 * Scans connected bank for recurring subscriptions, allows 1-click cancellation,
 * and routes saved monthly money into the Strike Buffer.
 * Glassmorphism + spring animations + desktop bento grid
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Trash2,
  Zap,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Tv,
  Music,
  Dumbbell,
  Cloud,
  ShoppingBag,
  Gamepad2,
  Newspaper,
  Shield,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

// ─── Mock Subscription Data ───────────────────────────────────────────────────

interface Subscription {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  lastCharged: string;
  status: 'active' | 'cancelled' | 'rerouted';
  color: string;
}

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub-1', name: 'Netflix Premium', category: 'Streaming', icon: Tv, amount: 22.99, billingCycle: 'monthly', lastCharged: '2026-03-01', status: 'active', color: '#e50914' },
  { id: 'sub-2', name: 'Spotify Family', category: 'Music', icon: Music, amount: 16.99, billingCycle: 'monthly', lastCharged: '2026-03-05', status: 'active', color: '#1db954' },
  { id: 'sub-3', name: 'Planet Fitness', category: 'Fitness', icon: Dumbbell, amount: 24.99, billingCycle: 'monthly', lastCharged: '2026-03-01', status: 'active', color: '#6b21a8' },
  { id: 'sub-4', name: 'iCloud+ 200GB', category: 'Cloud Storage', icon: Cloud, amount: 2.99, billingCycle: 'monthly', lastCharged: '2026-03-10', status: 'active', color: '#3b82f6' },
  { id: 'sub-5', name: 'Amazon Prime', category: 'Shopping', icon: ShoppingBag, amount: 14.99, billingCycle: 'monthly', lastCharged: '2026-02-28', status: 'active', color: '#f59e0b' },
  { id: 'sub-6', name: 'Xbox Game Pass', category: 'Gaming', icon: Gamepad2, amount: 16.99, billingCycle: 'monthly', lastCharged: '2026-03-08', status: 'active', color: '#22c55e' },
  { id: 'sub-7', name: 'NYT Digital', category: 'News', icon: Newspaper, amount: 4.25, billingCycle: 'monthly', lastCharged: '2026-03-03', status: 'active', color: '#000000' },
  { id: 'sub-8', name: 'NordVPN', category: 'Security', icon: Shield, amount: 12.99, billingCycle: 'monthly', lastCharged: '2026-03-06', status: 'active', color: '#4a86cf' },
];

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

// ─── Subscription Card ────────────────────────────────────────────────────────

function SubCard({ sub, onCancel, onReroute }: {
  sub: Subscription;
  onCancel: () => void;
  onReroute: () => void;
}) {
  const [confirming, setConfirming] = useState<'cancel' | 'reroute' | null>(null);
  const [processing, setProcessing] = useState(false);
  const Icon = sub.icon;

  const handleAction = (action: 'cancel' | 'reroute') => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setConfirming(null);
      if (action === 'cancel') onCancel();
      else onReroute();
    }, 1000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'glass-card p-5 overflow-hidden',
        sub.status === 'cancelled' && 'opacity-50',
        sub.status === 'rerouted' && 'border-emerald-200/50'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: sub.color + '15' }}
        >
          <Icon className="w-5 h-5" style={{ color: sub.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-slate-900 text-sm truncate">{sub.name}</div>
          <div className="text-slate-400 text-xs font-body">{sub.category}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-display font-bold text-slate-900 tabular-nums text-sm">
            {formatCurrency(sub.amount)}
          </div>
          <div className="text-slate-400 text-xs font-body">/mo</div>
        </div>
      </div>

      {sub.status === 'active' && !confirming && (
        <div className="flex items-center gap-2 mt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setConfirming('reroute')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50/80 text-emerald-700 rounded-xl text-xs font-semibold font-body hover:bg-emerald-100/80 transition-colors backdrop-blur-sm"
          >
            <Zap className="w-3 h-3" /> Route to Strike
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setConfirming('cancel')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50/80 text-red-600 rounded-xl text-xs font-semibold font-body hover:bg-red-100/80 transition-colors backdrop-blur-sm"
          >
            <Trash2 className="w-3 h-3" /> Cancel
          </motion.button>
        </div>
      )}

      {confirming && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4"
        >
          <div className={cn(
            'p-3 rounded-xl text-xs font-body mb-3',
            confirming === 'cancel' ? 'bg-red-50/80 text-red-700' : 'bg-emerald-50/80 text-emerald-700'
          )}>
            {confirming === 'cancel'
              ? `Cancel ${sub.name}? This will save ${formatCurrency(sub.amount)}/mo.`
              : `Route ${formatCurrency(sub.amount)}/mo from ${sub.name} directly to your Strike Buffer?`
            }
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction(confirming)}
              disabled={processing}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-semibold font-body flex items-center justify-center gap-1.5',
                confirming === 'cancel'
                  ? 'bg-red-500 text-white'
                  : 'bg-emerald-500 text-white'
              )}
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Confirm</>
              )}
            </motion.button>
            <button
              onClick={() => setConfirming(null)}
              className="px-3 py-2 text-slate-400 text-xs font-body"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {sub.status === 'cancelled' && (
        <div className="mt-3 flex items-center gap-2 text-red-500 text-xs font-semibold font-body">
          <CheckCircle2 className="w-3.5 h-3.5" /> Cancelled — {formatCurrency(sub.amount)}/mo saved
        </div>
      )}

      {sub.status === 'rerouted' && (
        <div className="mt-3 flex items-center gap-2 text-emerald-600 text-xs font-semibold font-body">
          <Zap className="w-3.5 h-3.5" /> Rerouted — {formatCurrency(sub.amount)}/mo → Strike Buffer
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Subscriptions() {
  const { addActivity } = useApp();
  const [subs, setSubs] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);

  const activeSubs = subs.filter(s => s.status === 'active');
  const cancelledSubs = subs.filter(s => s.status === 'cancelled');
  const reroutedSubs = subs.filter(s => s.status === 'rerouted');

  const totalMonthly = activeSubs.reduce((s, sub) => s + sub.amount, 0);
  const totalSaved = cancelledSubs.reduce((s, sub) => s + sub.amount, 0);
  const totalRerouted = reroutedSubs.reduce((s, sub) => s + sub.amount, 0);

  const handleCancel = (id: string) => {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' as const } : s));
    const sub = subs.find(s => s.id === id);
    if (sub) {
      addActivity({
        description: `Subscription cancelled: ${sub.name} (${formatCurrency(sub.amount)}/mo)`,
        amount: sub.amount,
        type: 'surplus',
        debtName: 'Strike Buffer',
      });
    }
  };

  const handleReroute = (id: string) => {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status: 'rerouted' as const } : s));
    const sub = subs.find(s => s.id === id);
    if (sub) {
      addActivity({
        description: `Subscription rerouted to Strike Buffer: ${sub.name}`,
        amount: sub.amount,
        type: 'strike',
        debtName: 'Strike Buffer',
      });
    }
  };

  return (
    <AppShell
      title="Subscription Assassin"
      subtitle={`${activeSubs.length} active subscriptions detected`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="glass-card p-5 lg:p-6"
        >
          <div className="w-10 h-10 bg-slate-100/80 rounded-2xl flex items-center justify-center mb-4">
            <CreditCard className="w-4.5 h-4.5 text-slate-600" />
          </div>
          <div className="font-display text-2xl lg:text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight mb-1">
            {formatCurrency(totalMonthly)}
          </div>
          <div className="text-slate-500 text-xs font-semibold font-body uppercase tracking-wider">Monthly Subscriptions</div>
          <div className="text-slate-400 text-xs font-body mt-1">{activeSubs.length} active services</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.05 }}
          className="glass-card p-5 lg:p-6"
        >
          <div className="w-10 h-10 bg-red-50/80 rounded-2xl flex items-center justify-center mb-4">
            <Trash2 className="w-4.5 h-4.5 text-red-500" />
          </div>
          <div className="font-display text-2xl lg:text-3xl font-extrabold text-red-500 tabular-nums tracking-tight mb-1">
            {formatCurrency(totalSaved)}
          </div>
          <div className="text-slate-500 text-xs font-semibold font-body uppercase tracking-wider">Cancelled / Saved</div>
          <div className="text-slate-400 text-xs font-body mt-1">{cancelledSubs.length} subscriptions cut</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.1 }}
          className="glass-card p-5 lg:p-6"
        >
          <div className="w-10 h-10 bg-emerald-50/80 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div className="font-display text-2xl lg:text-3xl font-extrabold text-emerald-600 tabular-nums tracking-tight mb-1">
            {formatCurrency(totalRerouted)}
          </div>
          <div className="text-slate-500 text-xs font-semibold font-body uppercase tracking-wider">Rerouted to Strike</div>
          <div className="text-slate-400 text-xs font-body mt-1">{reroutedSubs.length} subscriptions weaponized</div>
        </motion.div>

        {/* Annual Impact */}
        {(totalSaved + totalRerouted) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.15 }}
            className="lg:col-span-3 glass-card-dark p-5 lg:p-6"
          >
            <div className="flex items-center gap-3">
              <ArrowRight className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-white font-display font-bold text-lg">
                  {formatCurrency((totalSaved + totalRerouted) * 12)}/year
                </span>
                <span className="text-slate-400 text-sm font-body ml-2">
                  redirected from subscriptions to debt assassination
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Subscriptions */}
        <div className="lg:col-span-3">
          <div className="text-slate-400 text-xs font-body uppercase tracking-wider mb-3 px-1">
            Active Subscriptions ({activeSubs.length})
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <AnimatePresence>
              {activeSubs.map(sub => (
                <SubCard
                  key={sub.id}
                  sub={sub}
                  onCancel={() => handleCancel(sub.id)}
                  onReroute={() => handleReroute(sub.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Cancelled / Rerouted */}
        {(cancelledSubs.length > 0 || reroutedSubs.length > 0) && (
          <div className="lg:col-span-3">
            <div className="text-slate-400 text-xs font-body uppercase tracking-wider mb-3 px-1">
              Eliminated ({cancelledSubs.length + reroutedSubs.length})
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <AnimatePresence>
                {[...reroutedSubs, ...cancelledSubs].map(sub => (
                  <SubCard
                    key={sub.id}
                    sub={sub}
                    onCancel={() => {}}
                    onReroute={() => {}}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
