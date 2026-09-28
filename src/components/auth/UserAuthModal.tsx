import React, { useState } from 'react';
import {
  X,
  Building2,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  AlertTriangle,
  Pill,
  ShoppingBag,
  Store,
  CheckCircle2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { BusinessType, User } from '../../types';
import { ROLE_PERMISSIONS, ROLE_INFO, generateSessionToken, isPlatformAdmin } from '../../lib/rbac';
import { SEED_USERS, StorageService } from '../../lib/storage';

interface UserAuthModalProps {
  isOpen: boolean;
  initialMode: 'signin' | 'register';
  onClose: () => void;
  onLoginSuccess: (user: User, welcomeMessage: string) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onLoginSuccess,
}) => {
  const [tab, setTab] = useState<'signin' | 'register' | 'demo'>(initialMode);

  // Sign In Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Registration Form States
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regBusinessType, setRegBusinessType] = useState<BusinessType>('pharmacy');
  const [regStoreName, setRegStoreName] = useState('Main Branch');
  const [regStoreLocation, setRegStoreLocation] = useState('Victoria Island, Lagos');

  if (!isOpen) return null;

  // Filter demo personas to ONLY show normal business team personas
  const businessPersonas = SEED_USERS.filter((u) => !isPlatformAdmin(u));

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const users = StorageService.getUsers();
      const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

      if (!user) {
        setIsLoading(false);
        setErrorMessage('No business account found with this email. You can register a new account or pick a sample persona below.');
        return;
      }

      if (user.status === 'suspended') {
        setIsLoading(false);
        setErrorMessage('This business account has been suspended. Please contact account support.');
        return;
      }

      // STRICT USER/ADMIN SEPARATION: Block admin from signing in on user platform
      if (isPlatformAdmin(user)) {
        setIsLoading(false);
        setErrorMessage('Access Prohibited: Administrator accounts cannot sign into the customer business platform. For security and privacy, founders and system administrators must use the internal admin platform.');
        StorageService.logAuditEvent({
          actorId: user.id,
          actorName: user.name,
          actorEmail: user.email,
          actorRole: user.role,
          action: 'PORTAL_ACCESS_BLOCKED_ADMIN_INTO_USER',
          targetType: 'system',
          targetId: 'user_auth_modal',
          details: `Admin ${user.email} attempted to sign into the User platform. Blocked by isolation policy.`,
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
        details: `Business user ${updatedUser.name} authenticated into ${updatedUser.businessName || 'store workspace'}.`,
        ipAddress: '102.89.44.18 (Nigeria)',
        status: 'success',
      });

      setIsLoading(false);
      onLoginSuccess(updatedUser, `Welcome back, ${updatedUser.name}`);
    }, 350);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regEmail || !regPassword || !regBusinessName) {
      setErrorMessage('Please fill in all required business and owner details.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const businesses = StorageService.getBusinesses();
      const users = StorageService.getUsers();

      // Check for duplicate email
      if (users.some((u) => u.email.toLowerCase() === regEmail.trim().toLowerCase())) {
        setIsLoading(false);
        setErrorMessage('An account with this email address is already registered. Please sign in instead.');
        return;
      }

      const newBizId = `biz_${Date.now().toString(36)}`;
      const newStoreId = `store_${Date.now().toString(36)}`;
      const newUserId = `user_${Date.now().toString(36)}`;

      const newStore = {
        id: newStoreId,
        businessId: newBizId,
        name: regStoreName || 'Main Store',
        location: regStoreLocation || 'Lagos, Nigeria',
        isMainStore: true,
      };

      const newBusiness = {
        id: newBizId,
        name: regBusinessName,
        businessType: regBusinessType,
        optedInApi: false,
        currency: '₦',
        apiKey: `iip_live_${Math.random().toString(36).substring(2, 14)}`,
        stores: [newStore],
        createdAt: new Date().toISOString(),
      };

      // NEWLY REGISTERED USERS ARE ALWAYS ASSIGNED 'business_owner' (NEVER ADMIN!)
      const newUser: User = {
        id: newUserId,
        name: regFullName,
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
        details: `Registered new ${regBusinessType} enterprise: "${newBusiness.name}". Default role: business_owner.`,
        ipAddress: '102.89.44.18 (Nigeria)',
        status: 'success',
      });

      setIsLoading(false);
      onLoginSuccess(newUser, `Welcome to your new store workspace, ${newBusiness.name}!`);
    }, 450);
  };

  const handleSelectDemoPersona = (persona: User) => {
    setIsLoading(true);
    setTimeout(() => {
      const updatedUser: User = {
        ...persona,
        lastLoginAt: new Date().toISOString(),
        token: generateSessionToken(persona.id, persona.role),
      };
      StorageService.setCurrentUser(updatedUser);
      setIsLoading(false);
      onLoginSuccess(updatedUser, `Welcome back, ${updatedUser.name}`);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 space-y-5 text-slate-900 dark:text-slate-100">
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Customer Business Platform
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            {tab === 'signin'
              ? 'Sign In to Your Business'
              : tab === 'register'
              ? 'Onboard a New Business'
              : 'Sample Business Personas'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {tab === 'signin'
              ? 'Access your inventory ledger, confidence metrics, and action center.'
              : tab === 'register'
              ? 'Setup opening stock, branch stores, and multi-user access.'
              : 'Test different team roles and permission capabilities instantly.'}
          </p>
        </div>

        {/* Navigation Tabs inside Modal */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMessage(null);
            }}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              tab === 'signin'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMessage(null);
            }}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              tab === 'register'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Register Business
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('demo');
              setErrorMessage(null);
            }}
            className={`pb-2 px-3 border-b-2 transition-colors flex items-center gap-1 ${
              tab === 'demo'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Sample Personas
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="amaka@medixcare.ng"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-0"
                />
                <span>Remember on this device</span>
              </label>
              <span className="text-[11px]">256-bit encrypted</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating Account...</span>
              ) : (
                <>
                  <span>Sign In to Store Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">
                Want to test immediately?{' '}
                <button
                  type="button"
                  onClick={() => setTab('demo')}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold underline"
                >
                  Pick a sample business persona
                </button>
              </span>
            </div>
          </form>
        )}

        {/* 2. REGISTRATION FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Business Legal Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={regBusinessName}
                  onChange={(e) => setRegBusinessName(e.target.value)}
                  placeholder="e.g. Apex Health Pharmacy Ltd."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Business Vertical Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRegBusinessType('pharmacy')}
                  className={`p-2.5 rounded-lg border text-center transition-colors ${
                    regBusinessType === 'pharmacy'
                      ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Pill className="w-4 h-4 mx-auto mb-1" />
                  <div className="text-xs">Pharmacy</div>
                  <div className="text-[9px] text-slate-500">Batch & Expiry</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegBusinessType('supermarket')}
                  className={`p-2.5 rounded-lg border text-center transition-colors ${
                    regBusinessType === 'supermarket'
                      ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 mx-auto mb-1" />
                  <div className="text-xs">Supermarket</div>
                  <div className="text-[9px] text-slate-500">Dead Capital</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegBusinessType('general_retail')}
                  className={`p-2.5 rounded-lg border text-center transition-colors ${
                    regBusinessType === 'general_retail'
                      ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Store className="w-4 h-4 mx-auto mb-1" />
                  <div className="text-xs">Retail Store</div>
                  <div className="text-[9px] text-slate-500">Fast Counts</div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  First Branch Name
                </label>
                <input
                  type="text"
                  required
                  value={regStoreName}
                  onChange={(e) => setRegStoreName(e.target.value)}
                  placeholder="Ikeja Outlet"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Location / City
                </label>
                <input
                  type="text"
                  required
                  value={regStoreLocation}
                  onChange={(e) => setRegStoreLocation(e.target.value)}
                  placeholder="Lagos, Nigeria"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Owner Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Dr. Amaka Okafor"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Owner Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="amaka@business.ng"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating Business Ledger...' : 'Complete Business Setup'}
            </button>
          </form>
        )}

        {/* 3. DEMO BUSINESS PERSONAS */}
        {tab === 'demo' && (
          <div className="space-y-3">
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {businessPersonas.map((persona) => {
                const info = ROLE_INFO[persona.role];
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => handleSelectDemoPersona(persona)}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {persona.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {persona.businessName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Role: <span className="font-semibold">{info.title}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
