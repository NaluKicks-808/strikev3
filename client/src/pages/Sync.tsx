/**
 * Project STRIKE — Sync Session MFA Modal (app-sync)
 * Philosophy: "Trusted Fintech Editorial" — Security-first, user is always the final gatekeeper
 * Features: 6-digit MFA input, security messaging, authorize/cancel, RPA execution animation
 */

import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Eye,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type SyncState = 'prompt' | 'entering' | 'verifying' | 'executing' | 'success' | 'error';

// ─── RPA Execution Log ────────────────────────────────────────────────────────

const RPA_STEPS = [
  { delay: 0, text: 'Establishing secure tunnel to American Savings Bank…' },
  { delay: 600, text: 'Authenticating session with HSM credentials…' },
  { delay: 1200, text: 'Navigating to payment portal…' },
  { delay: 1800, text: 'Locating "Principal Only Payment" field…' },
  { delay: 2400, text: 'Bypassing standard amortization flow…' },
  { delay: 3000, text: 'Injecting principal-only payment: $247.00…' },
  { delay: 3600, text: 'Confirming transaction receipt…' },
  { delay: 4000, text: 'Strike executed. Principal reduced.' },
];

// ─── MFA Input ────────────────────────────────────────────────────────────────

function MFAInput({ onComplete }: { onComplete: (code: string) => void }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }

    if (newDigits.every(d => d !== '')) {
      onComplete(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      refs.current[5]?.focus();
      onComplete(pasted);
    }
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <motion.input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className={cn(
            'w-12 h-14 text-center text-xl font-display font-bold rounded-2xl border-2 transition-all focus:outline-none',
            digit
              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-white text-slate-900 focus:border-emerald-400 focus:bg-emerald-50/50'
          )}
        />
      ))}
    </div>
  );
}

// ─── RPA Log Display ──────────────────────────────────────────────────────────

function RPALog() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);

  useEffect(() => {
    RPA_STEPS.forEach(({ delay }, i) => {
      setTimeout(() => setVisibleSteps(prev => [...prev, i]), delay);
    });
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-5 font-mono text-xs space-y-2 min-h-[200px]">
      <div className="text-slate-500 mb-3">// STRIKE RPA Service Bridge — Live Log</div>
      <AnimatePresence>
        {RPA_STEPS.map((step, i) => (
          visibleSteps.includes(i) && (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'flex items-start gap-2',
                i === RPA_STEPS.length - 1 ? 'text-emerald-400' : 'text-slate-400'
              )}
            >
              <span className="text-slate-600 flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{step.text}</span>
              {i === visibleSteps.length - 1 && i < RPA_STEPS.length - 1 && (
                <span className="animate-pulse">▋</span>
              )}
            </motion.div>
          )
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Sync Page ───────────────────────────────────────────────────────────

export default function Sync() {
  const [, navigate] = useLocation();
  const { sortedDebts, surplus, executeStrike, addActivity } = useApp();
  const [syncState, setSyncState] = useState<SyncState>('prompt');
  const [enteredCode, setEnteredCode] = useState('');

  const topDebt = sortedDebts()[0];
  const strikeAmount = Math.min(surplus(), 247); // demo amount

  const handleCodeComplete = (code: string) => {
    setEnteredCode(code);
    setSyncState('verifying');
    setTimeout(() => {
      // Demo: any 6-digit code works
      if (code.length === 6) {
        setSyncState('executing');
        setTimeout(() => {
          if (topDebt) {
            executeStrike(topDebt.id, strikeAmount);
          }
          setSyncState('success');
        }, 4800);
      } else {
        setSyncState('error');
      }
    }, 1200);
  };

  const handleCancel = () => navigate('/dashboard');
  const handleDone = () => navigate('/dashboard');

  return (
    <div className="mobile-app-shell bg-slate-50">
      {/* Back button */}
      {syncState === 'prompt' && (
        <div className="px-5 pt-12 pb-4">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-slate-500 text-sm font-body hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      )}

      <div className="px-6 pt-4 pb-10">
        <AnimatePresence mode="wait">

          {/* ── Prompt State ── */}
          {syncState === 'prompt' && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-extrabold text-slate-900">Sync Session</h1>
                  <p className="text-slate-400 text-sm font-body">Secure Strike Authorization</p>
                </div>
              </div>

              {/* Strike Summary Card */}
              <div className="bg-slate-900 rounded-2xl p-5 mb-6">
                <div className="text-slate-400 text-xs font-body uppercase tracking-wider mb-3">Strike Order</div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-display font-bold text-white text-lg">
                      {topDebt?.name || 'Primary Residence'}
                    </div>
                    <div className="text-slate-400 text-xs font-body">{topDebt?.lender || 'American Savings Bank'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-extrabold text-emerald-400 tabular-nums">
                      ${strikeAmount.toFixed(2)}
                    </div>
                    <div className="text-slate-400 text-xs font-body">Principal Only</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <div className="pulse-dot" />
                  <span className="text-emerald-400 text-xs font-semibold font-body">Surplus Detected — Ready to Execute</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl mb-8">
                <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-blue-800 text-sm font-body mb-1">Zero-Trust Authorization</div>
                  <p className="text-blue-600 text-xs font-body leading-relaxed">
                    STRIKE's RPA engine requires your MFA code to proceed. You are always the
                    final gatekeeper. No payment executes without your explicit authorization.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSyncState('entering')}
                className="strike-btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Authorize Sync Session
              </button>
              <button
                onClick={handleCancel}
                className="w-full mt-3 text-slate-400 text-sm font-body py-2 hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          )}

          {/* ── Entering MFA ── */}
          {syncState === 'entering' && (
            <motion.div
              key="entering"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="pt-8"
            >
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
                  <Smartphone className="w-8 h-8 text-slate-600" />
                </div>
                <h2 className="font-display text-2xl font-extrabold text-slate-900 text-center mb-2">
                  Enter MFA Code
                </h2>
                <p className="text-slate-400 text-sm font-body text-center leading-relaxed max-w-xs">
                  STRIKE has passed the MFA prompt to your mobile device. Enter the
                  6-digit code from your authenticator app or SMS.
                </p>
              </div>

              <div className="mb-8">
                <MFAInput onComplete={handleCodeComplete} />
              </div>

              <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl mb-6">
                <Eye className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <p className="text-slate-400 text-xs font-body">
                  <strong className="text-slate-600">Demo tip:</strong> Enter any 6 digits to simulate authorization.
                </p>
              </div>

              <button
                onClick={handleCancel}
                className="w-full text-slate-400 text-sm font-body py-2 hover:text-slate-600 transition-colors"
              >
                Cancel Strike
              </button>
            </motion.div>
          )}

          {/* ── Verifying ── */}
          {syncState === 'verifying' && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="w-20 h-20 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin mb-6" />
              <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Verifying Code…</h2>
              <p className="text-slate-400 text-sm font-body text-center">
                Authenticating with Zero-Trust Architecture
              </p>
            </motion.div>
          )}

          {/* ── Executing RPA ── */}
          {syncState === 'executing' && (
            <motion.div
              key="executing"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pt-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <div className="font-display font-bold text-slate-900">Code Verified</div>
                  <div className="text-slate-400 text-xs font-body">Launching Service Bridge…</div>
                </div>
              </div>

              <RPALog />

              <div className="mt-5 flex items-center gap-2 p-4 bg-emerald-50 rounded-2xl">
                <div className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin flex-shrink-0" />
                <p className="text-emerald-700 text-xs font-body">
                  RPA executing principal-only payment. Do not close this window.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Success ── */}
          {syncState === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="flex flex-col items-center justify-center min-h-[70vh] text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6"
              >
                <Zap className="w-12 h-12 text-emerald-500" />
              </motion.div>

              <h2 className="font-display text-3xl font-extrabold text-slate-900 mb-3">
                Strike Complete.
              </h2>
              <p className="text-slate-400 text-base font-body mb-2">
                <span className="font-bold text-emerald-600 tabular-nums">${strikeAmount.toFixed(2)}</span> applied
                to principal.
              </p>
              <p className="text-slate-400 text-sm font-body mb-8">
                {topDebt?.name || 'Primary Residence'} · {topDebt?.lender || 'American Savings Bank'}
              </p>

              <div className="w-full bg-slate-50 rounded-2xl p-5 mb-8 text-left">
                <div className="text-slate-400 text-xs font-body uppercase tracking-wider mb-3">Impact Summary</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-slate-500">Principal Reduced</span>
                    <span className="font-semibold text-emerald-600 tabular-nums">${strikeAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-slate-500">Est. Interest Eliminated</span>
                    <span className="font-semibold text-emerald-600 tabular-nums">
                      ~${(strikeAmount * 0.35).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-slate-500">Time Saved</span>
                    <span className="font-semibold text-emerald-600">~3 days</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDone}
                className="strike-btn-primary w-full py-4 text-base"
              >
                Return to War Room
              </button>
            </motion.div>
          )}

          {/* ── Error State ── */}
          {syncState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">
                Verification Failed
              </h2>
              <p className="text-slate-400 text-sm font-body mb-8 max-w-xs">
                The MFA code could not be verified. Strike aborted. No funds were moved.
              </p>
              <button
                onClick={() => setSyncState('entering')}
                className="strike-btn-primary w-full py-4 text-base mb-3"
              >
                Try Again
              </button>
              <button
                onClick={handleCancel}
                className="w-full text-slate-400 text-sm font-body py-2"
              >
                Cancel
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
