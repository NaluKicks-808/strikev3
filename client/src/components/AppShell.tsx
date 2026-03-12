/**
 * Project STRIKE — AppShell v2.1
 * Desktop: Sidebar (260px) + Main content area with bento grid
 * Mobile: Bottom nav bar with glassmorphism
 * v2.1: Added notification bell with badge in sidebar + mobile nav
 */

import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  Zap,
  Settings,
  CreditCard,
  Users,
  Bell,
  ShieldCheck,
  ShieldOff,
  Wallet,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'War Room' },
  { href: '/spending', icon: Wallet, label: 'Spending' },
  { href: '/targets', icon: Target, label: 'Debt Map' },
  { href: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { href: '/multiplayer', icon: Users, label: 'Multiplayer' },
  { href: '/notifications', icon: Bell, label: 'Notifications', badge: 3 },
];

const NAV_BOTTOM = [
  { href: '/sync', icon: Zap, label: 'Strike' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

const MOBILE_NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'War Room' },
  { href: '/spending', icon: Wallet, label: 'Spend' },
  { href: '/sync', icon: Zap, label: 'Strike', isCenter: true },
  { href: '/targets', icon: Target, label: 'Targets' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

function Sidebar() {
  const [location] = useLocation();
  const { settings, updateSettings } = useApp();

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div className="px-6 pt-7 pb-6">
        <Link href="/dashboard">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
              <Zap className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <span className="font-display text-lg font-extrabold text-slate-900 tracking-tight">STRIKE</span>
              <div className="flex items-center gap-1.5 -mt-0.5">
                <div className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  settings.isPaused ? 'bg-amber-500' : 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                )} />
                <span className={cn(
                  'text-[10px] font-semibold font-body uppercase tracking-wider',
                  settings.isPaused ? 'text-amber-600' : 'text-emerald-600'
                )}>
                  {settings.isPaused ? 'Paused' : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        <div className="px-3 pb-2 pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-body">Command Center</span>
        </div>
        {NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-emerald-50/80 text-emerald-700'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                )}
              >
                <div className="relative">
                  <Icon className={cn('w-[18px] h-[18px]', isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600')} />
                  {badge && badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm shadow-red-500/30">
                      {badge}
                    </span>
                  )}
                </div>
                <span className={cn('text-[13px] font-medium font-body', isActive && 'font-semibold')}>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}

        <div className="px-3 pb-2 pt-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-body">Actions</span>
        </div>
        {NAV_BOTTOM.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-emerald-50/80 text-emerald-700'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                )}
              >
                <Icon className={cn('w-[18px] h-[18px]', isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600')} />
                <span className={cn('text-[13px] font-medium font-body', isActive && 'font-semibold')}>{label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Panic Button */}
      <div className="px-4 pb-6 pt-4">
        <button
          onClick={() => updateSettings({ isPaused: !settings.isPaused })}
          className={cn(
            'w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold font-body transition-all duration-300',
            settings.isPaused
              ? 'bg-amber-100/80 text-amber-700 border border-amber-200/60'
              : 'bg-slate-100/80 text-slate-600 border border-slate-200/40 hover:bg-slate-200/60'
          )}
        >
          {settings.isPaused ? (
            <><ShieldOff className="w-4 h-4" /> Strikes Paused</>
          ) : (
            <><ShieldCheck className="w-4 h-4" /> All Systems Active</>
          )}
        </button>
      </div>
    </aside>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────

function MobileNav() {
  const [location] = useLocation();
  const { settings } = useApp();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_NAV.map(({ href, icon: Icon, label, isCenter, badge }: any) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href}>
              <div className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200',
                isActive && !isCenter && 'text-emerald-600',
                !isActive && !isCenter && 'text-slate-400',
                isCenter && 'relative'
              )}>
                {isCenter ? (
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg transition-all duration-300',
                      settings.isPaused
                        ? 'bg-amber-500 shadow-amber-200/50'
                        : 'bg-emerald-500 shadow-emerald-200/50',
                      '-mt-6'
                    )}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </motion.div>
                ) : (
                  <div className="relative">
                    <Icon className={cn('w-5 h-5', isActive ? 'stroke-[2.5]' : 'stroke-[1.5]')} />
                    {badge && badge > 0 && (
                      <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-sm shadow-red-500/30">
                        {badge}
                      </span>
                    )}
                  </div>
                )}
                <span className={cn(
                  'text-[10px] font-medium',
                  isCenter && 'mt-1',
                  isActive && !isCenter && 'text-emerald-600 font-semibold',
                  !isActive && !isCenter && 'text-slate-400',
                  isCenter && 'text-slate-500'
                )}>
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Main AppShell ────────────────────────────────────────────────────────────

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  headerRight?: React.ReactNode;
  noPadding?: boolean;
}

export function AppShell({
  children,
  title,
  subtitle,
  showBack,
  headerRight,
  noPadding = false,
}: AppShellProps) {
  const [, navigate] = useLocation();
  const { settings } = useApp();

  return (
    <div className="app-layout noise-bg">
      <Sidebar />

      <div className="app-main">
        {/* App Header */}
        {(title || showBack || headerRight) && (
          <header className={cn(
            'sticky top-0 z-30',
            'bg-background/80 backdrop-blur-xl border-b',
            settings.isPaused ? 'border-amber-200/50' : 'border-slate-100/50'
          )}>
            <div className="flex items-center justify-between px-6 lg:px-8 py-4">
              <div className="flex items-center gap-3">
                {showBack && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/dashboard')}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.button>
                )}
                <div>
                  {title && (
                    <h1 className="font-display text-xl lg:text-2xl font-extrabold text-slate-900 leading-tight tracking-tight">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-xs text-slate-500 font-body mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>
              {headerRight && (
                <div className="flex items-center gap-2">
                  {headerRight}
                </div>
              )}
            </div>
            {settings.isPaused && (
              <div className="px-6 lg:px-8 pb-3">
                <div className="flex items-center gap-2 text-amber-700 text-xs font-medium font-body">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  All Strikes Paused — Caution Mode Active
                </div>
              </div>
            )}
          </header>
        )}

        {/* Main Content */}
        <main className={cn(
          'pb-24 lg:pb-8',
          !noPadding && 'px-5 lg:px-8 pt-5 lg:pt-6'
        )}>
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

// Re-export for backward compat
export { MobileNav as BottomNav };
