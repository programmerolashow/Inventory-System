import React, { useState } from 'react';
import {
  ShoppingCart,
  Pill,
  Trash2,
  CheckCircle2,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import { Product, User } from '../../../types';
import { hasPermission } from '../../../lib/rbac';

interface OutboundTabProps {
  products: Product[];
  currentUser: User;
  businessType: string;
  onRecordSale: (
    productId: string,
    quantity: number,
    sellingPrice: number,
    reason: string,
    prescriptionDetails?: { rxNumber: string; patientName: string; dosage: string }
  ) => void;
  onRecordDamage: (productId: string, quantity: number, reason: string) => void;
}

export const OutboundTab: React.FC<OutboundTabProps> = ({
  products,
  currentUser,
  businessType,
  onRecordSale,
  onRecordDamage,
}) => {
  const [activeMode, setActiveMode] = useState<'sale' | 'dispense' | 'damage'>('sale');

  // Form states
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [saleQty, setSaleQty] = useState('1');
  const [saleNote, setSaleNote] = useState('Walk-in retail customer');

  // Prescription states
  const [rxNumber, setRxNumber] = useState('RX-2026-9901');
  const [patientName, setPatientName] = useState('Adeola Bakare');
  const [dosageInstructions, setDosageInstructions] = useState('1 tablet twice daily for 7 days after meals');

  // Damage states
  const [damageReason, setDamageReason] = useState('Broken seal / bottle leakage during shelf stock');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const canSell = hasPermission(currentUser, 'sales:create');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const qty = parseInt(saleQty, 10) || 1;

    setIsSubmitting(true);
    setSuccessNotice(null);

    setTimeout(() => {
      if (activeMode === 'damage') {
        onRecordDamage(selectedProduct.id, qty, damageReason);
        setSuccessNotice(`Logged write-off: ${qty} ${selectedProduct.unit} of ${selectedProduct.canonicalName}.`);
      } else if (activeMode === 'dispense') {
        onRecordSale(
          selectedProduct.id,
          qty,
          selectedProduct.sellingPrice,
          `Prescription Dispensing #${rxNumber} for ${patientName}`,
          { rxNumber, patientName, dosage: dosageInstructions }
        );
        setSuccessNotice(`Dispensed Rx #${rxNumber}: ${qty} ${selectedProduct.unit} of ${selectedProduct.canonicalName}.`);
      } else {
        onRecordSale(
          selectedProduct.id,
          qty,
          selectedProduct.sellingPrice,
          saleNote || 'Counter sale'
        );
        setSuccessNotice(`Recorded sale: ${qty} ${selectedProduct.unit} of ${selectedProduct.canonicalName}. Total: ₦${(qty * selectedProduct.sellingPrice).toLocaleString()}.`);
      }

      setIsSubmitting(false);
      setSaleQty('1');
    }, 350);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
        <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">Phase 3 — Outbound Movement & Dispensing</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold">
              PRD Section 12.4
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Outbound events immediately post <code className="text-emerald-700 dark:text-emerald-400 font-mono">SALE</code> or{' '}
            <code className="text-red-600 dark:text-red-400 font-mono">DAMAGE</code> ledger records. This ensures
            shrinkage isn't silently absorbing losses with known causes.
          </p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-w-md">
        <button
          type="button"
          onClick={() => {
            setActiveMode('sale');
            setSuccessNotice(null);
          }}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
            activeMode === 'sale'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Standard Sale
        </button>

        {businessType === 'pharmacy' && (
          <button
            type="button"
            onClick={() => {
              setActiveMode('dispense');
              setSuccessNotice(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeMode === 'dispense'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            Rx Dispensing
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setActiveMode('damage');
            setSuccessNotice(null);
          }}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
            activeMode === 'damage'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Damage / Spoilage
        </button>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          {activeMode === 'dispense'
            ? 'Prescription-Driven Dispensing Log'
            : activeMode === 'damage'
            ? 'Structured Damage & Breakage Write-off'
            : 'Point-of-Sale Counter Transaction'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Select Product */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 dark:text-slate-300 font-semibold">Select Catalog Item</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.canonicalName} (Sellable: {p.sellableStock} {p.unit} • ₦{p.sellingPrice.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                Quantity ({selectedProduct?.unit || 'units'})
              </label>
              <input
                type="number"
                min="1"
                max={activeMode !== 'damage' ? selectedProduct?.sellableStock || 999 : 999}
                value={saleQty}
                onChange={(e) => setSaleQty(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">Total Value Impact</label>
              <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                ₦{((parseInt(saleQty, 10) || 0) * (selectedProduct?.sellingPrice || 0)).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Mode-specific Fields */}
          {activeMode === 'dispense' && (
            <div className="space-y-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Clinical Prescription Details
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 text-[10px] mb-1">Prescription Rx Number</label>
                  <input
                    type="text"
                    value={rxNumber}
                    onChange={(e) => setRxNumber(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] mb-1">Dosage Instructions</label>
                <input
                  type="text"
                  value={dosageInstructions}
                  onChange={(e) => setDosageInstructions(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {activeMode === 'damage' && (
            <div className="space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">Reason for Write-Off</label>
              <select
                value={damageReason}
                onChange={(e) => setDamageReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-600"
              >
                <option value="Broken seal / bottle leakage during shelf stock">
                  Broken seal / bottle leakage during shelf stock
                </option>
                <option value="Batch reached expiration date without sale">
                  Batch reached expiration date without sale
                </option>
                <option value="Packaging crushed in transit">Packaging crushed in transit</option>
                <option value="Cold-chain temperature excursion">Cold-chain temperature excursion</option>
              </select>
            </div>
          )}

          {activeMode === 'sale' && (
            <div className="space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">Sale Memo / Receipt Ref</label>
              <input
                type="text"
                value={saleNote}
                onChange={(e) => setSaleNote(e.target.value)}
                placeholder="POS Slip #4401 or walk-in sale"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500">
              Operator: <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong> ({currentUser.role})
            </span>

            <button
              type="submit"
              disabled={isSubmitting || !canSell}
              className={`px-5 py-2.5 rounded-lg font-semibold text-xs text-white transition-colors ${
                activeMode === 'damage'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-sm'
              }`}
            >
              {isSubmitting
                ? 'Posting Event...'
                : activeMode === 'damage'
                ? 'Post DAMAGE Event'
                : 'Commit SALE Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
