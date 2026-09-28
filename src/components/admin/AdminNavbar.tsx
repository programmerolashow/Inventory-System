import React, { useState } from 'react';
import {
  Shield,
  LogOut,
  ChevronDown,
  RefreshCw,
  Zap,
  Server,
  Activity,
  Layers,
} from 'lucide-react';
import { User } from '../../types';
import { ROLE_INFO, isPlatformAdmin } from '../../lib/rbac';
import { SEED_USERS } from '../../lib/storage';
import { ThemeToggle } from '../common/ThemeToggle';

interface AdminNavbarProps {
  currentAdmin: User;
  onAdminSwitch: (user: User) => void;
  onLogout: () => void;
  onRefreshData?: () => void;
  activeAdminTab?: string;
  onSelectAdminTab?: (tab: string) => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  currentAdmin,
  onAdminSwitch,
  onLogout,
  onRefreshData,
  activeAdminTab,
  onSelectAdminTab,
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const roleInfo = ROLE_INFO[currentAdmin.role];

  // Admins ONLY see Admin accounts in persona switcher
  const adminPersonas = SEED_USERS.filter((u) => isPlatformAdmin(u));

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Internal Admin Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-purple-700 text-white flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-slate-950 dark:text-white">
                Platform Administration Console
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                INTERNAL CONSOLE
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>Operational oversight, RBAC permissions, and security monitoring</span>
            </div>
          </div>
        </div>

        {/* Center: System Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
          <Server className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Server Active: Port 3000 • Express Core • Zero Tenant Data Exposure</span>
        </div>

        {/* Right Controls: Theme Toggle & Admin Profile */}
        <div className="flex items-center gap-2.5">
          {onRefreshData && (
            <button
              type="button"
              onClick={onRefreshData}
              title="Refresh platform telemetry"
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Admin Account Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
              title="Switch admin persona"
            >
              <img
                src={currentAdmin.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                alt={currentAdmin.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-300 dark:border-slate-600"
              />
              <div className="text-left hidden lg:block">
                <div className="font-semibold text-xs leading-tight">{currentAdmin.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {roleInfo.title}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50 text-xs">
                <div className="p-2.5 border-b border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-950 dark:text-white">{currentAdmin.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{currentAdmin.email}</div>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleInfo.badgeColor}`}>
                      {roleInfo.title}
                    </span>
                  </div>
                </div>

                <div className="px-2 pt-2 pb-1 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Authorized Administrators</span>
                  <Zap className="w-3 h-3 text-amber-500" />
                </div>

                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {adminPersonas.map((adm) => {
                    const isSelected = adm.id === currentAdmin.id;
                    const admInfo = ROLE_INFO[adm.role];
                    return (
                      <button
                        key={adm.id}
                        type="button"
                        onClick={() => {
                          onAdminSwitch(adm);
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
                            src={adm.avatar}
                            alt={adm.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-xs">{adm.name}</div>
                            <div className="text-[10px] text-slate-500">{admInfo.title}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full py-2 px-3 rounded-lg bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out Admin Session
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
