/**
 * Core Data Models & RBAC Types for Inventory Intelligence Platform
 * Aligned with PRD v3.0 (Sections 11-20)
 */

export type BusinessType = 'pharmacy' | 'supermarket' | 'general_retail';

export type UserRole =
  // Primary User roles
  | 'business_owner'
  | 'inventory_manager'
  | 'store_attendant'
  | 'auditor'
  // Platform Admin roles
  | 'platform_super_admin'
  | 'platform_compliance_officer';

export type Permission =
  // Inventory & Catalog
  | 'inventory:read'
  | 'inventory:write'
  | 'product:create'
  | 'product:edit'
  | 'batch:manage'
  // Ingestion & Mapping
  | 'import:upload'
  | 'import:confirm_mapping'
  // Ledger
  | 'ledger:read'
  | 'ledger:write'
  // Verification & Variance
  | 'verification:start'
  | 'verification:count'
  | 'verification:approve_variance'
  // Action Center
  | 'action_center:read'
  | 'action_center:resolve'
  // Outbound / Sales
  | 'sales:create'
  | 'dispensing:create'
  // Business & Staff RBAC
  | 'staff:manage'
  | 'store:manage'
  | 'api_keys:manage'
  // Platform Admin Permissions
  | 'tenants:read'
  | 'tenants:manage'
  | 'users:global_manage'
  | 'security_logs:read'
  | 'api_gateway:monitor'
  | 'system_config:edit';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string; // null for platform admin
  businessName?: string;
  storeId?: string;
  permissions: Permission[];
  status: 'active' | 'suspended';
  avatar?: string;
  token?: string;
  lastLoginAt: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  businessType: BusinessType;
  optedInApi: boolean;
  currency: string; // e.g. '₦'
  apiKey?: string;
  stores: Store[];
  createdAt: string;
}

export interface Store {
  id: string;
  businessId: string;
  name: string;
  location: string;
  phone?: string;
  isMainStore?: boolean;
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  quantity: number;
  receivedAt: string;
}

export interface Product {
  id: string;
  businessId: string;
  canonicalName: string;
  sku: string;
  category: string;
  unit: string; // 'pack', 'box', 'tablet', 'bottle', 'carton', 'piece'
  hasBatches: boolean;
  costPrice: number;
  sellingPrice: number;
  reorderPoint: number;
  targetStock: number;
  currentStock: number;
  reservedStock: number;
  sellableStock: number;
  batches?: Batch[];
  lastVerifiedAt?: string;
  aliases: string[]; // known aliases from messy imports
  createdAt: string;
}

export type MovementType =
  | 'RECEIVE'
  | 'SALE'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'RETURN_IN'
  | 'RETURN_OUT'
  | 'DAMAGE'
  | 'EXPIRY'
  | 'ADJUSTMENT';

export interface LedgerEvent {
  id: string;
  businessId: string;
  storeId: string;
  storeName?: string;
  productId: string;
  productName: string;
  batchId?: string;
  batchNumber?: string;
  type: MovementType;
  quantity: number; // positive or negative based on type
  unitCost?: number;
  sourceFile?: string;
  createdBy: string;
  createdByName: string;
  createdByRole?: UserRole;
  reason?: string;
  occurredAt: string;
}

export type ConfidenceLevel =
  | 'verified'
  | 'partially_verified'
  | 'suspected_discrepancy'
  | 'stale';

export interface StockConfidence {
  score: number; // 0-100
  level: ConfidenceLevel;
  factorBreakdown: {
    recencyScore: number; // 40% weight
    varianceScore: number; // 30% weight
    movementConsistencyScore: number; // 20% weight
    sourceReliabilityScore: number; // 10% weight
  };
  explanation: string;
  lastCalculatedAt: string;
}

export type ActionType =
  | 'reorder'
  | 'dead_capital'
  | 'expiry'
  | 'variance'
  | 'transfer';

export interface ActionCard {
  id: string;
  businessId: string;
  storeId: string;
  productId: string;
  productName: string;
  type: ActionType;
  title: string;
  whatHappened: string;
  whyItMatters: string;
  whatToDo: string;
  evidence: string;
  severity: 'critical' | 'high' | 'medium';
  financialImpact?: number;
  suggestedActionLabel: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface VerificationLine {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  expectedQty: number;
  countedQty: number;
  variance: number; // countedQty - expectedQty
  unitCost: number;
  varianceValue: number;
  reason?: string;
  notes?: string;
  status: 'pending' | 'adjusted' | 'flagged';
}

export interface VerificationSession {
  id: string;
  businessId: string;
  storeId: string;
  storeName: string;
  startedAt: string;
  completedAt?: string;
  startedBy: string;
  startedByName: string;
  status: 'in_progress' | 'completed';
  lines: VerificationLine[];
  totalExpectedUnits: number;
  totalCountedUnits: number;
  netVarianceUnits: number;
  netVarianceValue: number;
}

export interface ColumnMapping {
  rawHeader: string;
  mappedField:
    | 'product_name'
    | 'sku'
    | 'quantity'
    | 'unit_cost'
    | 'selling_price'
    | 'expiry_date'
    | 'batch_number'
    | 'category'
    | 'unit'
    | 'ignore';
  confidence: number; // 0-100%
  sampleValue: string;
}

export interface ProductMatchProposal {
  rawName: string;
  suggestedProductId?: string;
  suggestedProductName?: string;
  confidence: number;
  action: 'auto_merge' | 'manual_review_needed' | 'create_new';
  isHighStakesDosageMismatch?: boolean;
  notes?: string;
}

export interface UploadedFileJob {
  id: string;
  businessId: string;
  storeId: string;
  fileName: string;
  fileType: 'opening_stock' | 'restock' | 'sales';
  uploadedAt: string;
  rowCount: number;
  rawHeaders: string[];
  rawRows: Record<string, string>[];
  proposedMappings: ColumnMapping[];
  proposedMatches: ProductMatchProposal[];
  status: 'pending_mapping' | 'confirmed' | 'rejected';
}

export interface AvailabilitySyncRecord {
  id: string;
  businessId: string;
  businessName: string;
  storeId: string;
  storeName: string;
  productId: string;
  sku: string;
  productName: string;
  sellableQuantity: number;
  confidence: {
    score: number;
    level: ConfidenceLevel;
  };
  lastVerifiedAt: string;
  lastSynchronizedAt: string;
}

export interface PlatformAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  targetType: 'user' | 'business' | 'ledger' | 'api_key' | 'system';
  targetId: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'error';
}

export interface ApiQueryLog {
  id: string;
  timestamp: string;
  partnerName: string;
  endpoint: string;
  sku: string;
  storeId: string;
  statusCode: number;
  latencyMs: number;
  responseSummary: string;
}
