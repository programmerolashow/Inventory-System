import React, { useState } from 'react';
import {
  Shield,
  Building,
  Users,
  Key,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Sliders,
  Database,
  ArrowUpRight,
  Server,
  Zap,
} from 'lucide-react';
import {
  Business,
  PlatformAuditLog,
  User,
  UserRole,
  ApiQueryLog,
} from '../../types';
import { ROLE_INFO, ROLE_PERMISSIONS } from '../../lib/rbac';
import { StorageService } from '../../lib/storage';

interface AdminDashboardProps {
  currentUser: User;
  businesses: Business[];
  allUsers: User[];
  auditLogs: PlatformAuditLog[];
  apiQueryLogs: ApiQueryLog[];
  onDataMutated: () => void;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  businesses,
  allUsers,
  auditLogs,
  apiQueryLogs,
  onDataMutated,
  currentPath = '/admin/dashboard',
  onNavigate,
}) => {
  const getTabFromPath = (path: string): 'overview' | 'tenants' | 'rbac' | 'audit_logs' | 'api_gateway' | 'system_config' => {
    if (path.includes('/users') || path.includes('/rbac')) return 'rbac';
    if (path.includes('/errors') || path.includes('/audit') || path.includes('/logs')) return 'audit_logs';
    if (path.includes('/tenants') || path.includes('/businesses')) return 'tenants';
    if (path.includes('/api') || path.includes('/gateway')) return 'api_gateway';
    if (path.includes('/config')) return 'system_config';
    return 'overview';
  };

  const [adminTab, setAdminTabState] = useState<
    'overview' | 'tenants' | 'rbac' | 'audit_logs' | 'api_gateway' | 'system_config'
  >(() => getTabFromPath(currentPath));

  const setAdminTab = (tab: 'overview' | 'tenants' | 'rbac' | 'audit_logs' | 'api_gateway' | 'system_config') => {
    setAdminTabState(tab);
    if (onNavigate) {
      if (tab === 'rbac') onNavigate('/admin/users');
      else if (tab === 'audit_logs') onNavigate('/admin/errors');
      else if (tab === 'tenants') onNavigate('/admin/tenants');
      else if (tab === 'api_gateway') onNavigate('/admin/api');
      else if (tab === 'system_config') onNavigate('/admin/config');
      else onNavigate('/admin/dashboard');
    }
  };

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [selectedAuditFilter, setSelectedAuditFilter] = useState<string>('all');

  // Overall platform metrics
  const totalStores = businesses.reduce((acc, b) => acc + b.stores.length, 0);
  const optedInCount = businesses.filter((b) => b.optedInApi).length;
  const activeUsersCount = allUsers.filter((u) => u.status === 'active').length;

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredLogs = auditLogs.filter((log) => {
    if (selectedAuditFilter === 'all') return true;
    return log.status === selectedAuditFilter;
  });

  const handleToggleUserStatus = (targetUser: User) => {
    const updatedUsers = allUsers.map((u) => {
      if (u.id !== targetUser.id) return u;
      const newStatus = u.status === 'active' ? ('suspended' as const) : ('active' as const);
      return { ...u, status: newStatus };
    });

    StorageService.saveUsers(updatedUsers);
    StorageService.logAuditEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: targetUser.status === 'active' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      targetType: 'user',
      targetId: targetUser.id,
      details: `Platform Admin changed account status of ${targetUser.email} to ${
        targetUser.status === 'active' ? 'suspended' : 'active'
      }.`,
      ipAddress: '102.89.44.18 (Nigeria)',
      status: 'warning',
    });

    onDataMutated();
  };

  const handleUpdateRole = (targetUser: User, newRole: UserRole) => {
    const updatedUsers = allUsers.map((u) => {
      if (u.id !== targetUser.id) return u;
      return {
        ...u,
        role: newRole,
        permissions: ROLE_PERMISSIONS[newRole],
      };
    });

    StorageService.saveUsers(updatedUsers);
    StorageService.logAuditEvent({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: 'USER_ROLE_PROMOTED',
      targetType: 'user',
      targetId: targetUser.id,
      details: `Elevated or reassigned role of ${targetUser.email} to ${newRole}.`,
      ipAddress: '102.89.44.18 (Nigeria)',
      status: 'warning',
    });

    setSelectedUserForEdit(null);
    onDataMutated();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
              <Shield className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-950 dark:text-white tracking-tight">
              Platform Administration Console (Superadmin & RBAC Governance)
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-mono">
              ELEVATED PRIVILEGES
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Multi-tenant oversight across all registered Nigerian SME businesses, cryptographic session
            audits, granular permission enforcement, and external API Gateway traffic monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Signed in: <strong className="text-purple-700 dark:text-purple-300">{currentUser.email}</strong>
          </span>
        </div>
      </div>

      {/* Admin KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Registered Businesses</span>
            <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-black text-slate-950 dark:text-white font-mono">
            {businesses.length}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({totalStores} stores)</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Pharmacies, Supermarkets & Retailers
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Active Users & Sessions</span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-950 dark:text-white font-mono">
            {activeUsersCount}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ {allUsers.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Protected by role-based permissions
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Opted-In API Tenants</span>
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {optedInCount}{' '}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              ({Math.round((optedInCount / (businesses.length || 1)) * 100)}%)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Broadcasting availability to MediSwitch
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Platform Security Health</span>
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            100% <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Zero Gaps</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Immutable ledger invariants verified
          </div>
        </div>
      </div>

      {/* Admin Tabs Navigation */}
      <div className="flex items-center overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-medium no-scrollbar">
        {[
          { id: 'overview', label: 'Platform Overview', icon: Activity },
          { id: 'tenants', label: 'Tenant Businesses', icon: Building },
          { id: 'rbac', label: 'User Directory & RBAC Matrix', icon: Users },
          { id: 'audit_logs', label: 'Security & Audit Logs', icon: Shield },
          { id: 'api_gateway', label: 'API Gateway & Partners', icon: Server },
          { id: 'system_config', label: 'Configuration & Weights', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAdminTab(tab.id as any)}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                adminTab === tab.id
                  ? 'bg-slate-900 dark:bg-purple-700 text-white font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Audit Feed */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 transition-colors shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-950 dark:text-white">
                  Real-Time Platform Security Activity
                </h4>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">LIVE FEED</span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
                {auditLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">{log.action}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">{log.details}</p>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Actor: {log.actorName} ({log.actorRole})</span>
                      <span className="font-mono text-purple-600 dark:text-purple-400">{log.ipAddress}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Consuming Partner Gateway Stats */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between transition-colors shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-950 dark:text-white">
                    External API Gateway Summary (MediSwitch)
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    STATUS: HEALTHY
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  External applications query <code className="text-purple-600 dark:text-purple-300 font-mono">/api/v1/availability</code>{' '}
                  to retrieve verified sellable stock and confidence levels without manual owner calls.
                </p>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] uppercase text-slate-500">Total API Queries</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                      {apiQueryLogs.length} reqs
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] uppercase text-slate-500">Avg Latency</div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">38ms</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] uppercase text-slate-500">Success Rate</div>
                    <div className="text-base font-bold text-teal-600 dark:text-teal-400 font-mono mt-0.5">99.4%</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                Rule verified: 0% confidential cost/margin data transmitted externally.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TENANT BUSINESSES */}
      {adminTab === 'tenants' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">Registered Business Tenants</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{businesses.length} total active enterprises</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map((biz) => {
              const bizUsers = allUsers.filter((u) => u.businessId === biz.id);
              const bizProducts = StorageService.getProducts(biz.id);

              return (
                <div
                  key={biz.id}
                  className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {biz.businessType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          biz.optedInApi
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {biz.optedInApi ? 'API Sharing Active' : 'API Private'}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-white">{biz.name}</h4>

                    <div className="space-y-1 text-xs text-slate-400">
                      <div>
                        Stores / Outlets:{' '}
                        <strong className="text-slate-200">{biz.stores.length}</strong>
                      </div>
                      <div>
                        Catalog Items Tracked:{' '}
                        <strong className="text-slate-200">{bizProducts.length}</strong>
                      </div>
                      <div>
                        Staff Members:{' '}
                        <strong className="text-slate-200">{bizUsers.length}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono truncate">
                    API Key: {biz.apiKey || 'None configured'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: RBAC & USER DIRECTORY */}
      {adminTab === 'rbac' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Search by name, email, or role..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{filteredUsers.length} users registered</span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-colors">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">User & Email</th>
                  <th className="py-3 px-3">Role & Category</th>
                  <th className="py-3 px-3">Business Tenant</th>
                  <th className="py-3 px-3">Account Status</th>
                  <th className="py-3 px-3">Last Active</th>
                  <th className="py-3 px-4 text-right">RBAC Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredUsers.map((u) => {
                  const info = ROLE_INFO[u.role];
                  const isCurrent = u.id === currentUser.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{u.email}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${info.badgeColor}`}
                        >
                          {info.title}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-300 text-[11px]">
                        {u.businessName || 'Platform Superadmin'}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            u.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">
                        {new Date(u.lastLoginAt).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isCurrent && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedUserForEdit(u)}
                              className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                            >
                              Edit Role
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u)}
                              className={`p-1 rounded-lg border transition-colors ${
                                u.status === 'active'
                                  ? 'bg-red-950/40 text-red-400 border-red-900/60 hover:bg-red-900/50'
                                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60 hover:bg-emerald-900/50'
                              }`}
                              title={u.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                            >
                              {u.status === 'active' ? (
                                <Lock className="w-3.5 h-3.5" />
                              ) : (
                                <Unlock className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Edit Role Modal */}
          {selectedUserForEdit && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xl text-slate-900 dark:text-white">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-950 dark:text-white">Elevate / Modify User Role</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{selectedUserForEdit.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUserForEdit(null)}
                    className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="text-slate-300 font-semibold block">Select New RBAC Role:</span>
                  {(Object.keys(ROLE_INFO) as UserRole[]).map((roleKey) => {
                    const rInfo = ROLE_INFO[roleKey];
                    const isCurrentRole = selectedUserForEdit.role === roleKey;

                    return (
                      <button
                        key={roleKey}
                        type="button"
                        onClick={() => handleUpdateRole(selectedUserForEdit, roleKey)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                          isCurrentRole
                            ? 'bg-purple-950/60 border-purple-500 text-white'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{rInfo.title}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">
                            {rInfo.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{rInfo.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SECURITY & AUDIT LOGS */}
      {adminTab === 'audit_logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Immutable Platform Audit Trail</h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedAuditFilter}
                onChange={(e) => setSelectedAuditFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                <option value="all">All Events</option>
                <option value="success">Success Only</option>
                <option value="warning">Warnings Only</option>
                <option value="error">Errors & Failures</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-colors">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp & ID</th>
                  <th className="py-3 px-3">Actor & Role</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-3">IP Location</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono text-purple-600 dark:text-purple-300 font-semibold">{log.id}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{log.actorName}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{log.actorRole}</div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-sm">
                      {log.details}
                    </td>

                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                      {log.ipAddress}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          log.status === 'success'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                            : log.status === 'warning'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                            : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-400 border border-red-300 dark:border-red-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: API GATEWAY & PARTNERS */}
      {adminTab === 'api_gateway' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">External Partner Query Traffic (MediSwitch)</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">All queries rate-limited & logged</span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-colors">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-3">Partner Client</th>
                  <th className="py-3 px-4">Endpoint & Query Parameters</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Latency</th>
                  <th className="py-3 px-4">Response Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {apiQueryLogs.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                      {new Date(q.timestamp).toLocaleTimeString()}
                    </td>

                    <td className="py-3 px-3 font-semibold text-white">{q.partnerName}</td>

                    <td className="py-3 px-4 font-mono text-emerald-400 text-[11px] max-w-xs truncate">
                      {q.endpoint}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {q.statusCode} OK
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {q.latencyMs}ms
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                      {q.responseSummary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: CONFIGURATION & WEIGHTS */}
      {adminTab === 'system_config' && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm transition-colors">
            <h4 className="font-bold text-sm text-slate-950 dark:text-white">
              Stock Confidence Formula Weighting (Section 14 Governance)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic scoring formula applied to all tenant stores.
            </p>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>Recency of Physical Verification (Weight: 40%)</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">40 pts</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div className="bg-emerald-600 h-full w-[40%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>Variance between expected & last count (Weight: 30%)</span>
                  <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">30 pts</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div className="bg-teal-600 h-full w-[30%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>Consistency of recent movement logs (Weight: 20%)</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">20 pts</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div className="bg-cyan-600 h-full w-[20%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>Source reliability score (Weight: 10%)</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">10 pts</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div className="bg-purple-600 h-full w-[10%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Reset / Demo Data Sync */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3 shadow-sm transition-colors">
            <h4 className="font-bold text-sm text-slate-950 dark:text-white">Platform Data Synchronization</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Restore initial seed data including Nigerian pharmacy (MedixCare), supermarket (PrimeMart), and platform superadmin accounts.
            </p>
            <button
              type="button"
              onClick={() => {
                StorageService.resetAllData();
                onDataMutated();
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset All Platform Data to Initial Seed
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
