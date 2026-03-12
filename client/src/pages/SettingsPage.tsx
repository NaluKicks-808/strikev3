/**
 * Project STRIKE — Settings Page
 * Philosophy: "Trusted Fintech Editorial"
 * Features: Safety Net slider, Round-Ups toggle, Strategy toggle, Panic Button
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldOff,
  Zap,
  RefreshCw,
  TrendingDown,
  User,
  Bell,
  Lock,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useApp, type Strategy } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function SettingsPage() {
  const { settings, updateSettings, bankAccount, updateBankBalance } = useApp();
  const [bankBalanceInput, setBankBalanceInput] = useState(String(bankAccount.balance));

  return (
    <AppShell
      title="Settings"
      subtitle="Manage your STRIKE configuration"
    >
      {/* ── Panic Button ── */}
      <div className={cn(
        'rounded-2xl p-5 mb-5 border-2 transition-all',
        settings.isPaused
          ? 'bg-amber-50 border-amber-300'
          : 'bg-slate-50 border-slate-100'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              settings.isPaused ? 'bg-amber-100' : 'bg-slate-200'
            )}>
              {settings.isPaused
                ? <ShieldOff className="w-5 h-5 text-amber-600" />
                : <ShieldCheck className="w-5 h-5 text-slate-600" />
              }
            </div>
            <div>
              <div className={cn(
                'font-display font-bold text-sm',
                settings.isPaused ? 'text-amber-800' : 'text-slate-900'
              )}>
                {settings.isPaused ? 'All Strikes PAUSED' : 'Strikes Active'}
              </div>
              <div className={cn(
                'text-xs font-body',
                settings.isPaused ? 'text-amber-600' : 'text-slate-400'
              )}>
                {settings.isPaused ? 'Tap to resume automation' : 'Tap to pause all automation'}
              </div>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ isPaused: !settings.isPaused })}
            className={cn(
              'w-14 h-7 rounded-full transition-all duration-300 relative',
              settings.isPaused ? 'bg-amber-400' : 'bg-emerald-500'
            )}
          >
            <div className={cn(
              'w-6 h-6 bg-white rounded-full shadow-sm absolute top-0.5 transition-all duration-300',
              settings.isPaused ? 'left-0.5' : 'left-7'
            )} />
          </button>
        </div>
        {settings.isPaused && (
          <div className="mt-3 flex items-center gap-2 text-amber-700 text-xs font-body">
            <AlertTriangle className="w-3.5 h-3.5" />
            Caution Mode: No automated transfers will execute
          </div>
        )}
      </div>

      {/* ── Safety Net ── */}
      <div className="strike-card p-5 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span className="font-display font-bold text-slate-900">Safety Net</span>
        </div>
        <p className="text-slate-400 text-xs font-body mb-5 leading-relaxed">
          STRIKE will never execute a Strike if your bank balance would fall below this threshold.
          Your bills are always protected.
        </p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 text-xs font-body uppercase tracking-wider">Minimum Buffer</span>
          <span className="font-display font-bold text-slate-900 text-xl tabular-nums">
            {formatCurrency(settings.safetyNet)}
          </span>
        </div>
        <input
          type="range"
          min={500}
          max={10000}
          step={500}
          value={settings.safetyNet}
          onChange={e => updateSettings({ safetyNet: Number(e.target.value) })}
          className="w-full accent-emerald-500"
        />
        <div className="flex justify-between text-xs text-slate-300 font-body mt-1">
          <span>$500</span>
          <span>$10,000</span>
        </div>
      </div>

      {/* ── Strategy ── */}
      <div className="strike-card p-5 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown className="w-4 h-4 text-slate-400" />
          <span className="font-display font-bold text-slate-900">Strike Strategy</span>
        </div>
        <p className="text-slate-400 text-xs font-body mb-5 leading-relaxed">
          Determines which debt receives priority when a surplus is detected.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(['Avalanche', 'Snowball'] as Strategy[]).map(s => (
            <button
              key={s}
              onClick={() => updateSettings({ strategy: s })}
              className={cn(
                'p-4 rounded-2xl border-2 text-left transition-all',
                settings.strategy === s
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              )}
            >
              <div className={cn(
                'font-display font-bold text-sm mb-1',
                settings.strategy === s ? 'text-emerald-700' : 'text-slate-800'
              )}>
                {s}
              </div>
              <div className="text-slate-400 text-xs font-body">
                {s === 'Avalanche' ? 'Highest rate first. Saves most money.' : 'Lowest balance first. Fastest wins.'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Round-Ups ── */}
      <div className="strike-card p-5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="font-display font-bold text-slate-900 text-sm">Smart Round-Ups</div>
              <div className="text-slate-400 text-xs font-body">Round purchases up to the nearest dollar</div>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ roundUpsEnabled: !settings.roundUpsEnabled })}
            className={cn(
              'w-12 h-6 rounded-full transition-all duration-200 relative',
              settings.roundUpsEnabled ? 'bg-emerald-500' : 'bg-slate-200'
            )}
          >
            <div className={cn(
              'w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-all duration-200',
              settings.roundUpsEnabled ? 'left-6' : 'left-0.5'
            )} />
          </button>
        </div>
        {settings.roundUpsEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3 bg-blue-50 rounded-xl"
          >
            <p className="text-blue-600 text-xs font-body">
              Every purchase will be rounded up and the difference applied as a micro-Strike.
              Small amounts, massive long-term impact.
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Bank Balance (Dev Tool) ── */}
      <div className="strike-card p-5 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-slate-400" />
          <span className="font-display font-bold text-slate-900 text-sm">Simulate Bank Balance</span>
          <span className="text-slate-300 text-xs font-body">[Dev Tool]</span>
        </div>
        <p className="text-slate-400 text-xs font-body mb-4">
          Adjust the checking account balance to test Safety Net and surplus detection.
        </p>
        <div className="flex gap-3">
          <input
            type="number"
            value={bankBalanceInput}
            onChange={e => setBankBalanceInput(e.target.value)}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-body focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
          />
          <button
            onClick={() => updateBankBalance(Number(bankBalanceInput))}
            className="strike-btn-primary px-4 py-2.5 text-sm"
          >
            Set
          </button>
        </div>
      </div>

      {/* ── Account Links ── */}
      <div className="strike-card overflow-hidden mb-4">
        {[
          { icon: User, label: 'Account Details', sub: 'evan@strike.app' },
          { icon: Bell, label: 'Notifications', sub: 'Strike alerts enabled' },
          { icon: Lock, label: 'Security & Privacy', sub: 'Zero-Trust Architecture' },
        ].map(({ icon: Icon, label, sub }, i) => (
          <button
            key={label}
            className={cn(
              'w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left',
              i > 0 && 'border-t border-slate-50'
            )}
            onClick={() => {}}
          >
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-800 text-sm font-body">{label}</div>
              <div className="text-slate-400 text-xs font-body">{sub}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        ))}
      </div>

      {/* ── Version ── */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-5 h-5 bg-slate-900 rounded-md flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-emerald-400" />
          </div>
          <span className="font-display font-bold text-slate-400 text-sm">STRIKE</span>
        </div>
        <p className="text-slate-300 text-xs font-body">v1.0.0 MVP · Built by Evan Nalu Foster · BYUH EYD 2026</p>
      </div>
    </AppShell>
  );
}
