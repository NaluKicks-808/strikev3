/**
 * Project STRIKE — Notifications Center
 * Features:
 *   1. iOS Lock Screen mockup showing realistic push notifications
 *   2. Notification history feed with categorized alerts
 *   3. Live toast demo that simulates incoming notifications
 * Notification types: AI Recap, Strike Confirmed, Safety Net Alert, Debt Milestone, Round-Up
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  ShieldAlert,
  Trophy,
  ArrowUpRight,
  Bell,
  BellOff,
  Smartphone,
  Check,
  X,
  ChevronRight,
  Clock,
  Settings2,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

// ─── Notification Data Model ─────────────────────────────────────────────────

interface StrikeNotification {
  id: string;
  type: 'ai_recap' | 'strike_confirmed' | 'safety_alert' | 'milestone' | 'roundup';
  title: string;
  body: string;
  detail?: string;
  timestamp: Date;
  read: boolean;
}

const NOTIFICATION_META: Record<StrikeNotification['type'], {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accent: string;
  label: string;
}> = {
  ai_recap: {
    icon: Sparkles,
    iconBg: 'bg-violet-100/80',
    iconColor: 'text-violet-600',
    accent: 'border-l-violet-500',
    label: 'AI Recap',
  },
  strike_confirmed: {
    icon: Zap,
    iconBg: 'bg-emerald-100/80',
    iconColor: 'text-emerald-600',
    accent: 'border-l-emerald-500',
    label: 'Strike',
  },
  safety_alert: {
    icon: ShieldAlert,
    iconBg: 'bg-amber-100/80',
    iconColor: 'text-amber-600',
    accent: 'border-l-amber-500',
    label: 'Safety Net',
  },
  milestone: {
    icon: Trophy,
    iconBg: 'bg-sky-100/80',
    iconColor: 'text-sky-600',
    accent: 'border-l-sky-500',
    label: 'Milestone',
  },
  roundup: {
    icon: ArrowUpRight,
    iconBg: 'bg-blue-100/80',
    iconColor: 'text-blue-600',
    accent: 'border-l-blue-500',
    label: 'Round-Up',
  },
};

// ─── Mock Notification Data ──────────────────────────────────────────────────

function generateMockNotifications(): StrikeNotification[] {
  const now = new Date();
  const h = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600000);
  return [
    {
      id: 'n1',
      type: 'ai_recap',
      title: 'Good morning, Evan.',
      body: 'Your Primary Residence accrued $67.68 in interest yesterday. But we executed a $142 surplus strike overnight. You\'re winning.',
      detail: 'Total interest eliminated to date: $4,280',
      timestamp: h(2),
      read: false,
    },
    {
      id: 'n2',
      type: 'strike_confirmed',
      title: 'Strike Confirmed — $142.00',
      body: 'Principal-only payment executed on Primary Residence via American Savings Bank. New balance: $394,068.',
      detail: 'Interest saved: ~$312 over loan lifetime',
      timestamp: h(3),
      read: false,
    },
    {
      id: 'n3',
      type: 'roundup',
      title: 'Round-Up Captured — $3.47',
      body: 'Costco purchase of $46.53 rounded up. $3.47 added to your Strike Buffer.',
      detail: 'Buffer total: $18.92',
      timestamp: h(5),
      read: true,
    },
    {
      id: 'n4',
      type: 'safety_alert',
      title: 'Safety Net Activated',
      body: 'Your checking balance dropped to $1,840 — below your $2,000 Safety Net. All strikes paused until balance recovers.',
      detail: 'Deficit: $160 below threshold',
      timestamp: h(18),
      read: true,
    },
    {
      id: 'n5',
      type: 'milestone',
      title: '🎯 Vehicle Loan — 50% Eliminated!',
      body: 'Your auto loan balance just crossed below $9,220. You\'ve destroyed half the principal. At this pace, payoff is 14 months ahead of schedule.',
      detail: 'Original balance: $18,440 → Current: $9,218',
      timestamp: h(26),
      read: true,
    },
    {
      id: 'n6',
      type: 'ai_recap',
      title: 'Weekly Intelligence Brief',
      body: 'This week: 3 strikes executed totaling $287. Interest killed: $631 over loan lifetimes. Your debt-free date moved forward by 12 days.',
      detail: 'Projected debt-free: March 2049 (was March 2054)',
      timestamp: h(48),
      read: true,
    },
    {
      id: 'n7',
      type: 'strike_confirmed',
      title: 'Strike Confirmed — $95.00',
      body: 'Surplus detected after paycheck deposit. $95 principal-only payment sent to Federal Student Loan via MOHELA.',
      detail: 'Interest saved: ~$87 over loan lifetime',
      timestamp: h(52),
      read: true,
    },
    {
      id: 'n8',
      type: 'milestone',
      title: '⚡ 10 Strikes Executed!',
      body: 'You\'ve completed 10 automated strikes since joining STRIKE. Total principal destroyed: $1,847. Keep the momentum.',
      timestamp: h(72),
      read: true,
    },
  ];
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ─── iOS Lock Screen Mockup ──────────────────────────────────────────────────

function IOSLockScreen({ notifications }: { notifications: StrikeNotification[] }) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Show the 3 most recent unread/recent notifications on the lock screen
  const lockScreenNotifs = notifications.slice(0, 3);

  return (
    <div className="relative mx-auto w-full max-w-[375px]">
      {/* Phone Frame */}
      <div className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-200/60">
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-full z-20" />

        {/* Screen */}
        <div
          className="relative pt-16 pb-8 px-6 min-h-[680px]"
          style={{
            background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 40%, #334155 100%)',
          }}
        >
          {/* Status Bar */}
          <div className="absolute top-4 left-8 right-8 flex items-center justify-between text-white/60 text-xs font-medium">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><rect x="0" y="3" width="3" height="9" rx="0.5" opacity="0.3"/><rect x="4.5" y="2" width="3" height="10" rx="0.5" opacity="0.5"/><rect x="9" y="1" width="3" height="11" rx="0.5" opacity="0.7"/><rect x="13.5" y="0" width="3" height="12" rx="0.5"/></svg>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.5C5.5 2.5 3.3 3.5 1.8 5.2L0 3.4C2 1.3 4.8 0 8 0s6 1.3 8 3.4l-1.8 1.8C12.7 3.5 10.5 2.5 8 2.5z" opacity="0.3"/><path d="M8 5.5C6.3 5.5 4.8 6.2 3.7 7.3L1.9 5.5C3.5 3.9 5.6 3 8 3s4.5.9 6.1 2.5l-1.8 1.8C11.2 6.2 9.7 5.5 8 5.5z" opacity="0.6"/><path d="M8 8.5c-1 0-1.9.4-2.6 1.1L8 12l2.6-2.4C9.9 8.9 9 8.5 8 8.5z"/></svg>
              <div className="flex items-center">
                <div className="w-6 h-3 border border-white/40 rounded-sm relative">
                  <div className="absolute inset-[1.5px] right-[3px] bg-emerald-400 rounded-[1px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Clock & Date */}
          <div className="text-center mt-8 mb-10">
            <div className="text-white text-7xl font-thin tracking-tight leading-none" style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif' }}>
              {timeStr.replace(/\s?(AM|PM)/, '')}
            </div>
            <div className="text-white/50 text-lg font-light mt-2" style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}>
              {dateStr}
            </div>
          </div>

          {/* Notification Stack */}
          <div className="space-y-2.5">
            {lockScreenNotifs.map((notif, i) => {
              const meta = NOTIFICATION_META[notif.type];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 28,
                    delay: 0.3 + i * 0.15,
                  }}
                  className="rounded-[1.25rem] p-3.5 backdrop-blur-2xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* App Icon */}
                    <div className="w-9 h-9 bg-slate-900 rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-white/90 text-[13px] font-semibold" style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}>
                          STRIKE
                        </span>
                        <span className="text-white/40 text-[11px]" style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}>
                          {timeAgo(notif.timestamp)}
                        </span>
                      </div>
                      <div className="text-white/80 text-[13px] font-medium leading-tight mb-0.5" style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}>
                        {notif.title}
                      </div>
                      <div className="text-white/50 text-[12px] leading-snug line-clamp-2" style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}>
                        {notif.body}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1.5 bg-white/20 rounded-full" />
        </div>
      </div>

      {/* Reflection / Glow */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-slate-900/10 blur-2xl rounded-full" />
    </div>
  );
}

// ─── Notification Feed Item ──────────────────────────────────────────────────

function NotificationItem({
  notif,
  onMarkRead,
  index,
}: {
  notif: StrikeNotification;
  onMarkRead: (id: string) => void;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = NOTIFICATION_META[notif.type];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.04 }}
      onClick={() => setExpanded(!expanded)}
      className={cn(
        'glass-card p-4 lg:p-5 border-l-[3px] cursor-pointer transition-all duration-300',
        meta.accent,
        !notif.read && 'ring-1 ring-inset ring-slate-200/40',
      )}
    >
      <div className="flex items-start gap-3.5">
        {/* Icon */}
        <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm', meta.iconBg)}>
          <Icon className={cn('w-[18px] h-[18px]', meta.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn(
              'text-[10px] font-bold uppercase tracking-widest font-body',
              meta.iconColor,
            )}>
              {meta.label}
            </span>
            {!notif.read && (
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            )}
            <span className="ml-auto text-slate-400 text-[11px] font-body flex-shrink-0">
              {timeAgo(notif.timestamp)}
            </span>
          </div>
          <div className="font-display font-bold text-slate-900 text-sm leading-snug mb-1">
            {notif.title}
          </div>
          <div className="text-slate-500 text-[13px] font-body leading-relaxed">
            {notif.body}
          </div>

          {/* Expandable Detail */}
          <AnimatePresence>
            {expanded && notif.detail && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-slate-100/60">
                  <div className="text-slate-600 text-xs font-body font-medium">
                    {notif.detail}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Read / Expand indicator */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0 pt-1">
          {!notif.read && (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkRead(notif.id); }}
              className="w-7 h-7 rounded-lg bg-emerald-50/80 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors"
              title="Mark as read"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronRight className={cn(
            'w-4 h-4 text-slate-300 transition-transform duration-200',
            expanded && 'rotate-90'
          )} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Live Toast Notification ─────────────────────────────────────────────────

function LiveToast({ notification, onDismiss }: { notification: StrikeNotification | null; onDismiss: () => void }) {
  if (!notification) return null;
  const meta = NOTIFICATION_META[notification.type];
  const Icon = meta.icon;

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md"
        >
          <div
            className="rounded-2xl p-4 shadow-2xl shadow-slate-900/15 border border-white/20"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-900/20">
                <Zap className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-slate-900 text-xs font-bold font-body uppercase tracking-wider">STRIKE</span>
                  <span className="text-slate-400 text-[11px] font-body">now</span>
                </div>
                <div className="text-slate-800 text-[13px] font-semibold leading-tight mb-0.5" style={{ fontFamily: '-apple-system, SF Pro Text, Inter, sans-serif' }}>
                  {notification.title}
                </div>
                <div className="text-slate-500 text-[12px] leading-snug line-clamp-2" style={{ fontFamily: '-apple-system, SF Pro Text, Inter, sans-serif' }}>
                  {notification.body}
                </div>
              </div>
              <button
                onClick={onDismiss}
                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors flex-shrink-0 mt-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Notification Preferences Card ───────────────────────────────────────────

function NotificationPreferences() {
  const [prefs, setPrefs] = useState({
    aiRecap: true,
    strikeConfirm: true,
    safetyAlerts: true,
    milestones: true,
    roundups: false,
    weeklyBrief: true,
  });

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const items = [
    { key: 'aiRecap' as const, label: 'AI Morning Recap', desc: 'Daily insight at 7:00 AM', icon: Sparkles, color: 'text-violet-600' },
    { key: 'strikeConfirm' as const, label: 'Strike Confirmations', desc: 'After each automated payment', icon: Zap, color: 'text-emerald-600' },
    { key: 'safetyAlerts' as const, label: 'Safety Net Alerts', desc: 'When balance drops below threshold', icon: ShieldAlert, color: 'text-amber-600' },
    { key: 'milestones' as const, label: 'Debt Milestones', desc: '25%, 50%, 75% payoff markers', icon: Trophy, color: 'text-sky-600' },
    { key: 'roundups' as const, label: 'Round-Up Captures', desc: 'Each round-up transaction', icon: ArrowUpRight, color: 'text-blue-600' },
    { key: 'weeklyBrief' as const, label: 'Weekly Intelligence Brief', desc: 'Summary every Sunday at 9:00 AM', icon: Clock, color: 'text-slate-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.2 }}
      className="glass-card p-5 lg:p-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <Settings2 className="w-4 h-4 text-slate-400" />
        <span className="font-display font-bold text-slate-900 text-base">Notification Preferences</span>
      </div>
      <p className="text-slate-400 text-xs font-body mb-5">
        Choose which push notifications STRIKE sends to your device.
      </p>
      <div className="space-y-1">
        {items.map(({ key, label, desc, icon: Icon, color }) => (
          <div
            key={key}
            className="flex items-center gap-3.5 py-3 border-b border-slate-100/50 last:border-0"
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', 
              prefs[key] ? 'bg-slate-100/80' : 'bg-slate-50/40'
            )}>
              <Icon className={cn('w-4 h-4', prefs[key] ? color : 'text-slate-300')} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn('text-sm font-medium font-body', prefs[key] ? 'text-slate-700' : 'text-slate-400')}>
                {label}
              </div>
              <div className="text-slate-400 text-xs font-body">{desc}</div>
            </div>
            {/* Toggle */}
            <button
              onClick={() => togglePref(key)}
              className={cn(
                'relative w-11 h-[26px] rounded-full transition-all duration-300 flex-shrink-0',
                prefs[key] ? 'bg-emerald-500' : 'bg-slate-200'
              )}
            >
              <motion.div
                animate={{ x: prefs[key] ? 18 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-[3px] w-5 h-5 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Notifications Page ─────────────────────────────────────────────────

export default function Notifications() {
  const { debts, bankAccount } = useApp();
  const [notifications, setNotifications] = useState<StrikeNotification[]>(generateMockNotifications);
  const [filter, setFilter] = useState<'all' | StrikeNotification['type']>('all');
  const [liveToast, setLiveToast] = useState<StrikeNotification | null>(null);
  const [toastFired, setToastFired] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Fire a live toast after 3 seconds on first visit
  useEffect(() => {
    if (toastFired) return;
    const timer = setTimeout(() => {
      const liveNotif: StrikeNotification = {
        id: 'live-1',
        type: 'strike_confirmed',
        title: 'Strike Confirmed — $47.00',
        body: 'Surplus detected. $47 principal-only payment sent to Vehicle Loan via Bank of Hawaii.',
        detail: 'Interest saved: ~$38 over loan lifetime',
        timestamp: new Date(),
        read: false,
      };
      setLiveToast(liveNotif);
      setNotifications(prev => [liveNotif, ...prev]);
      setToastFired(true);

      // Auto-dismiss after 5s
      setTimeout(() => setLiveToast(null), 5000);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toastFired]);

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const filterOptions: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'ai_recap', label: 'AI Recap' },
    { key: 'strike_confirmed', label: 'Strikes' },
    { key: 'safety_alert', label: 'Alerts' },
    { key: 'milestone', label: 'Milestones' },
    { key: 'roundup', label: 'Round-Ups' },
  ];

  return (
    <AppShell
      title="Notifications"
      subtitle={`${unreadCount} unread`}
      headerRight={
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-semibold font-body text-emerald-600 hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50/60"
            >
              Mark all read
            </button>
          )}
        </div>
      }
    >
      <LiveToast notification={liveToast} onDismiss={() => setLiveToast(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">

        {/* ── Left Column: iOS Lock Screen Mockup ── */}
        <div className="lg:col-span-5 xl:col-span-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <span className="font-display font-bold text-slate-900 text-base">Lock Screen Preview</span>
            </div>
            <p className="text-slate-400 text-xs font-body mb-6">
              This is how STRIKE notifications appear on your iPhone lock screen.
            </p>
            <IOSLockScreen notifications={notifications} />
          </motion.div>
        </div>

        {/* ── Right Column: Notification Feed + Preferences ── */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">

          {/* Filter Chips */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.1 }}
            className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
          >
            {filterOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-semibold font-body whitespace-nowrap transition-all duration-200',
                  filter === key
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'bg-slate-100/60 text-slate-500 hover:bg-slate-200/60 hover:text-slate-700'
                )}
              >
                {label}
              </button>
            ))}
          </motion.div>

          {/* Notification Feed */}
          <div className="space-y-3">
            {filtered.map((notif, i) => (
              <NotificationItem
                key={notif.id}
                notif={notif}
                onMarkRead={markRead}
                index={i}
              />
            ))}
            {filtered.length === 0 && (
              <div className="glass-card p-12 text-center">
                <BellOff className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <div className="text-slate-400 text-sm font-body">No notifications in this category.</div>
              </div>
            )}
          </div>

          {/* Notification Preferences */}
          <NotificationPreferences />
        </div>
      </div>
    </AppShell>
  );
}
