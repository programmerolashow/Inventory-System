import { Permission, User, UserRole } from '../types';

/**
 * Role-Based Access Control (RBAC) Master Matrix
 * Defines the strict capabilities and boundaries for both Primary Users (Business)
 * and Platform Admin users.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Platform Super Administrator - Platform control only; strictly prohibited from tenant operations
  platform_super_admin: [
    'tenants:read',
    'tenants:manage',
    'users:global_manage',
    'security_logs:read',
    'api_gateway:monitor',
    'system_config:edit',
  ],

  // Platform Compliance & Security Officer - Audit, security, log inspection only
  platform_compliance_officer: [
    'tenants:read',
    'security_logs:read',
    'api_gateway:monitor',
  ],

  // Primary User: Business Owner - Full authority over business, stores, staff, API keys
  business_owner: [
    'inventory:read',
    'inventory:write',
    'product:create',
    'product:edit',
    'batch:manage',
    'import:upload',
    'import:confirm_mapping',
    'ledger:read',
    'ledger:write',
    'verification:start',
    'verification:count',
    'verification:approve_variance',
    'action_center:read',
    'action_center:resolve',
    'sales:create',
    'dispensing:create',
    'staff:manage',
    'store:manage',
    'api_keys:manage',
  ],

  // Primary User: Inventory / Store Manager - Operational management, verification, actions
  inventory_manager: [
    'inventory:read',
    'inventory:write',
    'product:create',
    'product:edit',
    'batch:manage',
    'import:upload',
    'import:confirm_mapping',
    'ledger:read',
    'ledger:write',
    'verification:start',
    'verification:count',
    'verification:approve_variance',
    'action_center:read',
    'action_center:resolve',
    'sales:create',
    'dispensing:create',
  ],

  // Primary User: Store Attendant / Cashier - Fast POS sales entry, dispensing, physical counting
  store_attendant: [
    'inventory:read',
    'sales:create',
    'dispensing:create',
    'verification:count',
  ],

  // Primary User: Auditor / Accountant - Read-only inspection of ledger, inventory, verifications
  auditor: [
    'inventory:read',
    'ledger:read',
    'action_center:read',
  ],
};

export const ROLE_INFO: Record<
  UserRole,
  {
    title: string;
    category: 'platform_admin' | 'primary_user';
    description: string;
    badgeColor: string;
  }
> = {
  platform_super_admin: {
    title: 'Platform Super Admin',
    category: 'platform_admin',
    description: 'System-wide control across all tenants, users, RBAC matrix, and infrastructure',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
  },
  platform_compliance_officer: {
    title: 'Compliance & Security Officer',
    category: 'platform_admin',
    description: 'Read-only security logs, tenant audits, and external API compliance monitoring',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
  },
  business_owner: {
    title: 'Business Owner',
    category: 'primary_user',
    description: 'Full business authority: catalog, stores, staff RBAC, API opt-in, variance approval',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  },
  inventory_manager: {
    title: 'Inventory Manager',
    category: 'primary_user',
    description: 'Receiving, stock reconciliation, Action Center resolution, physical count execution',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  },
  store_attendant: {
    title: 'Store Attendant / Cashier',
    category: 'primary_user',
    description: 'Floor operations: sales intake, prescription dispensing, rapid shelf counts',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  },
  auditor: {
    title: 'Independent Auditor',
    category: 'primary_user',
    description: 'Read-only access to immutable ledger events, stock confidence, and variance history',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
};

/**
 * Checks if a user has a specific granular permission.
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user || user.status === 'suspended') return false;
  return user.permissions.includes(permission);
}

/**
 * Checks if a user can access the Admin Dashboard.
 * Strictly restricted to platform administrators. Primary users are completely blocked.
 */
export function canAccessAdminDashboard(user: User | null): boolean {
  if (!user || user.status === 'suspended') return false;
  return isPlatformAdmin(user);
}

/**
 * Checks if a user can access the Business Operational Dashboard.
 * Strictly restricted to tenant users. Platform admins are blocked for privacy and security.
 */
export function canAccessPrimaryDashboard(user: User | null): boolean {
  if (!user || user.status === 'suspended') return false;
  return !isPlatformAdmin(user);
}

/**
 * Checks if a user has access to a specific business tenant.
 * Admins do not own or manage store-level operational records.
 */
export function canAccessBusiness(user: User | null, businessId: string): boolean {
  if (!user || user.status === 'suspended') return false;
  if (isPlatformAdmin(user)) return false; // Security boundary: Admins do not operate individual tenant stores
  return user.businessId === businessId;
}

/**
 * Checks if a user is an administrative platform role.
 */
export function isPlatformAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'platform_super_admin' || user.role === 'platform_compliance_officer';
}

/**
 * Generates an encrypted session token simulation.
 */
export function generateSessionToken(userId: string, role: UserRole): string {
  const expiry = Date.now() + 24 * 60 * 60 * 1000;
  const raw = `${userId}:${role}:${expiry}:${Math.random().toString(36).substring(2)}`;
  return btoa(raw);
}
