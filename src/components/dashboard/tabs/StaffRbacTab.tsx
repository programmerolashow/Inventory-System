import React, { useState } from 'react';
import {
  Users,
  Shield,
  UserPlus,
  Store,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Plus,
} from 'lucide-react';
import { Business, Store as StoreType, User, UserRole } from '../../../types';
import { ROLE_INFO, ROLE_PERMISSIONS, hasPermission } from '../../../lib/rbac';

interface StaffRbacTabProps {
  business: Business;
  users: User[];
  currentUser: User;
  onInviteStaff: (name: string, email: string, role: UserRole) => void;
  onAddStore: (name: string, location: string) => void;
}

export const StaffRbacTab: React.FC<StaffRbacTabProps> = ({
  business,
  users,
  currentUser,
  onInviteStaff,
  onAddStore,
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);

  // Invite states
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('inventory_manager');

  // Store states
  const [storeName, setStoreName] = useState('');
  const [storeLocation, setStoreLocation] = useState('');

  const canManageStaff = hasPermission(currentUser, 'staff:manage');
  const businessStaff = users.filter((u) => u.businessId === business.id);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    onInviteStaff(inviteName, inviteEmail, inviteRole);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
  };

  const handleStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !storeLocation) return;
    onAddStore(storeName, storeLocation);
    setShowStoreModal(false);
    setStoreName('');
    setStoreLocation('');
  };

  return (
    <div className="space-y-6">
      {/* RBAC Header */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-950 dark:text-white">Staff Team & Role-Based Access Control</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Control granular privileges for Store Managers, Cashiers/Attendants, and External Auditors.
          </p>
        </div>

        {canManageStaff && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowStoreModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              Add Branch Store
            </button>
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite Staff Member
            </button>
          </div>
        )}
      </div>

      {/* Stores Section (Multi-Branch Support - PRD 12.3) */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
          Store Locations & Branches ({business.stores.length})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {business.stores.map((store) => (
            <div
              key={store.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white">{store.name}</div>
                {store.isMainStore && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    MAIN HQ
                  </span>
                )}
              </div>
              <div className="text-slate-400 text-[11px]">{store.location}</div>
              <div className="text-slate-500 text-[10px] font-mono">Store ID: {store.id}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Active Team Members ({businessStaff.length})
        </h4>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-colors">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-4">Role Capabilities</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {businessStaff.map((u) => {
                const info = ROLE_INFO[u.role];
                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${info.badgeColor}`}
                      >
                        {info.title}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {info.description}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">
                      {new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleInviteSubmit}
            className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xl text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-950 dark:text-white">Invite New Staff Member</h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Samuel Okon"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="samuel@medixcare.ng"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="inventory_manager">Inventory Manager (Receiving, Counting, Actions)</option>
                  <option value="store_attendant">Store Attendant (Floor sales & quick counts)</option>
                  <option value="auditor">Auditor (Read-only ledger & variance inspector)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl font-semibold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
              >
                Send RBAC Invite
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Store Modal */}
      {showStoreModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleStoreSubmit}
            className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xl text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-950 dark:text-white">Add Store / Outlet Branch</h3>
              <button
                type="button"
                onClick={() => setShowStoreModal(false)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Branch Store Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Lekki Phase 1 Branch"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Physical Address / City</label>
                <input
                  type="text"
                  required
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                  placeholder="e.g. Admiralty Way, Lekki Phase 1, Lagos"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowStoreModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl font-semibold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
              >
                Create Branch Location
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
