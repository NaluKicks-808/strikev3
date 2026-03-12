/**
 * Project STRIKE — Login & Onboarding v3.0
 * Desktop: Split-screen — dark branded panel (left) + glassmorphism auth card (right)
 * Left panel: Dynamic amortization chart, rotating testimonial, STRIKE branding
 * Right panel: Auth card with email/password, Apple/Google buttons, biometric
 * Mobile: Centered glassmorphism card, no left panel
 * Steps: Splash → Login → Bank (Plaid modal) → Debts → Done
 */

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronRight,
  Plus,
  Trash2,
  ArrowRight,
  Fingerprint,
  TrendingDown,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

type Step = 'splash' | 'login' | 'bank' | 'debts' | 'done';

// ─── Mock Debts for Onboarding ──────────────────────────────────────────────

const MOCK_DEBTS = [
  { id: 'd1', name: 'Primary Residence Mortgage', type: 'Mortgage', lender: 'American Savings Bank', balance: '$409,068', rate: '6.27%' },
  { id: 'd2', name: 'Federal Student Loan', type: 'Student', lender: 'MOHELA', balance: '$60,407', rate: '5.05%' },
  { id: 'd3', name: 'Vehicle Loan', type: 'Auto', lender: 'Bank of Hawaii', balance: '$18,440', rate: '7.49%' },
  { id: 'd4', name: 'Chase Sapphire Reserve', type: 'Credit', lender: 'Chase', balance: '$4,280', rate: '24.99%' },
];

// ─── Testimonials ───────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "I killed my student loans 2 years early. STRIKE found $180/month I didn't even know I had.",
    name: 'Keali\'i M.',
    role: 'Honolulu, HI',
    metric: '$14,200 interest saved',
  },
  {
    quote: "My mortgage servicer buried the principal-only option. STRIKE handles it automatically every week.",
    name: 'Sarah T.',
    role: 'Kailua, HI',
    metric: '4 years shaved off mortgage',
  },
  {
    quote: "As a real estate agent, I gift STRIKE subscriptions at closing. Best closing gift in the industry.",
    name: 'David K.',
    role: 'RE Agent, Oahu',
    metric: '47 clients enrolled',
  },
];

// ─── Amortization Chart (SVG) ───────────────────────────────────────────────

function AmortizationChart() {
  // Simplified amortization curves: Standard vs STRIKE
  const points = 60; // 30 years = 60 half-years
  const standardPath: string[] = [];
  const strikePath: string[] = [];

  for (let i = 0; i <= points; i++) {
    const x = (i / points) * 100;
    // Standard: slow principal paydown (exponential interest front-loading)
    const standardY = 100 - (Math.pow(i / points, 2.2) * 100);
    // STRIKE: accelerated paydown
    const strikeY = 100 - (Math.pow(i / points, 1.4) * 100);
    standardPath.push(`${i === 0 ? 'M' : 'L'} ${x} ${standardY}`);
    strikePath.push(`${i === 0 ? 'M' : 'L'} ${x} ${strikeY}`);
  }

  return (
    <div className="relative w-full aspect-[16/10]">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
        ))}

        {/* Standard path (red) */}
        <motion.path
          d={standardPath.join(' ')}
          fill="none"
          stroke="#EF4444"
          strokeWidth="1.2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
          opacity={0.6}
        />

        {/* STRIKE path (green) */}
        <motion.path
          d={strikePath.join(' ')}
          fill="none"
          stroke="#10B981"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeOut', delay: 0.8 }}
        />

        {/* Area under STRIKE curve */}
        <motion.path
          d={`${strikePath.join(' ')} L 100 100 L 0 100 Z`}
          fill="url(#strikeGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1, delay: 1.5 }}
        />

        <defs>
          <linearGradient id="strikeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
        <span className="text-[10px] text-slate-500 font-body">Year 1</span>
        <span className="text-[10px] text-slate-500 font-body">Year 30</span>
      </div>

      {/* Legend */}
      <div className="absolute top-2 right-2 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-red-500 rounded-full opacity-60" />
          <span className="text-[10px] text-slate-400 font-body">Standard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-emerald-500 rounded-full" />
          <span className="text-[10px] text-emerald-400 font-body">With STRIKE</span>
        </div>
      </div>
    </div>
  );
}

// ─── Rotating Testimonial ───────────────────────────────────────────────────

function RotatingTestimonial() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const t = TESTIMONIALS[index];

  return (
    <div className="relative min-h-[120px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
        >
          <blockquote className="text-slate-300 text-sm font-body leading-relaxed italic mb-3">
            "{t.quote}"
          </blockquote>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white text-sm font-semibold font-body">{t.name}</div>
              <div className="text-slate-500 text-xs font-body">{t.role}</div>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              <TrendingDown className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold font-body">{t.metric}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex gap-1.5 mt-4">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              'h-1 rounded-full transition-all duration-300',
              i === index ? 'w-6 bg-emerald-500' : 'w-1.5 bg-slate-700 hover:bg-slate-600'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Left Panel (Desktop Only) ──────────────────────────────────────────────

function BrandedPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between h-full p-10 xl:p-14"
      style={{
        background: 'linear-gradient(160deg, #0a0f1a 0%, #0f172a 40%, #111827 100%)',
      }}
    >
      {/* Top: Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
          <Zap className="w-5 h-5 text-emerald-400" />
        </div>
        <span className="font-display text-xl font-extrabold text-white tracking-tight">STRIKE</span>
      </div>

      {/* Middle: Chart + Copy */}
      <div className="flex-1 flex flex-col justify-center max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase font-body mb-4">
            The Amortization Trap
          </p>
          <h2 className="font-display text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Your bank profits from
            <span className="text-red-400"> slow payoff.</span>
          </h2>
          <p className="text-slate-400 text-sm font-body leading-relaxed mb-8">
            On a $409,068 mortgage at 6.27% APR, you'll pay <strong className="text-white">$471,200 in interest</strong> over 30 years.
            STRIKE's principal-acceleration engine changes that math.
          </p>
        </motion.div>

        {/* Amortization Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="bg-white/[0.03] rounded-2xl p-5 border border-white/5 mb-8"
        >
          <div className="text-slate-500 text-xs font-body uppercase tracking-widest mb-3 font-semibold">
            Remaining Balance Over Time
          </div>
          <AmortizationChart />
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <RotatingTestimonial />
        </motion.div>
      </div>

      {/* Bottom: Stats */}
      <div className="flex items-center gap-6">
        <div>
          <div className="font-display text-2xl font-extrabold text-white tabular-nums">$87B</div>
          <div className="text-slate-500 text-xs font-body">Hawaii Mortgage TAM</div>
        </div>
        <div className="w-px h-10 bg-white/10" />
        <div>
          <div className="font-display text-2xl font-extrabold text-emerald-400 tabular-nums">$151K</div>
          <div className="text-slate-500 text-xs font-body">Max Interest Saved</div>
        </div>
        <div className="w-px h-10 bg-white/10" />
        <div>
          <div className="font-display text-2xl font-extrabold text-white tabular-nums">7.9 yrs</div>
          <div className="text-slate-500 text-xs font-body">Time Reclaimed</div>
        </div>
      </div>
    </div>
  );
}

// ─── Splash Step ────────────────────────────────────────────────────────────

function SplashStep({ onNext }: { onNext: () => void }) {
  useEffect(() => {
    const t = setTimeout(onNext, 2200);
    return () => clearTimeout(t);
  }, [onNext]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen lg:min-h-0 lg:h-full px-8">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-slate-900/20">
          <Zap className="w-9 h-9 text-emerald-400" />
        </div>
        <h1 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight mb-2">STRIKE</h1>
        <p className="text-slate-400 text-sm font-body">Automated Debt Assassination</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="mt-16 flex flex-col items-center gap-3"
      >
        <div className="w-6 h-6 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-body">Initializing secure session…</p>
      </motion.div>
    </div>
  );
}

// ─── Login Step (Glassmorphism Card) ────────────────────────────────────────

function LoginStep({ onNext }: { onNext: () => void }) {
  const [email, setEmail] = useState('evan@strike.app');
  const [password, setPassword] = useState('••••••••');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNext();
    }, 1200);
  };

  const handleBiometric = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNext();
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen lg:min-h-0 lg:h-full px-6 lg:px-12 xl:px-16 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-display text-lg font-extrabold text-slate-900 tracking-tight">STRIKE</span>
        </div>

        <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
          Welcome back.
        </h2>
        <p className="text-slate-400 text-sm font-body mb-8">
          Sign in to your STRIKE command center.
        </p>

        {/* Social Login Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleBiometric}
            className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 shadow-sm"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="currentColor"/>
            </svg>
            <span className="text-sm font-semibold text-slate-700 font-body">Apple</span>
          </button>
          <button
            onClick={handleBiometric}
            className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 shadow-sm"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-semibold text-slate-700 font-body">Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-slate-300 text-xs font-body">or continue with email</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Email/Password Form */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <label className={cn(
              'absolute left-4 transition-all duration-200 font-body pointer-events-none',
              focusedField === 'email' || email
                ? 'top-2 text-[10px] font-semibold text-emerald-500 uppercase tracking-wider'
                : 'top-1/2 -translate-y-1/2 text-sm text-slate-400'
            )}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className={cn(
                'w-full border rounded-xl px-4 pt-6 pb-2.5 text-slate-900 text-sm font-body transition-all duration-200 bg-white',
                focusedField === 'email'
                  ? 'border-emerald-400 ring-2 ring-emerald-500/15'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            />
          </div>
          <div className="relative">
            <label className={cn(
              'absolute left-4 transition-all duration-200 font-body pointer-events-none',
              focusedField === 'password' || password
                ? 'top-2 text-[10px] font-semibold text-emerald-500 uppercase tracking-wider'
                : 'top-1/2 -translate-y-1/2 text-sm text-slate-400'
            )}>
              Password
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              className={cn(
                'w-full border rounded-xl px-4 pt-6 pb-2.5 text-slate-900 text-sm font-body transition-all duration-200 pr-12 bg-white',
                focusedField === 'password'
                  ? 'border-emerald-400 ring-2 ring-emerald-500/15'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-semibold font-body transition-all duration-300 flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:opacity-60 mb-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Sign In <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        {/* Biometric */}
        <button
          onClick={handleBiometric}
          className="w-full py-3 rounded-xl text-sm font-medium font-body transition-all duration-200 flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
        >
          <Fingerprint className="w-4 h-4 text-emerald-500" />
          Sign in with biometrics
        </button>

        {/* Footer */}
        <p className="text-slate-300 text-xs text-center mt-8 font-body">
          Protected by 256-bit AES encryption and Zero-Trust Architecture.
        </p>
      </motion.div>
    </div>
  );
}

// ─── Bank Connection Step ───────────────────────────────────────────────────

function BankStep({ onNext }: { onNext: () => void }) {
  const { setShowPlaidModal, connectedBanks } = useApp();
  const [hasConnected, setHasConnected] = useState(false);

  // Watch for bank connections from the Plaid modal
  useEffect(() => {
    if (connectedBanks.length > 0 && !hasConnected) {
      setHasConnected(true);
    }
  }, [connectedBanks, hasConnected]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen lg:min-h-0 lg:h-full px-6 lg:px-12 xl:px-16 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Connect your funding source.
        </h2>
        <p className="text-slate-400 text-sm font-body mb-8 leading-relaxed">
          STRIKE uses read-only access to monitor your checking account for spending surpluses.
        </p>

        <AnimatePresence mode="wait">
          {!hasConnected ? (
            <motion.div key="connect" className="space-y-4">
              <button
                onClick={() => setShowPlaidModal(true)}
                className="w-full py-4 rounded-xl text-sm font-semibold font-body transition-all duration-300 flex items-center justify-center gap-2.5 bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                Connect Bank Account
              </button>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-slate-400 text-xs font-body leading-relaxed">
                  Powered by Plaid. STRIKE only requests read-only permissions.
                  Your credentials are never stored on our servers.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="connected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center py-8"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 ring-4 ring-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 mb-1">Bank Connected</h3>
              <p className="text-slate-400 text-sm font-body text-center mb-2">
                Read-only access established. Safety Net active.
              </p>
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold font-body">
                <div className="pulse-dot" />
                Monitoring active
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hasConnected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <button onClick={onNext} className="w-full py-3.5 rounded-xl text-sm font-semibold font-body bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all">
              Continue — Add Your Debts →
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Debts Step ─────────────────────────────────────────────────────────────

function DebtsStep({ onNext }: { onNext: () => void }) {
  const [added, setAdded] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const totalLiability = added.reduce((sum, id) => {
    const debt = MOCK_DEBTS.find(d => d.id === id);
    if (!debt) return sum;
    return sum + parseFloat(debt.balance.replace(/[$,]/g, ''));
  }, 0);

  const filtered = MOCK_DEBTS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.lender.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    setAdded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col min-h-screen lg:min-h-0 lg:h-full px-6 lg:px-12 xl:px-16 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1"
      >
        <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Identify your enemies.
        </h2>
        <p className="text-slate-400 text-sm font-body mb-6 leading-relaxed">
          Add the debts you want STRIKE to target.
        </p>

        {/* Total liability counter */}
        <div className="bg-slate-900 rounded-2xl p-5 mb-6">
          <div className="text-slate-400 text-xs font-body uppercase tracking-wider mb-1">Total Liability Identified</div>
          <div className="font-display text-3xl font-extrabold text-red-400 tabular-nums">
            ${totalLiability.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div className="text-slate-500 text-xs font-body mt-1">{added.length} debt{added.length !== 1 ? 's' : ''} targeted</div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search liabilities…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all bg-white"
          />
        </div>

        <div className="space-y-2.5">
          {filtered.map(debt => {
            const isAdded = added.includes(debt.id);
            const rateNum = parseFloat(debt.rate);
            return (
              <motion.div
                key={debt.id}
                layout
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer',
                  isAdded ? 'border-emerald-400 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'
                )}
                onClick={() => toggle(debt.id)}
              >
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold font-display',
                  debt.type === 'Mortgage' ? 'bg-slate-900 text-white' :
                  debt.type === 'Student' ? 'bg-blue-100 text-blue-700' :
                  debt.type === 'Auto' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                )}>
                  {debt.type.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 text-sm font-body truncate">{debt.name}</div>
                  <div className="text-slate-400 text-xs font-body">{debt.lender}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-display font-bold text-slate-900 text-sm tabular-nums">{debt.balance}</div>
                  <div className={cn(
                    'text-xs font-semibold font-body',
                    rateNum > 10 ? 'text-red-500' : rateNum > 6 ? 'text-amber-600' : 'text-emerald-600'
                  )}>
                    {debt.rate} APR
                  </div>
                </div>
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center transition-all',
                  isAdded ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                )}>
                  {isAdded ? <Trash2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="mt-6 pb-4">
        <button
          onClick={onNext}
          disabled={added.length === 0}
          className="w-full py-3.5 rounded-xl text-sm font-semibold font-body bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {added.length === 0 ? 'Add at least one debt' : `Begin Assassination — ${added.length} Target${added.length > 1 ? 's' : ''} Locked →`}
        </button>
      </div>
    </div>
  );
}

// ─── Main Login Page ─────────────────────────────────────────────────────

export default function Login() {
  const [step, setStep] = useState<Step>('splash');
  const { setAuthenticated, setOnboardingComplete } = useApp();
  const [, navigate] = useLocation();

  const advanceTo = useCallback((next: Step) => {
    setStep(next);
  }, []);

  const handleComplete = useCallback(() => {
    setAuthenticated(true);
    setOnboardingComplete(true);
    navigate('/dashboard');
  }, [setAuthenticated, setOnboardingComplete, navigate]);

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel — Desktop only */}
      {step !== 'splash' && <BrandedPanel />}

      {/* Right Panel — Auth content */}
      <div className={cn(
        'flex-1 relative',
        step !== 'splash' ? 'lg:max-w-[520px]' : ''
      )}>
        <AnimatePresence mode="wait">
          {step === 'splash' && (
            <SplashStep key="splash" onNext={() => advanceTo('login')} />
          )}
          {step === 'login' && (
            <LoginStep key="login" onNext={() => advanceTo('bank')} />
          )}
          {step === 'bank' && (
            <BankStep key="bank" onNext={() => advanceTo('debts')} />
          )}
          {step === 'debts' && (
            <DebtsStep key="debts" onNext={handleComplete} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
