import {
  ActionCard,
  Batch,
  Business,
  LedgerEvent,
  PlatformAuditLog,
  Product,
  Store,
  User,
  VerificationSession,
  ApiQueryLog,
} from '../types';
import { ROLE_PERMISSIONS, generateSessionToken } from './rbac';

const STORAGE_KEY_PREFIX = 'iip_v3_';

// Initial Seed Users
export const SEED_USERS: User[] = [
  {
    id: 'user_admin_01',
    name: 'Olanrewaju Illias',
    email: 'olanrewajuillias@gmail.com',
    role: 'platform_super_admin',
    permissions: ROLE_PERMISSIONS.platform_super_admin,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    token: generateSessionToken('user_admin_01', 'platform_super_admin'),
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'user_admin_02',
    name: 'Amina Mohammed',
    email: 'compliance@inventoryintel.ng',
    role: 'platform_compliance_officer',
    permissions: ROLE_PERMISSIONS.platform_compliance_officer,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    token: generateSessionToken('user_admin_02', 'platform_compliance_officer'),
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    createdAt: '2026-08-15T09:30:00Z',
  },
  {
    id: 'user_biz_01',
    name: 'Dr. Amaka Okafor',
    email: 'amaka@medixcare.ng',
    role: 'business_owner',
    businessId: 'biz_medixcare',
    businessName: 'MedixCare Community Pharmacy',
    storeId: 'store_medix_vi',
    permissions: ROLE_PERMISSIONS.business_owner,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    token: generateSessionToken('user_biz_01', 'business_owner'),
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'user_biz_02',
    name: 'Emmanuel Nwosu',
    email: 'emmanuel@medixcare.ng',
    role: 'inventory_manager',
    businessId: 'biz_medixcare',
    businessName: 'MedixCare Community Pharmacy',
    storeId: 'store_medix_vi',
    permissions: ROLE_PERMISSIONS.inventory_manager,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    token: generateSessionToken('user_biz_02', 'inventory_manager'),
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    createdAt: '2026-08-12T11:00:00Z',
  },
  {
    id: 'user_biz_03',
    name: 'Chinedu Eze',
    email: 'chinedu@medixcare.ng',
    role: 'store_attendant',
    businessId: 'biz_medixcare',
    businessName: 'MedixCare Community Pharmacy',
    storeId: 'store_medix_vi',
    permissions: ROLE_PERMISSIONS.store_attendant,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    token: generateSessionToken('user_biz_03', 'store_attendant'),
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    createdAt: '2026-08-20T14:00:00Z',
  },
  {
    id: 'user_biz_04',
    name: 'Fatima Bello',
    email: 'fatima@auditplus.ng',
    role: 'auditor',
    businessId: 'biz_medixcare',
    businessName: 'MedixCare Community Pharmacy',
    storeId: 'store_medix_vi',
    permissions: ROLE_PERMISSIONS.auditor,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    token: generateSessionToken('user_biz_04', 'auditor'),
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'user_biz_05',
    name: 'Babatunde Adeyemi',
    email: 'babatunde@primemart.ng',
    role: 'business_owner',
    businessId: 'biz_primemart',
    businessName: 'PrimeMart Superstore',
    storeId: 'store_prime_wuse',
    permissions: ROLE_PERMISSIONS.business_owner,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    token: generateSessionToken('user_biz_05', 'business_owner'),
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    createdAt: '2026-08-18T10:00:00Z',
  },
];

// Initial Seed Businesses
export const SEED_BUSINESSES: Business[] = [
  {
    id: 'biz_medixcare',
    name: 'MedixCare Community Pharmacy',
    businessType: 'pharmacy',
    optedInApi: true,
    currency: '₦',
    apiKey: 'iip_live_sec_89df231c6a782e41',
    createdAt: '2026-08-10T10:00:00Z',
    stores: [
      {
        id: 'store_medix_vi',
        businessId: 'biz_medixcare',
        name: 'Victoria Island Flagship',
        location: 'Plot 14, Adeola Odeku St, Victoria Island, Lagos',
        phone: '+234 803 111 2233',
        isMainStore: true,
      },
      {
        id: 'store_medix_ikeja',
        businessId: 'biz_medixcare',
        name: 'Ikeja GRA Branch',
        location: '28 Isaac John St, Ikeja GRA, Lagos',
        phone: '+234 803 444 5566',
        isMainStore: false,
      },
    ],
  },
  {
    id: 'biz_primemart',
    name: 'PrimeMart Superstore',
    businessType: 'supermarket',
    optedInApi: false,
    currency: '₦',
    apiKey: 'iip_live_sec_99ba42110c71fa08',
    createdAt: '2026-08-18T10:00:00Z',
    stores: [
      {
        id: 'store_prime_wuse',
        businessId: 'biz_primemart',
        name: 'Wuse 2 Superstore',
        location: 'Aminu Kano Crescent, Wuse 2, Abuja',
        phone: '+234 809 777 8899',
        isMainStore: true,
      },
    ],
  },
  {
    id: 'biz_alaba',
    name: 'Apex Gadgets & Retail',
    businessType: 'general_retail',
    optedInApi: true,
    currency: '₦',
    apiKey: 'iip_live_sec_55ec198bb409d12a',
    createdAt: '2026-08-25T11:00:00Z',
    stores: [
      {
        id: 'store_alaba_main',
        businessId: 'biz_alaba',
        name: 'Alaba International Plaza',
        location: 'Line 4, Alaba Market, Ojo, Lagos',
        phone: '+234 802 333 4455',
        isMainStore: true,
      },
    ],
  },
];

// Initial Seed Products
export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod_aug_625',
    businessId: 'biz_medixcare',
    canonicalName: 'Augmentin 625mg Tablet (14s)',
    sku: 'MED-AUG-625',
    category: 'Antibiotics',
    unit: 'pack',
    hasBatches: true,
    costPrice: 4200,
    sellingPrice: 5800,
    reorderPoint: 15,
    targetStock: 60,
    currentStock: 18,
    reservedStock: 2,
    sellableStock: 16,
    lastVerifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    aliases: ['Aug tab 625mg', 'Augmentin 625', 'Amox/Clav 625mg tab'],
    createdAt: '2026-08-10T12:00:00Z',
  },
  {
    id: 'prod_amox_500',
    businessId: 'biz_medixcare',
    canonicalName: 'Amoxicillin 500mg Capsules (100s)',
    sku: 'MED-AMX-500',
    category: 'Antibiotics',
    unit: 'pack',
    hasBatches: true,
    costPrice: 2800,
    sellingPrice: 3900,
    reorderPoint: 20,
    targetStock: 80,
    currentStock: 8, // Triggers reorder!
    reservedStock: 0,
    sellableStock: 8,
    lastVerifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    aliases: ['Amox 500mg cap', 'Amoxicillin cap 500mg', 'Amoxil 500'],
    createdAt: '2026-08-10T12:00:00Z',
  },
  {
    id: 'prod_amox_250',
    businessId: 'biz_medixcare',
    canonicalName: 'Amoxicillin 250mg Suspension (100ml)',
    sku: 'MED-AMX-250',
    category: 'Pediatric Antibiotics',
    unit: 'bottle',
    hasBatches: true,
    costPrice: 1400,
    sellingPrice: 2100,
    reorderPoint: 15,
    targetStock: 45,
    currentStock: 32,
    reservedStock: 1,
    sellableStock: 31,
    lastVerifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    aliases: ['Amox Susp 250mg', 'Amoxil Syrup 250mg/5ml'],
    createdAt: '2026-08-10T12:00:00Z',
  },
  {
    id: 'prod_coartem_80',
    businessId: 'biz_medixcare',
    canonicalName: 'Coartem 80/480mg Tablets (6s)',
    sku: 'MED-COA-80',
    category: 'Antimalarials',
    unit: 'pack',
    hasBatches: true,
    costPrice: 2600,
    sellingPrice: 3500,
    reorderPoint: 25,
    targetStock: 100,
    currentStock: 42,
    reservedStock: 0,
    sellableStock: 42,
    lastVerifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    aliases: ['Coartem Forte 80/480', 'Artemether/Lumefantrine 80/480'],
    createdAt: '2026-08-10T12:00:00Z',
  },
  {
    id: 'prod_paracetamol_500',
    businessId: 'biz_medixcare',
    canonicalName: 'Paracetamol 500mg Tablets (96s)',
    sku: 'MED-PCM-500',
    category: 'Analgesics',
    unit: 'pack',
    hasBatches: true,
    costPrice: 650,
    sellingPrice: 1100,
    reorderPoint: 30,
    targetStock: 150,
    currentStock: 95,
    reservedStock: 0,
    sellableStock: 95,
    lastVerifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    aliases: ['PCM 500mg tab', 'Panadol 500mg 96s', 'Emzor Paracetamol'],
    createdAt: '2026-08-10T12:00:00Z',
  },
  {
    id: 'prod_ventolin_inhaler',
    businessId: 'biz_medixcare',
    canonicalName: 'Ventolin Inhaler 100mcg (200 doses)',
    sku: 'MED-VEN-100',
    category: 'Respiratory',
    unit: 'piece',
    hasBatches: true,
    costPrice: 4800,
    sellingPrice: 6500,
    reorderPoint: 10,
    targetStock: 35,
    currentStock: 4, // Critical stockout warning
    reservedStock: 1,
    sellableStock: 3,
    lastVerifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    aliases: ['Salbutamol Inhaler 100mcg', 'Ventolin CFC-free Inhaler'],
    createdAt: '2026-08-10T12:00:00Z',
  },
  {
    id: 'prod_vitc_1000',
    businessId: 'biz_medixcare',
    canonicalName: 'Redoxon Vitamin C 1000mg Effervescent (15s)',
    sku: 'MED-VIT-1000',
    category: 'Supplements',
    unit: 'tube',
    hasBatches: true,
    costPrice: 3200,
    sellingPrice: 4500,
    reorderPoint: 12,
    targetStock: 50,
    currentStock: 45, // Dead capital candidate
    reservedStock: 0,
    sellableStock: 45,
    lastVerifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    aliases: ['Vit C Effervescent 1000mg', 'Redoxon Orange 15s'],
    createdAt: '2026-08-10T12:00:00Z',
  },
];

// Initial Seed Batches
export const SEED_BATCHES: Batch[] = [
  {
    id: 'batch_aug_01',
    productId: 'prod_aug_625',
    batchNumber: 'BN-AUG-2024-X8',
    expiryDate: '2026-10-25', // 28 days left! Critical expiry
    quantity: 12,
    receivedAt: '2026-05-10T10:00:00Z',
  },
  {
    id: 'batch_aug_02',
    productId: 'prod_aug_625',
    batchNumber: 'BN-AUG-2025-Y1',
    expiryDate: '2027-04-30',
    quantity: 6,
    receivedAt: '2026-08-14T11:00:00Z',
  },
  {
    id: 'batch_amox_01',
    productId: 'prod_amox_500',
    batchNumber: 'BN-AMX-8802',
    expiryDate: '2026-11-15', // ~48 days left
    quantity: 8,
    receivedAt: '2026-06-01T09:00:00Z',
  },
  {
    id: 'batch_coartem_01',
    productId: 'prod_coartem_80',
    batchNumber: 'BN-COA-9921',
    expiryDate: '2027-08-30',
    quantity: 42,
    receivedAt: '2026-08-01T14:00:00Z',
  },
];

// Initial Seed Ledger Events
export const SEED_LEDGER_EVENTS: LedgerEvent[] = [
  {
    id: 'ev_001',
    businessId: 'biz_medixcare',
    storeId: 'store_medix_vi',
    storeName: 'Victoria Island Flagship',
    productId: 'prod_aug_625',
    productName: 'Augmentin 625mg Tablet (14s)',
    batchId: 'batch_aug_01',
    batchNumber: 'BN-AUG-2024-X8',
    type: 'RECEIVE',
    quantity: 50,
    unitCost: 4200,
    sourceFile: 'waybill_glaxosmithkline_aug2026.csv',
    createdBy: 'user_biz_02',
    createdByName: 'Emmanuel Nwosu',
    createdByRole: 'inventory_manager',
    reason: 'Opening stock shipment from GSK distributor',
    occurredAt: '2026-08-10T14:30:00Z',
  },
  {
    id: 'ev_002',
    businessId: 'biz_medixcare',
    storeId: 'store_medix_vi',
    storeName: 'Victoria Island Flagship',
    productId: 'prod_aug_625',
    productName: 'Augmentin 625mg Tablet (14s)',
    type: 'SALE',
    quantity: -15,
    unitCost: 4200,
    createdBy: 'user_biz_03',
    createdByName: 'Chinedu Eze',
    createdByRole: 'store_attendant',
    reason: 'Prescription dispensing RX-10928 to Outpatient',
    occurredAt: '2026-09-20T11:15:00Z',
  },
  {
    id: 'ev_003',
    businessId: 'biz_medixcare',
    storeId: 'store_medix_vi',
    storeName: 'Victoria Island Flagship',
    productId: 'prod_aug_625',
    productName: 'Augmentin 625mg Tablet (14s)',
    type: 'SALE',
    quantity: -17,
    unitCost: 4200,
    createdBy: 'user_biz_03',
    createdByName: 'Chinedu Eze',
    createdByRole: 'store_attendant',
    reason: 'Prescription sales batch #4401',
    occurredAt: '2026-09-24T16:45:00Z',
  },
  {
    id: 'ev_004',
    businessId: 'biz_medixcare',
    storeId: 'store_medix_vi',
    storeName: 'Victoria Island Flagship',
    productId: 'prod_amox_500',
    productName: 'Amoxicillin 500mg Capsules (100s)',
    type: 'RECEIVE',
    quantity: 40,
    unitCost: 2800,
    sourceFile: 'intake_emzor_pharma_sep.xlsx',
    createdBy: 'user_biz_02',
    createdByName: 'Emmanuel Nwosu',
    createdByRole: 'inventory_manager',
    reason: 'Direct replenishment delivery',
    occurredAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'ev_005',
    businessId: 'biz_medixcare',
    storeId: 'store_medix_vi',
    storeName: 'Victoria Island Flagship',
    productId: 'prod_amox_500',
    productName: 'Amoxicillin 500mg Capsules (100s)',
    type: 'SALE',
    quantity: -32,
    unitCost: 2800,
    createdBy: 'user_biz_03',
    createdByName: 'Chinedu Eze',
    createdByRole: 'store_attendant',
    reason: 'Counter dispensing',
    occurredAt: '2026-09-25T15:20:00Z',
  },
  {
    id: 'ev_006',
    businessId: 'biz_medixcare',
    storeId: 'store_medix_vi',
    storeName: 'Victoria Island Flagship',
    productId: 'prod_ventolin_inhaler',
    productName: 'Ventolin Inhaler 100mcg (200 doses)',
    type: 'DAMAGE',
    quantity: -2,
    unitCost: 4800,
    createdBy: 'user_biz_02',
    createdByName: 'Emmanuel Nwosu',
    createdByRole: 'inventory_manager',
    reason: 'Canister cracked during shelf reorganization; logged as write-off',
    occurredAt: '2026-09-26T09:10:00Z',
  },
];

// Initial Seed Verification Sessions
export const SEED_VERIFICATIONS: VerificationSession[] = [
  {
    id: 'ver_sess_01',
    businessId: 'biz_medixcare',
    storeId: 'store_medix_vi',
    storeName: 'Victoria Island Flagship',
    startedAt: '2026-09-25T14:00:00Z',
    completedAt: '2026-09-25T15:30:00Z',
    startedBy: 'user_biz_02',
    startedByName: 'Emmanuel Nwosu',
    status: 'completed',
    totalExpectedUnits: 154,
    totalCountedUnits: 147,
    netVarianceUnits: -7,
    netVarianceValue: -29400,
    lines: [
      {
        id: 'vline_01',
        productId: 'prod_aug_625',
        productName: 'Augmentin 625mg Tablet (14s)',
        sku: 'MED-AUG-625',
        expectedQty: 20,
        countedQty: 18,
        variance: -2,
        unitCost: 4200,
        varianceValue: -8400,
        reason: 'Unrecorded sale during evening rush shift',
        notes: 'Pharmacist on duty recalled emergency dispensing without terminal receipt',
        status: 'adjusted',
      },
      {
        id: 'vline_02',
        productId: 'prod_amox_500',
        productName: 'Amoxicillin 500mg Capsules (100s)',
        sku: 'MED-AMX-500',
        expectedQty: 13,
        countedQty: 8,
        variance: -5,
        unitCost: 2800,
        varianceValue: -14000,
        reason: 'Theft / unexplained loss',
        notes: 'Blister strip missing from shelf box B2',
        status: 'flagged',
      },
      {
        id: 'vline_03',
        productId: 'prod_coartem_80',
        productName: 'Coartem 80/480mg Tablets (6s)',
        sku: 'MED-COA-80',
        expectedQty: 42,
        countedQty: 42,
        variance: 0,
        unitCost: 2600,
        varianceValue: 0,
        status: 'adjusted',
      },
    ],
  },
];

// Initial Platform Audit Logs
export const SEED_AUDIT_LOGS: PlatformAuditLog[] = [
  {
    id: 'log_sec_001',
    timestamp: '2026-09-27T22:30:12Z',
    actorId: 'user_admin_01',
    actorName: 'Olanrewaju Illias',
    actorEmail: 'olanrewajuillias@gmail.com',
    actorRole: 'platform_super_admin',
    action: 'PLATFORM_LOGIN_SUCCESS',
    targetType: 'system',
    targetId: 'admin_session_auth',
    details: 'Super Admin login authenticated with hardware MFA simulation',
    ipAddress: '102.89.44.18 (Lagos, Nigeria)',
    status: 'success',
  },
  {
    id: 'log_sec_002',
    timestamp: '2026-09-27T21:14:05Z',
    actorId: 'user_biz_01',
    actorName: 'Dr. Amaka Okafor',
    actorEmail: 'amaka@medixcare.ng',
    actorRole: 'business_owner',
    action: 'API_OPT_IN_ENABLED',
    targetType: 'business',
    targetId: 'biz_medixcare',
    details: 'Enabled External Inventory Availability API sharing with verified partner MediSwitch',
    ipAddress: '105.112.98.42 (Lagos, Nigeria)',
    status: 'success',
  },
  {
    id: 'log_sec_003',
    timestamp: '2026-09-27T19:40:22Z',
    actorId: 'user_biz_02',
    actorName: 'Emmanuel Nwosu',
    actorEmail: 'emmanuel@medixcare.ng',
    actorRole: 'inventory_manager',
    action: 'LEDGER_ADJUSTMENT_POSTED',
    targetType: 'ledger',
    targetId: 'ver_sess_01',
    details: 'Reconciliation adjustment posted for Augmentin 625mg: -2 units (reason: unrecorded sale)',
    ipAddress: '105.112.98.42 (Lagos, Nigeria)',
    status: 'warning',
  },
  {
    id: 'log_sec_004',
    timestamp: '2026-09-27T18:05:49Z',
    actorId: 'anonymous_intruder',
    actorName: 'Unauthorized Client',
    actorEmail: 'unknown@external.net',
    actorRole: 'store_attendant',
    action: 'API_AUTH_FAILURE',
    targetType: 'api_key',
    targetId: 'api_query_fail',
    details: 'Query attempt with revoked token to /api/v1/inventory rejected (401 Unauthorized)',
    ipAddress: '41.203.77.12 (Abuja, Nigeria)',
    status: 'error',
  },
];

// Initial Seed API Query Logs (Simulating MediSwitch and partner calls)
export const SEED_API_QUERY_LOGS: ApiQueryLog[] = [
  {
    id: 'api_call_001',
    timestamp: '2026-09-27T23:12:44Z',
    partnerName: 'MediSwitch Health Platform',
    endpoint: '/api/v1/availability?sku=MED-AUG-625&store=store_medix_vi',
    sku: 'MED-AUG-625',
    storeId: 'store_medix_vi',
    statusCode: 200,
    latencyMs: 38,
    responseSummary: 'sellable_qty: 16, confidence: 85 (verified)',
  },
  {
    id: 'api_call_002',
    timestamp: '2026-09-27T22:50:11Z',
    partnerName: 'MediSwitch Health Platform',
    endpoint: '/api/v1/availability?sku=MED-COA-80&store=store_medix_vi',
    sku: 'MED-COA-80',
    storeId: 'store_medix_vi',
    statusCode: 200,
    latencyMs: 42,
    responseSummary: 'sellable_qty: 42, confidence: 92 (verified)',
  },
  {
    id: 'api_call_003',
    timestamp: '2026-09-27T21:20:00Z',
    partnerName: 'CareFinder Mobile',
    endpoint: '/api/v1/availability?sku=MED-VEN-100&store=store_medix_vi',
    sku: 'MED-VEN-100',
    storeId: 'store_medix_vi',
    statusCode: 200,
    latencyMs: 45,
    responseSummary: 'sellable_qty: 3, confidence: 45 (suspected_discrepancy)',
  },
];

// Helper to load or initialize state
export class StorageService {
  static getUsers(): User[] {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    if (!data) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_USERS;
    }
  }

  static saveUsers(users: User[]) {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }

  static getBusinesses(): Business[] {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}businesses`);
    if (!data) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}businesses`, JSON.stringify(SEED_BUSINESSES));
      return SEED_BUSINESSES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_BUSINESSES;
    }
  }

  static saveBusinesses(businesses: Business[]) {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}businesses`, JSON.stringify(businesses));
  }

  static getProducts(businessId?: string): Product[] {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}products`);
    let products: Product[] = [];
    if (!data) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}products`, JSON.stringify(SEED_PRODUCTS));
      products = SEED_PRODUCTS;
    } else {
      try {
        products = JSON.parse(data);
      } catch {
        products = SEED_PRODUCTS;
      }
    }
    if (businessId) {
      return products.filter((p) => p.businessId === businessId);
    }
    return products;
  }

  static saveProducts(products: Product[]) {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}products`, JSON.stringify(products));
  }

  static getBatches(): Batch[] {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}batches`);
    if (!data) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}batches`, JSON.stringify(SEED_BATCHES));
      return SEED_BATCHES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_BATCHES;
    }
  }

  static saveBatches(batches: Batch[]) {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}batches`, JSON.stringify(batches));
  }

  static getLedgerEvents(businessId?: string): LedgerEvent[] {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}ledger`);
    let events: LedgerEvent[] = [];
    if (!data) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}ledger`, JSON.stringify(SEED_LEDGER_EVENTS));
      events = SEED_LEDGER_EVENTS;
    } else {
      try {
        events = JSON.parse(data);
      } catch {
        events = SEED_LEDGER_EVENTS;
      }
    }
    if (businessId) {
      return events.filter((e) => e.businessId === businessId);
    }
    return events;
  }

  static saveLedgerEvents(events: LedgerEvent[]) {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}ledger`, JSON.stringify(events));
  }

  static getVerifications(businessId?: string): VerificationSession[] {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}verifications`);
    let verifications: VerificationSession[] = [];
    if (!data) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}verifications`, JSON.stringify(SEED_VERIFICATIONS));
      verifications = SEED_VERIFICATIONS;
    } else {
      try {
        verifications = JSON.parse(data);
      } catch {
        verifications = SEED_VERIFICATIONS;
      }
    }
    if (businessId) {
      return verifications.filter((v) => v.businessId === businessId);
    }
    return verifications;
  }

  static saveVerifications(verifications: VerificationSession[]) {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}verifications`, JSON.stringify(verifications));
  }

  static getAuditLogs(): PlatformAuditLog[] {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit_logs`);
    if (!data) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(SEED_AUDIT_LOGS));
      return SEED_AUDIT_LOGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_AUDIT_LOGS;
    }
  }

  static logAuditEvent(log: Omit<PlatformAuditLog, 'id' | 'timestamp'>) {
    const logs = this.getAuditLogs();
    const newLog: PlatformAuditLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(logs.slice(0, 100)));
    return newLog;
  }

  static getApiQueryLogs(): ApiQueryLog[] {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}api_queries`);
    if (!data) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}api_queries`, JSON.stringify(SEED_API_QUERY_LOGS));
      return SEED_API_QUERY_LOGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_API_QUERY_LOGS;
    }
  }

  static logApiQuery(query: Omit<ApiQueryLog, 'id' | 'timestamp'>) {
    const queries = this.getApiQueryLogs();
    const newQuery: ApiQueryLog = {
      ...query,
      id: `query_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    queries.unshift(newQuery);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}api_queries`, JSON.stringify(queries.slice(0, 100)));
    return newQuery;
  }

  static getCurrentUser(): User | null {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user`);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: User | null) {
    if (!user) {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user`);
    } else {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user`, JSON.stringify(user));
    }
  }

  static resetAllData() {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}users`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}businesses`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}products`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}batches`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}ledger`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}verifications`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}audit_logs`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}api_queries`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user`);
  }
}
