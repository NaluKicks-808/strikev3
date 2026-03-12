/**
 * Project STRIKE — Faux Plaid Link Modal v3.0
 * A highly realistic Plaid-style authentication modal with 4-step flow:
 * 1. Institution Grid (Chase, Wells Fargo, Bank of Hawaii, etc.)
 * 2. Secure Login Form (username/password for selected institution)
 * 3. Spinner State ("Encrypting Read-Only Connection...")
 * 4. Success Confirmation with account details
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronLeft,
  Building2,
  Zap,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

// ─── Institution Data ────────────────────────────────────────────────────────

interface Institution {
  id: string;
  name: string;
  logo: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const INSTITUTIONS: Institution[] = [
  { id: 'chase', name: 'Chase', logo: '🏛️', color: '#1A73E8', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
  { id: 'wells', name: 'Wells Fargo', logo: '🔴', color: '#D71E28', bgColor: 'bg-red-50', borderColor: 'border-red-100' },
  { id: 'boh', name: 'Bank of Hawaii', logo: '🌊', color: '#0077B6', bgColor: 'bg-sky-50', borderColor: 'border-sky-100' },
  { id: 'asb', name: 'American Savings', logo: '🌺', color: '#059669', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100' },
  { id: 'fhb', name: 'First Hawaiian', logo: '🌴', color: '#0D9488', bgColor: 'bg-teal-50', borderColor: 'border-teal-100' },
  { id: 'boa', name: 'Bank of America', logo: '🔵', color: '#E31837', bgColor: 'bg-red-50', borderColor: 'border-red-100' },
  { id: 'citi', name: 'Citibank', logo: '🏦', color: '#003B70', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
  { id: 'usaa', name: 'USAA', logo: '⭐', color: '#00529B', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
  { id: 'cpb', name: 'Central Pacific', logo: '🏝️', color: '#1E40AF', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-100' },
];

type PlaidStep = 'institutions' | 'login' | 'encrypting' | 'success';

// ─── Step 1: Institution Grid ────────────────────────────────────────────────

function InstitutionGrid({ onSelect }: { onSelect: (inst: Institution) => void }) {
  const [search, setSearch] = useState('');
  const filtered = INSTITUTIONS.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-5">
        <h3 className="font-display text-xl font-bold text-slate-900 mb-1">Select your bank</h3>
        <p className="text-slate-400 text-sm font-body">Choose your financial institution to connect securely.</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input
          type="text"
          placeholder="Search institutions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-body text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
        {filtered.map((inst, i) => (
          <motion.button
            key={inst.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            onClick={() => onSelect(inst)}
            className={cn(
              'flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200',
              'hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-sm',
              inst.bgColor, inst.borderColor
            )}
          >
            <span className="text-2xl">{inst.logo}</span>
            <span className="text-xs font-semibold text-slate-700 font-body text-center leading-tight">{inst.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Trust footer */}
      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
        <Lock className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-400 text-xs font-body">
          Secured by Plaid. Your credentials are never stored by STRIKE.
        </span>
      </div>
    </motion.div>
  );
}

// ─── Step 2: Secure Login Form ───────────────────────────────────────────────

function LoginForm({ institution, onSubmit, onBack }: {
  institution: Institution;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubmit();
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-400 text-sm font-body mb-5 hover:text-slate-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl', institution.bgColor, 'border', institution.borderColor)}>
          {institution.logo}
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900">{institution.name}</h3>
          <p className="text-slate-400 text-xs font-body">Enter your online banking credentials</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 font-body uppercase tracking-wider">Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-sm font-body placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 font-body uppercase tracking-wider">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 text-sm font-body placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all pr-12 bg-white"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-semibold font-body transition-all duration-300 flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Connect Securely
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-2 mt-5 p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <span className="text-emerald-700 text-xs font-body leading-relaxed">
          STRIKE requests <strong>read-only</strong> access. We cannot initiate transfers or modify your accounts.
        </span>
      </div>
    </motion.div>
  );
}

// ─── Step 3: Encrypting Spinner ──────────────────────────────────────────────

function EncryptingState({ institution }: { institution: Institution }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Establishing secure tunnel...');

  useEffect(() => {
    const steps = [
      { at: 15, text: 'Authenticating with ' + institution.name + '...' },
      { at: 35, text: 'Verifying read-only permissions...' },
      { at: 55, text: 'Encrypting connection with AES-256...' },
      { at: 75, text: 'Scanning account endpoints...' },
      { at: 90, text: 'Finalizing secure handshake...' },
    ];

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + 1.5, 100);
        const step = steps.find(s => prev < s.at && next >= s.at);
        if (step) setStatusText(step.text);
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [institution.name]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center py-8"
    >
      {/* Animated lock icon */}
      <div className="relative mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-full border-2 border-slate-100 border-t-emerald-500"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Fingerprint className="w-8 h-8 text-emerald-500" />
        </div>
      </div>

      <h3 className="font-display text-lg font-bold text-slate-900 mb-2 text-center">
        Encrypting Read-Only Connection
      </h3>
      <p className="text-slate-400 text-sm font-body text-center mb-6 max-w-xs">
        {statusText}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      <span className="text-slate-300 text-xs font-body tabular-nums">{Math.round(progress)}%</span>

      {/* Security badges */}
      <div className="flex items-center gap-4 mt-8 pt-5 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-body">
          <Lock className="w-3 h-3" />
          AES-256
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-body">
          <ShieldCheck className="w-3 h-3" />
          Zero-Trust
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-body">
          <Building2 className="w-3 h-3" />
          SOC 2
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step 4: Success Confirmation ────────────────────────────────────────────

function SuccessState({ institution, onDone }: { institution: Institution; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
      className="flex flex-col items-center py-6"
    >
      {/* Success checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
        className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-emerald-100"
      >
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </motion.div>

      <h3 className="font-display text-xl font-bold text-slate-900 mb-1">
        {institution.name} Connected
      </h3>
      <p className="text-slate-400 text-sm font-body text-center mb-6">
        Read-only access established successfully.
      </p>

      {/* Account details */}
      <div className="w-full bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-xs font-body">Account Type</span>
          <span className="text-slate-800 text-sm font-semibold font-body">Checking ••••4821</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-xs font-body">Available Balance</span>
          <span className="font-display font-bold text-emerald-600 tabular-nums">$6,847.00</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-xs font-body">Access Level</span>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-600 text-xs font-semibold font-body">Read-Only</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-xs font-body">Encryption</span>
          <span className="text-slate-700 text-xs font-body">AES-256 / TLS 1.3</span>
        </div>
      </div>

      {/* Monitoring active */}
      <div className="flex items-center gap-2 mb-6">
        <div className="pulse-dot" />
        <span className="text-emerald-600 text-sm font-semibold font-body">Surplus monitoring active</span>
      </div>

      <button
        onClick={onDone}
        className="w-full py-3.5 rounded-xl text-sm font-semibold font-body transition-all duration-300 bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
      >
        Continue to STRIKE →
      </button>
    </motion.div>
  );
}

// ─── Main Modal Component ────────────────────────────────────────────────────

export function PlaidLinkModal() {
  const { showPlaidModal, setShowPlaidModal, addConnectedBank } = useApp();
  const [step, setStep] = useState<PlaidStep>('institutions');
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

  const handleSelectInstitution = useCallback((inst: Institution) => {
    setSelectedInstitution(inst);
    setStep('login');
  }, []);

  const handleLoginSubmit = useCallback(() => {
    setStep('encrypting');
    // Auto-advance to success after encryption animation
    setTimeout(() => {
      setStep('success');
    }, 3500);
  }, []);

  const handleDone = useCallback(() => {
    if (selectedInstitution) {
      addConnectedBank(selectedInstitution.id);
    }
    setShowPlaidModal(false);
    // Reset for next use
    setTimeout(() => {
      setStep('institutions');
      setSelectedInstitution(null);
    }, 300);
  }, [selectedInstitution, addConnectedBank, setShowPlaidModal]);

  const handleClose = useCallback(() => {
    setShowPlaidModal(false);
    setTimeout(() => {
      setStep('institutions');
      setSelectedInstitution(null);
    }, 300);
  }, [setShowPlaidModal]);

  if (!showPlaidModal) return null;

  return (
    <AnimatePresence>
      {showPlaidModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={step !== 'encrypting' ? handleClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="h-px w-8 bg-slate-200" />
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  {selectedInstitution ? (
                    <span className="text-lg">{selectedInstitution.logo}</span>
                  ) : (
                    <Building2 className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>
              {step !== 'encrypting' && (
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}
            </div>

            {/* Step indicator */}
            <div className="flex gap-1.5 px-6 py-4">
              {['institutions', 'login', 'encrypting', 'success'].map((s, i) => {
                const stepOrder = ['institutions', 'login', 'encrypting', 'success'];
                const currentIdx = stepOrder.indexOf(step);
                return (
                  <div
                    key={s}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-all duration-500',
                      i <= currentIdx ? 'bg-emerald-500' : 'bg-slate-100'
                    )}
                  />
                );
              })}
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <AnimatePresence mode="wait">
                {step === 'institutions' && (
                  <InstitutionGrid key="inst" onSelect={handleSelectInstitution} />
                )}
                {step === 'login' && selectedInstitution && (
                  <LoginForm
                    key="login"
                    institution={selectedInstitution}
                    onSubmit={handleLoginSubmit}
                    onBack={() => setStep('institutions')}
                  />
                )}
                {step === 'encrypting' && selectedInstitution && (
                  <EncryptingState key="encrypt" institution={selectedInstitution} />
                )}
                {step === 'success' && selectedInstitution && (
                  <SuccessState key="success" institution={selectedInstitution} onDone={handleDone} />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
