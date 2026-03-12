/**
 * Project STRIKE — Multiplayer / Couples Mode
 * Invite a partner to the War Room to manage household debt together.
 * Shared progress, contribution tracking, and joint strategy.
 * Glassmorphism + spring animations + desktop bento grid
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Heart,
  Trophy,
  Zap,
  Shield,
  Crown,
  Send,
  CheckCircle2,
  Copy,
  ArrowRight,
  Target,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

// ─── Mock Partner Data ────────────────────────────────────────────────────────

interface Partner {
  name: string;
  avatar: string;
  role: 'Commander' | 'Co-Pilot';
  strikesExecuted: number;
  totalContributed: number;
  joinedDate: string;
}

const MOCK_PARTNER: Partner = {
  name: 'Sarah K.',
  avatar: 'SK',
  role: 'Co-Pilot',
  strikesExecuted: 12,
  totalContributed: 3_420,
  joinedDate: '2026-01-15',
};

// ─── Invite Flow ──────────────────────────────────────────────────────────────

function InviteFlow({ onInviteSent }: { onInviteSent: () => void }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const inviteCode = 'STRIKE-HI-2026';

  const handleSend = () => {
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast.success(`Invite sent to ${email}`);
      setTimeout(() => onInviteSent(), 1500);
    }, 1200);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast.success('Invite code copied!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="lg:col-span-3 glass-card p-6 lg:p-8"
    >
      <div className="max-w-lg mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-20 h-20 bg-emerald-50/80 rounded-3xl flex items-center justify-center mx-auto mb-6"
        >
          <Users className="w-10 h-10 text-emerald-500" />
        </motion.div>

        <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Invite Your Partner
        </h2>
        <p className="text-slate-500 text-sm font-body mb-8 leading-relaxed">
          Manage household debt together. Your partner gets their own view of the War Room
          with shared targets, contribution tracking, and joint strategy control.
        </p>

        {sent ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-6"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
            <div className="font-display font-bold text-slate-900 text-lg">Invite Sent!</div>
            <div className="text-slate-400 text-sm font-body">Waiting for {email} to accept...</div>
          </motion.div>
        ) : (
          <>
            {/* Email Invite */}
            <div className="flex gap-2 mb-5">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="partner@email.com"
                className="flex-1 px-4 py-3 bg-slate-50/60 border border-slate-200/50 rounded-2xl text-sm font-body text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 backdrop-blur-sm"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={sending}
                className="strike-btn-primary px-5 py-3 flex items-center gap-2"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Send className="w-4 h-4" /> Invite</>
                )}
              </motion.button>
            </div>

            {/* Or use code */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-slate-200/50" />
              <span className="text-slate-400 text-xs font-body uppercase tracking-wider">or share code</span>
              <div className="flex-1 h-px bg-slate-200/50" />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCopyCode}
              className="w-full flex items-center justify-between px-5 py-4 bg-slate-50/60 border border-slate-200/50 rounded-2xl backdrop-blur-sm hover:bg-slate-100/60 transition-colors"
            >
              <div className="text-left">
                <div className="font-display font-bold text-slate-900 text-lg tracking-wider">{inviteCode}</div>
                <div className="text-slate-400 text-xs font-body">Tap to copy invite code</div>
              </div>
              <Copy className="w-5 h-5 text-slate-400" />
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Partner Connected View ───────────────────────────────────────────────────

function PartnerView({ partner }: { partner: Partner }) {
  const { totalDebt, debts, activity } = useApp();

  const userStrikes = activity.filter(a => a.type === 'strike' || a.type === 'surplus');
  const userTotal = userStrikes.reduce((s, a) => s + a.amount, 0);
  const householdTotal = userTotal + partner.totalContributed;

  return (
    <>
      {/* Household Summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="lg:col-span-3 glass-card-dark p-6 lg:p-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 text-xs font-bold font-body uppercase tracking-widest">Household War Room</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <div className="text-slate-400 text-xs font-body uppercase tracking-wider mb-1">Household Debt</div>
            <div className="font-display text-4xl lg:text-5xl font-extrabold text-white tabular-nums tracking-tight">
              {formatCurrency(totalDebt())}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs font-body uppercase tracking-wider mb-1">Total Struck Together</div>
            <div className="font-display text-4xl lg:text-5xl font-extrabold text-emerald-400 tabular-nums tracking-tight">
              {formatCurrency(householdTotal)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs font-body uppercase tracking-wider mb-1">Active Targets</div>
            <div className="font-display text-4xl lg:text-5xl font-extrabold text-white tabular-nums tracking-tight">
              {debts.filter(d => !d.isPaidOff).length}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Player Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.05 }}
        className="glass-card p-5 lg:p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-display font-bold text-lg">
            EK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-slate-900">Evan K.</span>
              <Crown className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="text-xs font-body text-emerald-600 font-semibold">Commander</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50/60 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-body mb-1">Strikes</div>
            <div className="font-display font-bold text-slate-900 tabular-nums">{userStrikes.length}</div>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-body mb-1">Contributed</div>
            <div className="font-display font-bold text-emerald-600 tabular-nums">{formatCurrency(userTotal)}</div>
          </div>
        </div>
        {/* Contribution bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-body mb-1">
            <span className="text-slate-400">Share of strikes</span>
            <span className="font-semibold text-slate-700 tabular-nums">
              {householdTotal > 0 ? Math.round((userTotal / householdTotal) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 bg-slate-100/60 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${householdTotal > 0 ? (userTotal / householdTotal) * 100 : 0}%` }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.1 }}
        className="glass-card p-5 lg:p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-display font-bold text-lg">
            {partner.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-slate-900">{partner.name}</span>
              <Shield className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <span className="text-xs font-body text-blue-600 font-semibold">{partner.role}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50/60 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-body mb-1">Strikes</div>
            <div className="font-display font-bold text-slate-900 tabular-nums">{partner.strikesExecuted}</div>
          </div>
          <div className="bg-blue-50/60 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-body mb-1">Contributed</div>
            <div className="font-display font-bold text-blue-600 tabular-nums">{formatCurrency(partner.totalContributed)}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-body mb-1">
            <span className="text-slate-400">Share of strikes</span>
            <span className="font-semibold text-slate-700 tabular-nums">
              {householdTotal > 0 ? Math.round((partner.totalContributed / householdTotal) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 bg-slate-100/60 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${householdTotal > 0 ? (partner.totalContributed / householdTotal) * 100 : 0}%` }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="h-full rounded-full bg-blue-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Permissions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.15 }}
        className="glass-card p-5 lg:p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-slate-400" />
          <span className="font-display font-bold text-slate-900 text-sm">Partner Permissions</span>
        </div>
        <div className="space-y-3">
          {[
            { label: 'View War Room Dashboard', enabled: true },
            { label: 'Execute Manual Strikes', enabled: true },
            { label: 'Modify Safety Net', enabled: false },
            { label: 'Change Strategy', enabled: true },
            { label: 'Pause All Strikes', enabled: false },
            { label: 'Cancel Subscriptions', enabled: false },
          ].map((perm, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <span className="text-slate-600 text-sm font-body">{perm.label}</span>
              <div className={cn(
                'w-10 h-5 rounded-full transition-all duration-300 relative',
                perm.enabled ? 'bg-emerald-500' : 'bg-slate-200'
              )}>
                <div className={cn(
                  'w-4 h-4 bg-white rounded-full shadow-sm absolute top-0.5 transition-all duration-200',
                  perm.enabled ? 'left-5' : 'left-0.5'
                )} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Household Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.2 }}
        className="lg:col-span-3 glass-card p-5 lg:p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="font-display font-bold text-slate-900 text-base">Household Milestones</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {[
            { label: 'First Joint Strike', achieved: true, icon: Zap, desc: 'Executed first strike together' },
            { label: '$5k Eliminated', achieved: true, icon: Target, desc: 'Household eliminated $5,000 in debt' },
            { label: '$10k Eliminated', achieved: false, icon: Target, desc: '$6,580 more to go' },
            { label: 'Debt-Free Household', achieved: false, icon: Trophy, desc: 'The ultimate goal' },
          ].map((milestone, i) => {
            const MIcon = milestone.icon;
            return (
              <div
                key={i}
                className={cn(
                  'rounded-xl p-4 backdrop-blur-sm border',
                  milestone.achieved
                    ? 'bg-emerald-50/60 border-emerald-100/50'
                    : 'bg-slate-50/60 border-slate-100/50'
                )}
              >
                <MIcon className={cn('w-5 h-5 mb-2', milestone.achieved ? 'text-emerald-500' : 'text-slate-300')} />
                <div className={cn(
                  'font-display font-bold text-sm mb-0.5',
                  milestone.achieved ? 'text-emerald-700' : 'text-slate-400'
                )}>
                  {milestone.label}
                </div>
                <div className="text-slate-400 text-xs font-body">{milestone.desc}</div>
                {milestone.achieved && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Multiplayer() {
  const [hasPartner, setHasPartner] = useState(false);

  return (
    <AppShell
      title="Multiplayer"
      subtitle={hasPartner ? 'Household debt management with Sarah K.' : 'Invite a partner to manage debt together'}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        {hasPartner ? (
          <PartnerView partner={MOCK_PARTNER} />
        ) : (
          <InviteFlow onInviteSent={() => setTimeout(() => setHasPartner(true), 2000)} />
        )}
      </div>
    </AppShell>
  );
}
