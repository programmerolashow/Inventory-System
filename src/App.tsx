import React, { useState, useEffect } from 'react';
import { User, Business } from './types';
import { StorageService } from './lib/storage';
import { isPlatformAdmin } from './lib/rbac';
import { useRouter } from './lib/router';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './components/landing/LandingPage';
import { UserAuthModal } from './components/auth/UserAuthModal';
import { AdminAuthPage } from './components/admin/AdminAuthPage';
import { Navbar } from './components/layout/Navbar';
import { AdminNavbar } from './components/admin/AdminNavbar';
import { PrimaryUserDashboard } from './components/dashboard/PrimaryUserDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import {
  ShieldAlert,
  ArrowRight,
  LogOut,
  CheckCircle2,
  Lock,
  Layers,
  Store,
} from 'lucide-react';

function AppContent() {
  const { currentPath, navigate } = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return StorageService.getCurrentUser();
  });

  const [businesses, setBusinesses] = useState<Business[]>(() => {
    return StorageService.getBusinesses();
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    return StorageService.getUsers();
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    return StorageService.getAuditLogs();
  });

  const [apiQueryLogs, setApiQueryLogs] = useState(() => {
    return StorageService.getApiQueryLogs();
  });

  // User Auth Modal Overlay State (for Landing Page)
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'register'>('signin');

  // Personalized Welcome Toast / Banner
  const [welcomeBanner, setWelcomeBanner] = useState<string | null>(null);

  // Current selected store ID (Primary Users only)
  const [currentStoreId, setCurrentStoreId] = useState<string>(() => {
    if (currentUser?.businessId) {
      const biz = StorageService.getBusinesses().find((b) => b.id === currentUser.businessId);
      return biz?.stores[0]?.id || 'store_default';
    }
    return 'store_medix_vi';
  });

  // Auto-dismiss welcome banner after 8 seconds
  useEffect(() => {
    if (welcomeBanner) {
      const timer = setTimeout(() => setWelcomeBanner(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [welcomeBanner]);

  // Refresh application data
  const handleDataMutated = () => {
    setBusinesses(StorageService.getBusinesses());
    setAllUsers(StorageService.getUsers());
    setAuditLogs(StorageService.getAuditLogs());
    setApiQueryLogs(StorageService.getApiQueryLogs());
    const refreshedUser = StorageService.getCurrentUser();
    if (refreshedUser) setCurrentUser(refreshedUser);
  };

  // User Platform Login Success
  const handleUserLoginSuccess = (user: User, welcomeMsg: string) => {
    setCurrentUser(user);
    if (user.businessId) {
      const biz = StorageService.getBusinesses().find((b) => b.id === user.businessId);
      if (biz && biz.stores.length > 0) {
        setCurrentStoreId(biz.stores[0].id);
      }
    }
    setWelcomeBanner(welcomeMsg);
    setAuthModalOpen(false);
    handleDataMutated();
    navigate('/dashboard');
  };

  // Admin Platform Login Success
  const handleAdminLoginSuccess = (adminUser: User, token: string) => {
    // Save admin user session with token
    const fullUser = StorageService.getUsers().find((u) => u.id === adminUser.id) || {
      ...adminUser,
      token,
      status: 'active' as const,
      permissions: ['*'],
      createdAt: new Date().toISOString(),
    };
    StorageService.setCurrentUser(fullUser as User);
    setCurrentUser(fullUser as User);
    handleDataMutated();
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    if (currentUser) {
      StorageService.logAuditEvent({
        actorId: currentUser.id,
        actorName: currentUser.name,
        actorEmail: currentUser.email,
        actorRole: currentUser.role,
        action: 'USER_LOGOUT',
        targetType: 'user',
        targetId: currentUser.id,
        details: 'User cleanly terminated authenticated session.',
        ipAddress: '102.89.44.18 (Nigeria)',
        status: 'success',
      });
    }
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setWelcomeBanner(null);

    // If logging out from admin platform, return to /admin/auth
    if (currentPath.startsWith('/admin')) {
      navigate('/admin/auth');
    } else {
      navigate('/');
    }
  };

  const handleUserSwitch = (newUser: User) => {
    StorageService.setCurrentUser(newUser);
    setCurrentUser(newUser);
    if (!isPlatformAdmin(newUser) && newUser.businessId) {
      const biz = StorageService.getBusinesses().find((b) => b.id === newUser.businessId);
      if (biz && biz.stores.length > 0) {
        setCurrentStoreId(biz.stores[0].id);
      }
    }
    handleDataMutated();
  };

  // -------------------------------------------------------------
  // ROUTE DISPATCHER WITH STRICT ISOLATION BARRIERS
  // -------------------------------------------------------------

  const isAdminPath = currentPath.startsWith('/admin');
  const isUserLoggedIn = !!currentUser;
  const isCurrentAdmin = currentUser ? isPlatformAdmin(currentUser) : false;

  // Case 1: ADMIN PLATFORM ROUTE (/admin, /admin/auth, /admin/dashboard, /admin/users, /admin/errors)
  if (isAdminPath) {
    // Barrier 1: If logged in as a normal USER, block access to Admin platform
    if (isUserLoggedIn && !isCurrentAdmin) {
      return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-red-300 dark:border-red-900 rounded-xl p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Platform Administrator Access Prohibited
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              You are currently signed in as <strong className="text-slate-900 dark:text-white">{currentUser?.name}</strong> with the business role{' '}
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{currentUser?.role}</span>.
              Customer accounts are strictly segregated from internal administrative infrastructure.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Return to Store Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
              >
                Sign Out & Switch to Admin Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Barrier 2: If NOT logged in as an Admin, show the dedicated Admin Authentication Console
    if (!isUserLoggedIn || !isCurrentAdmin) {
      return (
        <AdminAuthPage
          onAdminLoginSuccess={handleAdminLoginSuccess}
          onNavigateHome={() => navigate('/')}
        />
      );
    }

    // Barrier 3: Authenticated Platform Administrator -> Render Admin Console
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
        {/* Dedicated Admin Navbar */}
        <AdminNavbar
          currentAdmin={currentUser}
          onAdminSwitch={handleUserSwitch}
          onLogout={handleLogout}
          onRefreshData={handleDataMutated}
        />

        {/* Main Admin Console Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdminDashboard
            currentUser={currentUser}
            businesses={businesses}
            allUsers={allUsers}
            auditLogs={auditLogs}
            apiQueryLogs={apiQueryLogs}
            onDataMutated={handleDataMutated}
            currentPath={currentPath}
            onNavigate={navigate}
          />
        </main>

        {/* Admin Footer Status Bar */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 px-4 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              <span>Internal Operations Console • Zero Tenant Operational Exposure • Strict RBAC Boundary</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span>Admin: {currentUser.email}</span>
              <span>•</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold uppercase">{currentUser.role}</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Case 2: USER DASHBOARD ROUTE (/dashboard)
  // -------------------------------------------------------------
  if (currentPath === '/dashboard') {
    // Barrier: If logged in as an ADMIN, block access to customer tenant dashboard
    if (isUserLoggedIn && isCurrentAdmin) {
      return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-900 rounded-xl p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Customer Store Workspace Prohibited
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Platform administrator accounts (<strong className="text-slate-900 dark:text-white">{currentUser?.email}</strong>) are strictly barred from entering customer store workspaces to maintain tenant data confidentiality.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-900 dark:bg-purple-700 hover:bg-slate-800 dark:hover:bg-purple-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Return to Platform Admin Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
              >
                Sign Out Admin Session
              </button>
            </div>
          </div>
        </div>
      );
    }

    // If not logged in, prompt user authentication
    if (!isUserLoggedIn || !currentUser) {
      return (
        <>
          <LandingPage
            onOpenAuth={(mode) => {
              setAuthModalMode(mode);
              setAuthModalOpen(true);
            }}
            currentUser={null}
            onGoToDashboard={() => navigate('/dashboard')}
            onNavigateAdmin={() => navigate('/admin')}
          />
          <UserAuthModal
            isOpen={true}
            initialMode="signin"
            onClose={() => navigate('/')}
            onLoginSuccess={handleUserLoginSuccess}
          />
        </>
      );
    }

    // Authenticated Normal Business User -> Render Business Dashboard
    const currentBusiness =
      businesses.find((b) => b.id === currentUser.businessId) || businesses[0];

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
        {/* Top User Platform Navigation */}
        <Navbar
          currentUser={currentUser}
          businesses={businesses}
          currentStoreId={currentStoreId}
          onStoreChange={(newStoreId) => setCurrentStoreId(newStoreId)}
          onUserSwitch={handleUserSwitch}
          onLogout={handleLogout}
          onRefreshData={handleDataMutated}
          onNavigateLanding={() => navigate('/')}
        />

        {/* Main Dashboard Canvas */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Personalized Welcome Banner */}
          {welcomeBanner && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between text-xs shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold">{welcomeBanner}</span>
                  <span className="text-emerald-700 dark:text-emerald-300 ml-1.5">
                    — Your inventory ledger and verified stock confidence are up to date.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWelcomeBanner(null)}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-white font-semibold text-xs px-2 py-1 rounded"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Business Primary Dashboard */}
          <PrimaryUserDashboard
            currentUser={currentUser}
            business={currentBusiness}
            currentStoreId={currentStoreId}
            allUsers={allUsers}
            onDataMutated={handleDataMutated}
          />
        </main>

        {/* User Footer Status Bar */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 px-4 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                Deterministic Event Ledger Active • Double-Entry Verification • Zero Silent Overwrites
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span>Tenant: {currentBusiness?.name}</span>
              <span>•</span>
              <span className="text-slate-700 dark:text-slate-300">{currentUser.email}</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Case 3: ROOT PUBLIC MARKETING LANDING PAGE (/)
  // -------------------------------------------------------------
  return (
    <>
      <LandingPage
        onOpenAuth={(mode) => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        currentUser={currentUser}
        onGoToDashboard={() => {
          if (isCurrentAdmin) {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        }}
        onNavigateAdmin={() => navigate('/admin')}
      />

      {/* Authentication Modal as an Overlay on top of the Landing Page */}
      <UserAuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleUserLoginSuccess}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
