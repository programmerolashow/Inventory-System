import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Store,
  LogOut,
  UserCheck,
  ChevronDown,
  Building,
  RefreshCw,
  Lock,
  Zap,
} from 'lucide-react';
import { Business, User } from '../../types';
import { ROLE_INFO, isPlatformAdmin } from '../../lib/rbac';
import { SEED_USERS } from '../../lib/storage';

interface NavbarProps {
  currentUser: User;
  businesses: Business[];
  currentStoreId?: string;
  onStoreChange?: (storeId: string) => void;
  onUserSwitch: (user: User) => void;
  onLogout: () => void;
  onRefreshData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  businesses,
  currentStoreId,
  onStoreChange,
  onUserSwitch,
  onLogout,
  onRefreshData,
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showStoreMenu, setShowStoreMenu] = useState(false);

  const isAdmin = isPlatformAdmin(currentUser);
  const currentBusiness = businesses.find((b) => b.id === currentUser.businessId);
  const currentStore = currentBusiness?.stores.find((s) => s.id === currentStoreId) || currentBusiness?.stores[0];
  const roleInfo = ROLE_INFO[currentUser.role];

  // Strictly partitioned personas: Admins only see Admins; Business users only see Business staff
  const availablePersonas = SEED_USERS.filter((u) =>
    isAdmin ? isPlatformAdmin(u) : !isPlatformAdmin(u)
  );

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b text-white ${
        isAdmin
          ? 'bg-slate-950/95 border-purple-900/60'
          : 'bg-slate-900/95 border-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Branding & Tenant/Admin Identity */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
              isAdmin
                ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-purple-500/20'
                : 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/10'
            }`}
          >
            {isAdmin ? (
              <Shield className="w-5 h-5 text-white" />
            ) : (
              <Layers className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
                {isAdmin ? 'Platform Administration Console' : currentBusiness?.name || 'Business Dashboard'}
              </span>
              <span className="font-bold text-sm tracking-tight text-white sm:hidden">
                {isAdmin ? 'Admin Console' : 'IIP'}
              </span>

              {isAdmin ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Elevated Access
                </span>
              ) : (
                currentBusiness && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {currentBusiness.businessType}
                  </span>
                )
              )}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              {isAdmin ? (
                <span className="text-purple-300/80">
                  Infrastructure & Tenant Oversight • Strict Privacy Boundary
                </span>
              ) : (
                <span>
                  Store: <strong className="text-slate-200">{currentStore?.name || 'Main Branch'}</strong> ({currentStore?.location})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Store Switcher (Primary Users Only; never shown to admins) */}
        {!isAdmin && currentBusiness && currentBusiness.stores.length > 1 && (
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setShowStoreMenu(!showStoreMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition-all"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Switch Branch: <strong className="text-white">{currentStore?.name}</strong>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showStoreMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-1 z-50 text-xs">
                <div className="px-2 py-1.5 text-[10px] uppercase font-semibold text-slate-400">
                  Select Store Location
                </div>
                {currentBusiness.stores.map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => {
                      onStoreChange?.(store.id);
                      setShowStoreMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between ${
                      store.id === currentStore?.id
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{store.name}</div>
                      <div className="text-[10px] text-slate-400">{store.location}</div>
                    </div>
                    {store.isMainStore && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        HQ
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Center: Admin Privacy Badge (Admins Only) */}
        {isAdmin && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/50 text-[11px] text-purple-300">
            <Lock className="w-3 h-3 text-purple-400" />
            <span>Admin Privacy Protocol: Isolated from tenant operational data</span>
          </div>
        )}

        {/* Right Controls: Persona Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {onRefreshData && (
            <button
              type="button"
              onClick={onRefreshData}
              title="Refresh ledger state"
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Persona Switcher Dropdown (Partitioned by User Type) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs text-slate-200 transition-all shadow-sm"
              title="Switch user role in active domain"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-600"
              />
              <div className="text-left hidden lg:block">
                <div className="font-semibold text-xs text-white leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{roleInfo.title}</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border hidden sm:inline-block ${roleInfo.badgeColor}`}>
                {roleInfo.title}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs">
                <div className="p-2.5 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${roleInfo.badgeColor}`}>
                    {currentUser.role}
                  </span>
                </div>

                <div className="px-2 pt-2 pb-1 text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                  <span>{isAdmin ? 'Admin Accounts' : 'Business Team Personas'}</span>
                  <Zap className="w-3 h-3 text-amber-400" />
                </div>

                <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
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
                        className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-slate-800 text-white border border-slate-700'
                            : 'hover:bg-slate-850 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-xs text-white">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{uInfo.title}</div>
                          </div>
                        </div>

                        {isSelected && <UserCheck className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full py-1.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-900/60 text-red-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
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
