import React, { useState } from 'react';
import {
  Shield,
  Store as StoreIcon,
  Building2,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Sparkles,
  Layers,
  ChevronRight,
  Pill,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import { BusinessType, User, UserRole } from '../../types';
import { ROLE_INFO, ROLE_PERMISSIONS, generateSessionToken, isPlatformAdmin } from '../../lib/rbac';
import { SEED_USERS, StorageService } from '../../lib/storage';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [portalMode, setPortalMode] = useState<'primary_user' | 'platform_admin'>('primary_user');
  const [authTab, setAuthTab] = useState<'signin' | 'register' | 'demo'>('signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Business registration states
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regBusinessType, setRegBusinessType] = useState<BusinessType>('pharmacy');
  const [regStoreName, setRegStoreName] = useState('Main Branch');
  const [regStoreLocation, setRegStoreLocation] = useState('Victoria Island, Lagos');

  // Admin 2FA simulation
  const [adminPin, setAdminPin] = useState('2026');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const users = StorageService.getUsers();
      const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

      if (!user) {
        setIsLoading(false);
        setErrorMessage('No user account found with that email address. Check email or use a Demo Persona below.');
        StorageService.logAuditEvent({
          actorId: 'anonymous',
          actorName: email || 'Unknown',
          actorEmail: email || 'unknown',
          actorRole: 'store_attendant',
          action: 'LOGIN_FAILED_USER_NOT_FOUND',
          targetType: 'user',
          targetId: email,
          details: `Failed sign in attempt on ${portalMode} portal. Email not registered.`,
          ipAddress: '102.89.44.18 (Nigeria)',
          status: 'error',
        });
        return;
      }

      if (user.status === 'suspended') {
        setIsLoading(false);
        setErrorMessage('This account has been suspended by a Platform Administrator.');
        return;
      }

      // Check portal access match: Strict two-way boundary
      if (portalMode === 'platform_admin' && !isPlatformAdmin(user)) {
        setIsLoading(false);
        setErrorMessage('Access Denied: Standard business tenant users are strictly prohibited from the Platform Administration Portal.');
        StorageService.logAuditEvent({
          actorId: user.id,
          actorName: user.name,
          actorEmail: user.email,
          actorRole: user.role,
          action: 'PORTAL_ACCESS_DENIED_USER_INTO_ADMIN',
          targetType: 'system',
          targetId: 'admin_portal',
          details: `Business user with role ${user.role} attempted unauthorized login to Platform Admin Portal.`,
          ipAddress: '102.89.44.18 (Nigeria)',
          status: 'warning',
        });
        return;
      }

      if (portalMode === 'primary_user' && isPlatformAdmin(user)) {
        setIsLoading(false);
        setErrorMessage('Security Violation: Platform Administrator accounts are strictly prohibited from logging into the tenant business portal. For security and privacy, admins must use the Platform Administration Portal.');
        StorageService.logAuditEvent({
          actorId: user.id,
          actorName: user.name,
          actorEmail: user.email,
          actorRole: user.role,
          action: 'PORTAL_ACCESS_DENIED_ADMIN_INTO_USER',
          targetType: 'system',
          targetId: 'business_portal',
          details: `Platform Administrator ${user.email} attempted login to Business Portal. Blocked by privacy isolation policy.`,
          ipAddress: '102.89.44.18 (Nigeria)',
          status: 'warning',
        });
        return;
      }

      const updatedUser: User = {
        ...user,
        lastLoginAt: new Date().toISOString(),
        token: generateSessionToken(user.id, user.role),
      };

      StorageService.setCurrentUser(updatedUser);
      StorageService.logAuditEvent({
        actorId: updatedUser.id,
        actorName: updatedUser.name,
        actorEmail: updatedUser.email,
        actorRole: updatedUser.role,
        action: 'USER_LOGIN_SUCCESS',
        targetType: 'user',
        targetId: updatedUser.id,
        details: `Successful authenticated session started on ${portalMode}.`,
        ipAddress: '102.89.44.18 (Nigeria)',
        status: 'success',
      });

      setIsLoading(false);
      onLoginSuccess(updatedUser);
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const businesses = StorageService.getBusinesses();
      const users = StorageService.getUsers();

      // Create new business ID
      const newBizId = `biz_${Date.now().toString(36)}`;
      const newStoreId = `store_${Date.now().toString(36)}`;
      const newUserId = `user_${Date.now().toString(36)}`;

      const newStore = {
        id: newStoreId,
        businessId: newBizId,
        name: regStoreName || 'Main Branch',
        location: regStoreLocation || 'Lagos, Nigeria',
        isMainStore: true,
      };

      const newBusiness = {
        id: newBizId,
        name: regBusinessName || 'New Retail Enterprise',
        businessType: regBusinessType,
        optedInApi: false,
        currency: '₦',
        apiKey: `iip_live_${Math.random().toString(36).substring(2, 12)}`,
        stores: [newStore],
        createdAt: new Date().toISOString(),
      };

      const newUser: User = {
        id: newUserId,
        name: regFullName || 'Business Administrator',
        email: regEmail.trim(),
        role: 'business_owner',
        businessId: newBizId,
        businessName: newBusiness.name,
        storeId: newStoreId,
        permissions: ROLE_PERMISSIONS.business_owner,
        status: 'active',
        token: generateSessionToken(newUserId, 'business_owner'),
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      businesses.push(newBusiness);
      users.push(newUser);

      StorageService.saveBusinesses(businesses);
      StorageService.saveUsers(users);
      StorageService.setCurrentUser(newUser);

      StorageService.logAuditEvent({
        actorId: newUser.id,
        actorName: newUser.name,
        actorEmail: newUser.email,
        actorRole: newUser.role,
        action: 'TENANT_ONBOARDED',
        targetType: 'business',
        targetId: newBizId,
        details: `Created new ${regBusinessType} business account: "${newBusiness.name}" with store "${newStore.name}".`,
        ipAddress: '102.89.44.18 (Nigeria)',
        status: 'success',
      });

      setIsLoading(false);
      onLoginSuccess(newUser);
    }, 450);
  };

  const selectPersona = (seedUser: User) => {
    setIsLoading(true);
    setTimeout(() => {
      const updatedUser: User = {
        ...seedUser,
        lastLoginAt: new Date().toISOString(),
        token: generateSessionToken(seedUser.id, seedUser.role),
      };
      StorageService.setCurrentUser(updatedUser);
      StorageService.logAuditEvent({
        actorId: updatedUser.id,
        actorName: updatedUser.name,
        actorEmail: updatedUser.email,
        actorRole: updatedUser.role,
        action: 'DEMO_PERSONA_SIGNIN',
        targetType: 'user',
        targetId: updatedUser.id,
        details: `Quick sign-in via demo persona: ${updatedUser.name} (${ROLE_INFO[updatedUser.role].title})`,
        ipAddress: '102.89.44.18 (Nigeria)',
        status: 'success',
      });
      setIsLoading(false);
      onLoginSuccess(updatedUser);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Bar Branding */}
      <header className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
            <Layers className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">
                Inventory Intelligence Platform
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v3.0 MVP
              </span>
            </div>
            <p className="text-xs text-slate-400">
              The Trust & Intelligence Layer for Physical Inventory (PRD Specification)
            </p>
          </div>
        </div>

        {/* Portal Switcher Pill */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-700/80 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setPortalMode('primary_user');
              setAuthTab('signin');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              portalMode === 'primary_user'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <StoreIcon className="w-3.5 h-3.5" />
            Business Portal (Primary User)
          </button>
          <button
            type="button"
            onClick={() => {
              setPortalMode('platform_admin');
              setAuthTab('signin');
              setErrorMessage(null);
              setEmail('olanrewajuillias@gmail.com');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              portalMode === 'platform_admin'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Platform Admin Portal
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Context & Value Proposition */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auditable Event Ledger • Rules-Based Confidence • Action Center</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Stop guessing your stock.{' '}
            <span className="text-emerald-400">
              Verify truth.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Most pharmacies and retailers run on spreadsheets nobody reconciles. Our intelligence layer
            ingests messy uploads, records immutable ledger events, calculates deterministic stock confidence,
            and turns stockouts into immediate action cards.
          </p>

          {/* Core PRD Pillars Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-xs font-semibold text-slate-200">Ledger Over Overwrite</h2>
                <p className="text-[11px] text-slate-400">Every intake, sale, and variance is an immutable event with source & timestamp.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-xs font-semibold text-slate-200">Transparent Confidence</h2>
                <p className="text-[11px] text-slate-400">0-100 score weighted by count recency, variance, and consistency.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-xs font-semibold text-slate-200">High-Stakes AI Safety</h2>
                <p className="text-[11px] text-slate-400">Dosage mismatches (500mg vs 250mg) are never auto-merged silently.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-xs font-semibold text-slate-200">Verified Availability API</h2>
                <p className="text-[11px] text-slate-400">Opt-in sharing for partners (e.g. MediSwitch) with strict privacy boundaries.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-6">
            {/* Header within Card */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                  {portalMode === 'platform_admin' ? 'System Superadmin' : 'Business Authentication'}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                    portalMode === 'platform_admin'
                      ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50'
                      : 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50'
                  }`}
                >
                  {portalMode === 'platform_admin' ? 'Elevated Access' : 'RBAC Protected'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {portalMode === 'platform_admin'
                  ? 'Platform Administration'
                  : authTab === 'signin'
                  ? 'Sign in to your Store'
                  : authTab === 'register'
                  ? 'Onboard New Business'
                  : 'Select Demo Persona'}
              </h2>
            </div>

            {/* Navigation Tabs inside Card */}
            <div className="flex border-b border-slate-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signin');
                  setErrorMessage(null);
                }}
                className={`pb-2.5 px-3 border-b-2 transition-all ${
                  authTab === 'signin'
                    ? 'border-emerald-400 text-emerald-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>

              {portalMode === 'primary_user' && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    setErrorMessage(null);
                  }}
                  className={`pb-2.5 px-3 border-b-2 transition-all ${
                    authTab === 'register'
                      ? 'border-emerald-400 text-emerald-400 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Register Business
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setAuthTab('demo');
                  setErrorMessage(null);
                }}
                className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  authTab === 'demo'
                    ? 'border-emerald-400 text-emerald-400 font-semibold'
                    : 'border-transparent text-amber-400 hover:text-amber-300'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-400" />
                Instant Demo Personas
              </button>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* 1. SIGN IN FORM */}
            {authTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">Work Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        portalMode === 'platform_admin'
                          ? 'olanrewajuillias@gmail.com'
                          : 'amaka@medixcare.ng'
                      }
                      className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-300">Password</label>
                    <span className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                      Forgot?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {portalMode === 'platform_admin' && (
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/50 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                      <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                      Hardware Token / 2FA Security PIN
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      placeholder="2026"
                      className="w-full bg-slate-950 border border-purple-700/60 rounded-lg px-3 py-1.5 text-center tracking-widest text-xs font-mono text-purple-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <p className="text-[10px] text-purple-300/70 text-center">
                      Pre-filled sandbox token: 2026 (Audit ID: SEC-MFA-SYS)
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
                    />
                    <span>Remember this workstation</span>
                  </label>
                  <span className="text-[11px] text-slate-500">256-bit encrypted session</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-950 flex items-center justify-center gap-2 transition-all ${
                    portalMode === 'platform_admin'
                      ? 'bg-purple-400 hover:bg-purple-300 shadow-lg shadow-purple-500/20'
                      : 'bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {isLoading ? (
                    <span className="inline-block animate-pulse">Authenticating Session...</span>
                  ) : (
                    <>
                      <span>
                        {portalMode === 'platform_admin'
                          ? 'Enter Admin Console'
                          : 'Sign In to Business'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Helpful Quick Tip */}
                <div className="pt-2 text-center">
                  <p className="text-[11px] text-slate-400">
                    Want to test without typing?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthTab('demo')}
                      className="text-emerald-400 font-medium underline"
                    >
                      Click here for instant persona switch
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* 2. REGISTRATION FORM (PRIMARY USER) */}
            {authTab === 'register' && portalMode === 'primary_user' && (
              <form onSubmit={handleRegister} className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">Business Name</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={regBusinessName}
                      onChange={(e) => setRegBusinessName(e.target.value)}
                      placeholder="e.g. MedixCare Community Pharmacy"
                      className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">Business Vertical Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegBusinessType('pharmacy')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        regBusinessType === 'pharmacy'
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Pill className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-[11px] font-semibold">Pharmacy</div>
                      <div className="text-[9px] text-slate-400">Batch & Expiry</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegBusinessType('supermarket')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        regBusinessType === 'supermarket'
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-[11px] font-semibold">Supermarket</div>
                      <div className="text-[9px] text-slate-400">Dead Capital</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegBusinessType('general_retail')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        regBusinessType === 'general_retail'
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <StoreIcon className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-[11px] font-semibold">General Retail</div>
                      <div className="text-[9px] text-slate-400">Fast Counts</div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">First Store Name</label>
                    <input
                      type="text"
                      required
                      value={regStoreName}
                      onChange={(e) => setRegStoreName(e.target.value)}
                      placeholder="Victoria Island Branch"
                      className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">City / Location</label>
                    <input
                      type="text"
                      required
                      value={regStoreLocation}
                      onChange={(e) => setRegStoreLocation(e.target.value)}
                      placeholder="Lagos, Nigeria"
                      className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">Owner Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Dr. Amaka Okafor"
                      className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">Owner Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="amaka@pharmacy.ng"
                      className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950/60 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? 'Creating Business Ledger...' : 'Create Account & Initialize Ledger'}
                </button>
              </form>
            )}

            {/* 3. INSTANT DEMO PERSONAS GRID */}
            {authTab === 'demo' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>
                    {portalMode === 'platform_admin'
                      ? 'Select an Administrator Account:'
                      : 'Select a Store Team Persona:'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {portalMode === 'platform_admin' ? 'Admins Only' : 'Tenant Staff Only'}
                  </span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {SEED_USERS.filter((u) =>
                    portalMode === 'platform_admin' ? isPlatformAdmin(u) : !isPlatformAdmin(u)
                  ).map((user) => {
                    const info = ROLE_INFO[user.role];
                    const isSuperAdmin = user.role === 'platform_super_admin';
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => selectPersona(user)}
                        className="w-full p-3 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-white group-hover:text-emerald-300 transition-colors">
                                {user.name}
                              </span>
                              {isSuperAdmin && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {user.businessName || 'Platform Super Administration'}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Role: <span className="text-slate-300 font-medium">{info.title}</span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer System Specs */}
      <footer className="max-w-6xl w-full mx-auto pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          <span>Architecture: Event Ledger • Zero Silent AI Overwrites • Currency: NGN (₦)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Author: Divine Isaac & Olanrewaju Illias</span>
          <span>•</span>
          <span className="text-emerald-400 font-mono text-[11px]">Secure RBAC v3.0</span>
        </div>
      </footer>
    </div>
  );
};
