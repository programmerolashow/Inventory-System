import React, { useState } from 'react';
import { User, Business } from './types';
import { StorageService } from './lib/storage';
import { isPlatformAdmin } from './lib/rbac';
import { AuthPage } from './components/auth/AuthPage';
import { Navbar } from './components/layout/Navbar';
import { PrimaryUserDashboard } from './components/dashboard/PrimaryUserDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';

export default function App() {
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

  // Current selected store ID (Primary Users only)
  const [currentStoreId, setCurrentStoreId] = useState<string>(() => {
    if (currentUser?.businessId) {
      const biz = StorageService.getBusinesses().find((b) => b.id === currentUser.businessId);
      return biz?.stores[0]?.id || 'store_default';
    }
    return 'store_medix_vi';
  });

  // Refresh data trigger
  const handleDataMutated = () => {
    setBusinesses(StorageService.getBusinesses());
    setAllUsers(StorageService.getUsers());
    setAuditLogs(StorageService.getAuditLogs());
    setApiQueryLogs(StorageService.getApiQueryLogs());
    const refreshedUser = StorageService.getCurrentUser();
    if (refreshedUser) setCurrentUser(refreshedUser);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (!isPlatformAdmin(user) && user.businessId) {
      const biz = StorageService.getBusinesses().find((b) => b.id === user.businessId);
      if (biz && biz.stores.length > 0) {
        setCurrentStoreId(biz.stores[0].id);
      }
    }
    handleDataMutated();
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

  // If unauthenticated, show the Authentication Page
  if (!currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = isPlatformAdmin(currentUser);

  // Find business for primary user
  const currentBusiness =
    businesses.find((b) => b.id === currentUser.businessId) || businesses[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation with strict domain isolation */}
      <Navbar
        currentUser={currentUser}
        businesses={businesses}
        currentStoreId={currentStoreId}
        onStoreChange={(newStoreId) => setCurrentStoreId(newStoreId)}
        onUserSwitch={handleUserSwitch}
        onLogout={handleLogout}
        onRefreshData={handleDataMutated}
      />

      {/* Main Dashboard Canvas: Strict Mutual Exclusion */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isAdmin ? (
          // Admins ONLY have access to the Admin Dashboard (zero access to tenant operational tools)
          <AdminDashboard
            currentUser={currentUser}
            businesses={businesses}
            allUsers={allUsers}
            auditLogs={auditLogs}
            apiQueryLogs={apiQueryLogs}
            onDataMutated={handleDataMutated}
          />
        ) : (
          // Primary Users ONLY have access to the Business Dashboard (zero access to admin console)
          <PrimaryUserDashboard
            currentUser={currentUser}
            business={currentBusiness}
            currentStoreId={currentStoreId}
            allUsers={allUsers}
            onDataMutated={handleDataMutated}
          />
        )}
      </main>

      {/* Persistent Status Bar */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur py-3 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isAdmin ? 'bg-purple-400' : 'bg-emerald-400'
              }`}
            />
            <span>
              {isAdmin
                ? 'Platform Security & Audit Watchdog Active • Zero Tenant Data Exposure'
                : 'Event Ledger Active • Deterministic Arithmetic • Zero Silent AI Overwrite'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span>Domain: {isAdmin ? 'Platform Administration' : 'Business Store Tenant'}</span>
            <span>•</span>
            <span className="text-slate-400">{currentUser.email}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
