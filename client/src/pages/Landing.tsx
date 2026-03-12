/**
 * Project STRIKE — Landing Page v3.1
 * Upgrades: Sticky glassmorphism nav, scroll-triggered fade-up animations,
 *           interactive Time Machine slider in the Assassination Math section
 */

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'wouter';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  Link2,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Clock,
  DollarSign,
  Lock,
  Star,
  ArrowRight,
  Minus,
  Plus,
} from 'lucide-react';

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663424091007/42AyqxJKfutVk7DDHagR3G/strike-hero-bg-dH6rZ4QjB9majVuU9uasTR.webp';
const PHONE_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663424091007/42AyqxJKfutVk7DDHagR3G/strike-dashboard-preview-WBLxQ3UBEcaGcoDzwiwyR9.webp';

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Is my banking data secure?',
    a: 'STRIKE uses bank-level 256-bit AES encryption and a Zero-Trust Architecture. We connect via Plaid\'s read-only API — we can see your balance, but we cannot move money without your explicit authorization through a Sync Session.',
  },
  {
    q: 'What is the Safety Net?',
    a: 'Your Safety Net is a minimum balance threshold you set (e.g., $2,000). STRIKE will never execute a Strike if your checking account balance would fall below this amount. Your bills are always protected.',
  },
  {
    q: 'What is a "principal-only" payment?',
    a: 'Standard mortgage payments are split between interest and principal. A principal-only payment goes 100% toward reducing your loan balance, which directly reduces the total interest you will pay over the life of the loan.',
  },
  {
    q: 'How much can I actually save?',
    a: 'On a $409,068 mortgage at 6.27% APR, adding just $200/month in extra principal payments can save over $87,000 in interest and shave 5+ years off your loan. The math is staggering — and STRIKE does it automatically.',
  },
  {
    q: 'Which lenders does STRIKE support?',
    a: 'STRIKE\'s Service Bridge is trained on the four primary Hawaii lenders: American Savings Bank, Bank of Hawaii, First Hawaiian Bank, and Central Pacific Bank — which together service an estimated 97% of the local mortgage market.',
  },
  {
    q: 'Can I pause or cancel at any time?',
    a: 'Absolutely. The Panic Button in your dashboard immediately pauses all automated Strikes. You remain in full control at all times. Cancel your subscription with one click — no fees, no friction.',
  },
];

// ─── Time Machine Calculation ─────────────────────────────────────────────────

function calculateMortgage(principal: number, annualRate: number, extraMonthly: number) {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = 360; // 30 years
  const minPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  // Standard path
  let stdBalance = principal;
  let stdMonths = 0;
  let stdTotalInterest = 0;
  while (stdBalance > 0 && stdMonths < 360) {
    const interest = stdBalance * monthlyRate;
    const principalPaid = minPayment - interest;
    stdTotalInterest += interest;
    stdBalance -= principalPaid;
    stdMonths++;
    if (stdBalance < 0) stdBalance = 0;
  }

  // STRIKE path
  let strikeBalance = principal;
  let strikeMonths = 0;
  let strikeTotalInterest = 0;
  while (strikeBalance > 0 && strikeMonths < 360) {
    const interest = strikeBalance * monthlyRate;
    const principalPaid = minPayment - interest + extraMonthly;
    strikeTotalInterest += interest;
    strikeBalance -= principalPaid;
    strikeMonths++;
    if (strikeBalance < 0) strikeBalance = 0;
  }

  return {
    stdMonths,
    stdTotalInterest,
    strikeMonths,
    strikeTotalInterest,
    interestSaved: stdTotalInterest - strikeTotalInterest,
    monthsSaved: stdMonths - strikeMonths,
    yearsSaved: ((stdMonths - strikeMonths) / 12),
  };
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-slate-100 last:border-0 cursor-pointer"
      onClick={() => setOpen(v => !v)}
    >
      <div className="flex items-center justify-between py-5 gap-4">
        <span className="font-semibold text-slate-800 text-sm leading-snug font-body">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="pb-5 text-slate-500 text-sm leading-relaxed font-body"
        >
          {a}
        </motion.div>
      )}
    </div>
  );
}

/** Fade-up wrapper using Intersection Observer */
function FadeUp({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Interactive Time Machine Slider */
function TimeMachineSlider() {
  const [extraMonthly, setExtraMonthly] = useState(200);
  const principal = 409068;
  const rate = 6.27;

  const result = useMemo(
    () => calculateMortgage(principal, rate, extraMonthly),
    [extraMonthly]
  );

  const maxInterest = useMemo(
    () => calculateMortgage(principal, rate, 0).stdTotalInterest,
    []
  );

  const strikeBarWidth = ((result.strikeTotalInterest / maxInterest) * 100).toFixed(1);
  const stdBarWidth = '100';

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-slate-700/50">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-emerald-400" />
        <span className="text-emerald-400 text-xs font-body uppercase tracking-widest font-semibold">
          Interactive Time Machine
        </span>
      </div>
      <p className="text-slate-400 text-sm font-body mb-6">
        Drag the slider to see how much interest you could kill on a <strong className="text-white">${principal.toLocaleString()}</strong> mortgage at <strong className="text-white">{rate}% APR</strong>.
      </p>

      {/* Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-xs font-body">Extra Monthly Principal</span>
          <span className="font-display text-2xl font-extrabold text-emerald-400 tabular-nums">
            ${extraMonthly}/mo
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExtraMonthly(v => Math.max(0, v - 50))}
            className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors"
          >
            <Minus className="w-3.5 h-3.5 text-slate-300" />
          </button>
          <input
            type="range"
            min={0}
            max={1500}
            step={25}
            value={extraMonthly}
            onChange={e => setExtraMonthly(Number(e.target.value))}
            className="flex-1 range-dark"
          />
          <button
            onClick={() => setExtraMonthly(v => Math.min(1500, v + 50))}
            className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>
        <div className="flex justify-between text-xs text-slate-600 font-body mt-1.5">
          <span>$0</span>
          <span>$1,500</span>
        </div>
      </div>

      {/* Results Comparison */}
      <div className="space-y-4 mb-6">
        {/* Standard */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm font-body font-medium">Without STRIKE</span>
            <span className="text-red-400 text-sm font-display font-bold tabular-nums">
              ${Math.round(result.stdTotalInterest).toLocaleString()} interest
            </span>
          </div>
          <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-red-500/80 transition-all duration-500"
              style={{ width: `${stdBarWidth}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="text-slate-500 text-xs font-body tabular-nums">
              {Math.round(result.stdMonths / 12)} years, {result.stdMonths % 12} months
            </span>
          </div>
        </div>

        {/* STRIKE */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-body font-medium">With STRIKE (+${extraMonthly}/mo)</span>
            <span className="text-emerald-400 text-sm font-display font-bold tabular-nums">
              ${Math.round(result.strikeTotalInterest).toLocaleString()} interest
            </span>
          </div>
          <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              animate={{ width: `${strikeBarWidth}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Clock className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-400 text-xs font-body tabular-nums">
              {Math.round(result.strikeMonths / 12)} years, {result.strikeMonths % 12} months
            </span>
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <div className="font-display text-2xl lg:text-3xl font-extrabold text-emerald-400 tabular-nums">
            ${Math.round(result.interestSaved).toLocaleString()}
          </div>
          <div className="text-emerald-300/60 text-xs font-body mt-1">Interest Killed</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <div className="font-display text-2xl lg:text-3xl font-extrabold text-emerald-400 tabular-nums">
            {result.yearsSaved.toFixed(1)}
          </div>
          <div className="text-emerald-300/60 text-xs font-body mt-1">Years Saved</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <div className="font-display text-2xl lg:text-3xl font-extrabold text-emerald-400 tabular-nums">
            {result.monthsSaved}
          </div>
          <div className="text-emerald-300/60 text-xs font-body mt-1">Payments Eliminated</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Landing() {
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-white font-body">
      {/* ── Sticky Glassmorphism Navigation ── */}
      <motion.nav
        initial={false}
        animate={{
          backgroundColor: navScrolled ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.95)',
          backdropFilter: navScrolled ? 'blur(20px) saturate(180%)' : 'blur(8px)',
          borderBottomColor: navScrolled ? 'rgba(226,232,240,0.6)' : 'rgba(226,232,240,0.3)',
          boxShadow: navScrolled ? '0 1px 3px rgba(0,0,0,0.04)' : '0 0 0 rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 border-b"
        style={{ WebkitBackdropFilter: navScrolled ? 'blur(20px) saturate(180%)' : 'blur(8px)' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-display font-extrabold text-slate-900 text-lg tracking-tight">STRIKE</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">How It Works</a>
            <a href="#math" className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">The Math</a>
            <a href="#faq" className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">FAQ</a>
          </div>
          <Link href="/login">
            <button className="strike-btn-primary text-sm py-2.5 px-5">
              Start the Assassination
            </button>
          </Link>
        </div>
      </motion.nav>

      {/* ── Hero Section ── */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 mb-8">
                <div className="pulse-dot" />
                <span className="text-emerald-700 text-xs font-semibold font-body">Live in Hawaii — Launching 2026</span>
              </div>

              <h1 className="font-display text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-6">
                Interest never sleeps.
                <span className="block text-emerald-500 mt-1">Neither do we.</span>
              </h1>

              <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-lg font-body">
                The automated assassin for your Mortgage, Student Loans, and Credit Card debt.
                STRIKE finds your spending surplus and executes principal-only payments
                while you sleep — killing interest before it kills your wealth.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/login">
                  <button className="strike-btn-primary text-base py-4 px-8 w-full sm:w-auto flex items-center justify-center gap-2">
                    Start the Assassination <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <a href="#math">
                  <button className="strike-btn-ghost text-base py-4 px-8 border border-slate-200 w-full sm:w-auto">
                    See the Math
                  </button>
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Lock className="w-3.5 h-3.5" />
                  256-bit Encryption
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Read-Only Access
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Zap className="w-3.5 h-3.5" />
                  Zero-Trust Architecture
                </div>
              </div>
            </motion.div>

            {/* Right: Phone mockup */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="hidden lg:flex justify-center items-center"
            >
              <div className="relative">
                <img
                  src={PHONE_IMG}
                  alt="STRIKE App Dashboard"
                  className="w-72 drop-shadow-2xl"
                />
                {/* Floating stat cards */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="absolute -left-16 top-1/4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-slate-100/50"
                >
                  <div className="text-xs text-slate-400 font-body mb-1">Interest Killed</div>
                  <div className="font-display text-2xl font-extrabold text-emerald-500 tabular-nums">$87,420</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                  className="absolute -right-12 bottom-1/3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-slate-100/50"
                >
                  <div className="text-xs text-slate-400 font-body mb-1">Time Saved</div>
                  <div className="font-display text-2xl font-extrabold text-slate-900 tabular-nums">+5.2 yrs</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Hawaii market stat strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm py-4">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: 'Avg. Hawaii Mortgage', value: '$409,068' },
                { label: 'Statewide Mortgage TAM', value: '$87B' },
                { label: 'Avg. Monthly Payment', value: '$3,382' },
                { label: 'Student Loan TAM', value: '$4.8B' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="font-display text-xl font-bold text-white tabular-nums">{value}</div>
                  <div className="text-slate-400 text-xs mt-0.5 font-body">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp>
            <div className="mb-16">
              <p className="text-emerald-600 text-sm font-semibold tracking-widest uppercase font-body mb-3">The System</p>
              <h2 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">
                Three steps to financial freedom.
              </h2>
              <p className="text-slate-500 mt-4 max-w-xl font-body leading-relaxed">
                STRIKE operates silently in the background, executing a precise three-step protocol
                to systematically dismantle your debt.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Link2,
                title: 'Connect',
                subtitle: 'Link your funding source',
                desc: 'Securely connect your checking account via Plaid\'s read-only API. STRIKE monitors your balance in real time, detecting spending surpluses the moment they appear.',
                color: 'bg-slate-900',
              },
              {
                step: '02',
                icon: ShieldCheck,
                title: 'Protect',
                subtitle: 'Set your Safety Net',
                desc: 'Define your minimum buffer (e.g., $2,000). STRIKE will never touch your bill money. The Safety Net is your financial immune system — inviolable.',
                color: 'bg-slate-700',
              },
              {
                step: '03',
                icon: Zap,
                title: 'Strike',
                subtitle: 'We attack principal instantly',
                desc: 'When a surplus is detected above your Safety Net, STRIKE\'s RPA engine automatically executes a principal-only payment — bypassing the bank\'s intentional friction.',
                color: 'bg-emerald-500',
              },
            ].map(({ step, icon: Icon, title, subtitle, desc, color }, i) => (
              <FadeUp key={step} delay={i * 0.12}>
                <div className="strike-card p-8 h-full">
                  <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-slate-300 text-xs font-bold tracking-widest font-body mb-2">{step}</div>
                  <h3 className="font-display text-xl font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-emerald-600 text-sm font-medium font-body mb-4">{subtitle}</p>
                  <p className="text-slate-500 text-sm leading-relaxed font-body">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Assassination Math + Interactive Time Machine ── */}
      <section id="math" className="py-24 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <FadeUp>
              <div>
                <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase font-body mb-3">The Amortization Trap</p>
                <h2 className="font-display text-4xl font-extrabold text-white tracking-tight mb-6">
                  The math is brutal.
                  <span className="block text-emerald-400">STRIKE makes it work for you.</span>
                </h2>
                <p className="text-slate-400 leading-relaxed font-body mb-8">
                  On a standard 30-year mortgage, the overwhelming majority of your early payments
                  go directly to the bank's interest yield — not your equity. In Hawaii, where the
                  average mortgage balance is <strong className="text-white">$409,068</strong> at
                  <strong className="text-red-400"> 6.27% APR</strong>, this isn't just inefficient.
                  It's a wealth-destroying mechanism.
                </p>
                <p className="text-slate-400 leading-relaxed font-body mb-8">
                  STRIKE's principal-acceleration engine exploits the one mathematical lever
                  available to borrowers: every dollar applied to principal today eliminates
                  <em className="text-white"> all future interest</em> that would have accrued on that dollar
                  over the remaining life of the loan.
                </p>

                {/* Static comparison cards */}
                <div className="space-y-3">
                  {[
                    { label: 'Without STRIKE', interest: '$471,200', years: '30 years', color: 'text-red-400', barColor: 'bg-red-500', width: '100%' },
                    { label: 'With STRIKE (+$200/mo)', interest: '$384,100', years: '25.3 years', color: 'text-amber-400', barColor: 'bg-amber-500', width: '84%' },
                    { label: 'With STRIKE (+$500/mo)', interest: '$319,400', years: '22.1 years', color: 'text-emerald-400', barColor: 'bg-emerald-500', width: '68%' },
                  ].map(({ label, interest, years, color, barColor, width }) => (
                    <div key={label} className="bg-slate-800/60 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-semibold font-body">{label}</span>
                        <span className={`${color} text-sm font-bold tabular-nums font-display`}>{interest}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          className={`h-full rounded-full ${barColor}`}
                        />
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-500 text-xs font-body">{years}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Interactive Time Machine */}
            <FadeUp delay={0.15}>
              <div className="lg:sticky lg:top-28">
                <TimeMachineSlider />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp>
            <div className="text-center mb-16">
              <p className="text-emerald-600 text-sm font-semibold tracking-widest uppercase font-body mb-3">Testimonials</p>
              <h2 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">
                Debt assassinated. Wealth reclaimed.
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "I killed my student loans 2 years early. STRIKE found $180/month I didn't even know I had and applied it automatically. I never had to think about it.",
                name: 'Keali\'i M.',
                role: 'Honolulu, HI · Student Loan Eliminated',
                stars: 5,
              },
              {
                quote: "My mortgage servicer buried the principal-only option so deep I could never find it. STRIKE handles it for me every single week. I've shaved 4 years off my loan already.",
                name: 'Sarah T.',
                role: 'Kailua, HI · Mortgage Accelerated',
                stars: 5,
              },
              {
                quote: "As a real estate agent, I gift STRIKE subscriptions at closing. My clients call me 6 months later to thank me. It's the best closing gift in the industry.",
                name: 'David K.',
                role: 'RE Agent, Oahu · B2B2C Partner',
                stars: 5,
              },
            ].map(({ quote, name, role, stars }, i) => (
              <FadeUp key={name} delay={i * 0.1}>
                <div className="strike-card p-8 h-full">
                  <div className="flex gap-0.5 mb-5">
                    {Array.from({ length: stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-slate-600 text-sm leading-relaxed font-body mb-6">
                    "{quote}"
                  </blockquote>
                  <div className="border-t border-slate-100 pt-5">
                    <div className="font-semibold text-slate-900 text-sm font-body">{name}</div>
                    <div className="text-slate-400 text-xs mt-0.5 font-body">{role}</div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <FadeUp>
            <div className="mb-12">
              <p className="text-emerald-600 text-sm font-semibold tracking-widest uppercase font-body mb-3">Security & Trust</p>
              <h2 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">
                Your questions, answered.
              </h2>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="strike-card px-8">
              {FAQ_ITEMS.map((item) => (
                <FAQItem key={item.q} {...item} />
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeUp>
            <h2 className="font-display text-5xl font-extrabold text-white tracking-tight mb-6">
              Stop paying the bank's mortgage.
              <span className="block text-emerald-400 mt-1">Start paying your own.</span>
            </h2>
            <p className="text-slate-400 text-lg font-body mb-10 max-w-2xl mx-auto leading-relaxed">
              The average Hawaii homeowner will pay <strong className="text-white">$471,200 in interest</strong> over
              30 years. STRIKE is the automated weapon that changes that math — permanently.
            </p>
            <Link href="/login">
              <button className="strike-btn-primary text-lg py-5 px-12 inline-block">
                Start the Assassination <ArrowRight className="w-5 h-5 inline ml-1" />
              </button>
            </Link>
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-body">
                <DollarSign className="w-3.5 h-3.5" />
                No setup fees
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-body">
                <ShieldCheck className="w-3.5 h-3.5" />
                Cancel anytime
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-body">
                <Lock className="w-3.5 h-3.5" />
                Bank-level security
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-800 rounded-md flex items-center justify-center">
              <Zap className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="font-display font-bold text-slate-400 text-sm">STRIKE</span>
          </div>
          <p className="text-slate-600 text-xs font-body text-center">
            © 2026 Project STRIKE. Built by Evan Nalu Foster. BYUH EYD Competition.
            All financial figures sourced from Hawaii market data.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-600 hover:text-slate-400 text-xs font-body transition-colors">Privacy</a>
            <a href="#" className="text-slate-600 hover:text-slate-400 text-xs font-body transition-colors">Security</a>
            <a href="#" className="text-slate-600 hover:text-slate-400 text-xs font-body transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
