import React, { useState } from 'react';
import {
  Layers,
  Store,
  LogOut,
  UserCheck,
  ChevronDown,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { Business, User } from '../../types';
import { ROLE_INFO, isPlatformAdmin } from '../../lib/rbac';
import { SEED_USERS } from '../../lib/storage';
import { ThemeToggle } from '../common/ThemeToggle';

interface NavbarProps {
  currentUser: User;
  businesses: Business[];
  currentStoreId?: string;
  onStoreChange?: (storeId: string) => void;
  onUserSwitch: (user: User) => void;
  onLogout: () => void;
  onRefreshData?: () => void;
  onNavigateLanding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  businesses,
  currentStoreId,
  onStoreChange,
  onUserSwitch,
  onLogout,
  onRefreshData,
  onNavigateLanding,
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showStoreMenu, setShowStoreMenu] = useState(false);

  const currentBusiness = businesses.find((b) => b.id === currentUser.businessId);
  const currentStore =
    currentBusiness?.stores.find((s) => s.id === currentStoreId) || currentBusiness?.stores[0];
  const roleInfo = ROLE_INFO[currentUser.role];

  // Strictly business team personas only
  const availablePersonas = SEED_USERS.filter((u) => !isPlatformAdmin(u));

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Branding & Tenant Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Layers className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-slate-950 dark:text-white hidden sm:inline">
                {currentBusiness?.name || 'Store Workspace'}
              </span>
              <span className="font-bold text-sm tracking-tight text-slate-950 dark:text-white sm:hidden">
                {currentBusiness?.name ? currentBusiness.name.slice(0, 14) : 'Store'}
              </span>

              {currentBusiness && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {currentBusiness.businessType}
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>
                Branch: <strong className="text-slate-700 dark:text-slate-200">{currentStore?.name || 'Main Branch'}</strong>{' '}
                ({currentStore?.location || 'Lagos'})
              </span>
            </div>
          </div>
        </div>

        {/* Center: Store Switcher (if business has multiple branches) */}
        {currentBusiness && currentBusiness.stores.length > 1 && (
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setShowStoreMenu(!showStoreMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                Switch Branch: <strong className="text-slate-900 dark:text-white">{currentStore?.name}</strong>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showStoreMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 z-50 text-xs">
                <div className="px-2 py-1.5 text-[10px] uppercase font-semibold text-slate-400">
                  Select Store Branch
                </div>
                {currentBusiness.stores.map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => {
                      onStoreChange?.(store.id);
                      setShowStoreMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      store.id === currentStore?.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{store.name}</div>
                      <div className="text-[10px] text-slate-500">{store.location}</div>
                    </div>
                    {store.isMainStore && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        HQ
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Controls: Refresh, Theme Toggle, Persona Switcher */}
        <div className="flex items-center gap-2.5">
          {onRefreshData && (
            <button
              type="button"
              onClick={onRefreshData}
              title="Refresh ledger state"
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 transition-colors shadow-sm"
              title="Switch user role in active store"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-300 dark:border-slate-600"
              />
              <div className="text-left hidden lg:block">
                <div className="font-semibold text-xs leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {roleInfo.title}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50 text-xs">
                <div className="p-2.5 border-b border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-950 dark:text-white">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser.email}</div>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleInfo.badgeColor}`}>
                      {roleInfo.title}
                    </span>
                  </div>
                </div>

                <div className="px-2 pt-2 pb-1 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Store Team Personas</span>
                  <Zap className="w-3 h-3 text-amber-500" />
                </div>

                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {availablePersonas.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    const uInfo = ROLE_INFO[u.role];
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          onUserSwitch(u);
                          setShowPersonaMenu(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-medium'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-xs">{u.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {u.businessName} • {uInfo.title}
                            </div>
                          </div>
                        </div>

                        {isSelected && <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  {onNavigateLanding && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowPersonaMenu(false);
                        onNavigateLanding();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-left transition-colors"
                    >
                      View Public Platform Overview
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full py-2 px-3 rounded-lg bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
