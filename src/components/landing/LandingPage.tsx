import React from 'react';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Package,
  Clock,
  Sparkles,
  FileSpreadsheet,
  Activity,
  Building,
  Store,
  Pill,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { User } from '../../types';

interface LandingPageProps {
  onOpenAuth: (mode: 'signin' | 'register') => void;
  currentUser: User | null;
  onGoToDashboard: () => void;
  onNavigateAdmin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  currentUser,
  onGoToDashboard,
  onNavigateAdmin,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Marketing Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-950 dark:text-white">
                Inventory Intelligence
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                The Trust & Intelligence Layer for Physical Stock
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
            <a href="#problem" className="hover:text-slate-950 dark:hover:text-white transition-colors">
              The Problem
            </a>
            <a href="#how-it-works" className="hover:text-slate-950 dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-slate-950 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#verticals" className="hover:text-slate-950 dark:hover:text-white transition-colors">
              Verticals
            </a>
            <a href="#availability-api" className="hover:text-slate-950 dark:hover:text-white transition-colors">
              Availability API
            </a>
          </nav>

          {/* CTA & Theme Controls */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {currentUser ? (
              <button
                type="button"
                onClick={onGoToDashboard}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onOpenAuth('signin')}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <span>Built for Nigerian SMEs, Independent Pharmacies & Supermarkets</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
            The Trust and Intelligence Layer for Physical Inventory
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Most businesses run on spreadsheets and notebook records nobody fully reconciles. We ingest
            your messy waybills, record an immutable ledger of every movement, calculate a transparent
            Stock Confidence score, and turn stockouts into actionable next steps.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span>Start Free Business Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('signin')}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Explore Interactive Demo</span>
            </button>
          </div>

          {/* Trust Banner Points */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Ledger Over Overwrite</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Never hand-edit a stock number. Every change is an immutable event.
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Human-In-The-Loop AI</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                AI proposes column mappings; you confirm before anything is committed.
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Stock Confidence (0-100)</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mathematical trust score weighted by count recency and variance.
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Opt-In Availability API</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Broadcast sellable quantity to platforms like MediSwitch securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="py-16 bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              The Reality of Retail & Pharmacy Inventory
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Why traditional spreadsheets, generic POS apps, and paper logs silently leak revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Phantom Inventory & Silent Shrinkage
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Stock disappears for reasons sales logs never record: breakage, staff error, or unrecorded
                cash exchanges. A system that only subtracts recorded sales confidently reports numbers that
                are completely wrong.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Intake Exhaustion & Dirty Data
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Manually retyping hundreds of supplier waybill lines is treated as an unpaid second job.
                Columns change from week to week, abbreviations cause duplicates, and physical reality drifts
                from the computer.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Batch Expiry Blindness & Dead Capital
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Products quietly expire on shelves without batch alerts. Slow-moving goods tie up millions of
                Naira in dead capital, while fast-moving items stock out right when customers ask for them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              The Product Loop: From Messy Input to Verified Action
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Messy input → Normalized record → Immutable event → Computed state → Reconciled trust → Action
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                Phase 1: Inbound
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Drop In Messy Files</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Upload supplier waybills or POS exports. AI suggests column mappings with required human review.
                High-stakes dosage differences are never merged automatically.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                Phase 2: On-Hand
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Computed Stock State</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Expected stock is calculated from immutable receipts, transfers, and sales. Batch-level expiry
                alerts trigger at 90, 60, and 30 days.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                Phase 3: Outbound
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Sales & Write-Offs</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Fast counter sales, prescription dispensing logs, and structured damage write-offs ensure
                shrinkage isn't hiding known losses.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                Intelligence
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Action Center</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Every screen answers: What happened, why it matters, what to do, and what evidence supports it.
                No vanity charts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Verticals */}
      <section id="verticals" className="py-16 bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Built for Multiple Physical Retail Verticals
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              General retail, supermarket, and pharmacy — treated as equally weighted first-class business types.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Independent Pharmacy</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Batch/expiry tracking at 90/60/30 days, prescription vs OTC dispensing, and strict
                strength-aware matching that never merges different dosages (e.g. 500mg vs 250mg).
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Supermarkets & Grocers</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Detects dead capital tying up cash in slow-moving lines, tracks perishable goods, and calculates
                aggregate shrinkage value from prioritized weekly shelf counts.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">General Retail</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Multi-branch stock visibility across outlets (Lagos, Abuja, Port Harcourt), reorder point triggers,
                and fast barcode/SKU reconciliation without administrative exhaustion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* External Availability API Callout (MediSwitch Partner) */}
      <section id="availability-api" className="py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-100 dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Opt-In Ecosystem API
            </span>
          </div>

          <h3 className="text-xl font-bold text-slate-950 dark:text-white">
            Connect Verified Stock to Consuming Networks
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Businesses can opt in to expose verified availability through a simple REST API. Discovery
            platforms (such as <strong className="text-slate-950 dark:text-white">MediSwitch</strong>) can query
            whether an item is sellable and view its Stock Confidence score — eliminating wasted trips for patients
            and customers.
          </p>

          <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
            GET /api/v1/availability?sku=MED-AUG-625&store=store_vi → {'{'} sellable_quantity: 16, confidence: 85 {'}'}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Strict privacy guarantee: Only availability and confidence are shared. Cost price, margins, supplier
            records, and clinical equivalence claims are strictly never exposed.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Inventory Intelligence Platform
            </span>
            <span>•</span>
            <span>Version 3.0 Production Build</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {onNavigateAdmin && (
              <button
                type="button"
                onClick={onNavigateAdmin}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 underline font-medium transition-colors"
              >
                Platform Operator Console
              </button>
            )}
            <span>•</span>
            <span>Divine Isaac & Olanrewaju Illias</span>
            <span>•</span>
            <span>Nigeria First Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
