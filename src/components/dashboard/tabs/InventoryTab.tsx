import React, { useState } from 'react';
import {
  Search,
  Filter,
  Package,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  Plus,
  History,
  Info,
} from 'lucide-react';
import { Batch, ConfidenceLevel, LedgerEvent, Product, User } from '../../../types';
import { calculateStockConfidence } from '../../../lib/intelligence';
import { hasPermission } from '../../../lib/rbac';

interface InventoryTabProps {
  products: Product[];
  batches: Batch[];
  ledgerEvents: LedgerEvent[];
  currentUser: User;
  onInitiateCount: (productId: string) => void;
  onAddNewProduct: (productData: Partial<Product>) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  products,
  batches,
  ledgerEvents,
  currentUser,
  onInitiateCount,
  onAddNewProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form states
  const [newCanonicalName, setNewCanonicalName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState('Antibiotics');
  const [newUnit, setNewUnit] = useState('pack');
  const [newCostPrice, setNewCostPrice] = useState('3000');
  const [newSellingPrice, setNewSellingPrice] = useState('4500');
  const [newOpeningStock, setNewOpeningStock] = useState('20');
  const [newReorderPoint, setNewReorderPoint] = useState('10');

  const canEdit = hasPermission(currentUser, 'product:create');

  // Categories
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.canonicalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.aliases.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getConfidenceLevelBadge = (level: ConfidenceLevel) => {
    switch (level) {
      case 'verified':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'partially_verified':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'suspected_discrepancy':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'stale':
        return 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800';
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCanonicalName || !newSku) return;

    onAddNewProduct({
      canonicalName: newCanonicalName,
      sku: newSku,
      category: newCategory,
      unit: newUnit,
      costPrice: parseFloat(newCostPrice) || 0,
      sellingPrice: parseFloat(newSellingPrice) || 0,
      currentStock: parseInt(newOpeningStock, 10) || 0,
      sellableStock: parseInt(newOpeningStock, 10) || 0,
      reorderPoint: parseInt(newReorderPoint, 10) || 10,
      targetStock: (parseInt(newOpeningStock, 10) || 0) * 3,
      hasBatches: true,
      aliases: [],
    });

    setShowAddModal(false);
    setNewCanonicalName('');
    setNewSku('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product, SKU, or alias (e.g. 'Aug tab 625mg')..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {canEdit && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Product & Aliases</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Computed Stock</th>
                <th className="py-3 px-3 text-right">Sellable</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-center">Stock Confidence</th>
                <th className="py-3 px-3 text-center">Batch / Expiry</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredProducts.map((p) => {
                const prodBatches = batches.filter((b) => b.productId === p.id);
                const prodEvents = ledgerEvents.filter((e) => e.productId === p.id);
                const confidence = calculateStockConfidence(p, prodEvents, {
                  verifiedAt: p.lastVerifiedAt || '',
                  variance: 0,
                  expected: p.currentStock,
                });

                const soonestBatch = [...prodBatches].sort(
                  (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
                )[0];

                const isLow = p.currentStock <= p.reorderPoint;
                const isOut = p.currentStock === 0;

                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{p.canonicalName}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">{p.sku}</span>
                        {p.aliases.length > 0 && (
                          <span className="truncate max-w-[180px]">
                            aka: {p.aliases.join(', ')}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{p.category}</td>

                    <td className="py-3 px-3 text-right">
                      <div
                        className={`font-bold font-mono ${
                          isOut ? 'text-red-600 dark:text-red-400' : isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {p.currentStock} {p.unit}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Reorder at {p.reorderPoint}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-900 dark:text-slate-200">
                      {p.sellableStock} {p.unit}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-800 dark:text-slate-300">
                      ₦{p.sellingPrice.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getConfidenceLevelBadge(
                          confidence.level
                        )}`}
                        title={confidence.explanation}
                      >
                        {confidence.score}% • {confidence.level.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {soonestBatch ? (
                        <div className="text-[10px]">
                          <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                            {soonestBatch.batchNumber}
                          </span>
                          <div className="text-slate-500 font-mono">
                            Exp: {soonestBatch.expiryDate}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInitiateCount(p.id);
                        }}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
                      >
                        Verify Count
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-950 dark:text-white">{selectedProduct.canonicalName}</h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{selectedProduct.sku}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px] uppercase font-semibold">Current Stock</div>
                <div className="text-base font-bold text-slate-950 dark:text-white font-mono mt-0.5">
                  {selectedProduct.currentStock} {selectedProduct.unit}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px] uppercase font-semibold">Cost Price</div>
                <div className="text-base font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                  ₦{selectedProduct.costPrice.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px] uppercase font-semibold">Selling Price</div>
                <div className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                  ₦{selectedProduct.sellingPrice.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Aliases Section */}
            <div className="space-y-1 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">Recognized Aliases:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedProduct.aliases.map((a, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300"
                  >
                    "{a}"
                  </span>
                ))}
              </div>
            </div>

            {/* Movement History */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Recent Ledger Events for this SKU:
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {ledgerEvents
                  .filter((e) => e.productId === selectedProduct.id)
                  .map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white uppercase">{ev.type}</span>
                        <div className="text-slate-500 text-[10px]">{ev.reason || 'Standard movement'}</div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold ${
                            ev.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {ev.quantity > 0 ? `+${ev.quantity}` : ev.quantity}
                        </span>
                        <div className="text-[10px] text-slate-500">
                          {new Date(ev.occurredAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProduct}
            className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xl text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-950 dark:text-white">Add New Product to Catalog</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold">Canonical Product Name</label>
                <input
                  type="text"
                  required
                  value={newCanonicalName}
                  onChange={(e) => setNewCanonicalName(e.target.value)}
                  placeholder="e.g. Ciprofloxacin 500mg Tablets (10s)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">SKU / Code</label>
                  <input
                    type="text"
                    required
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    placeholder="MED-CIP-500"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Category</label>
                  <input
                    type="text"
                    required
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Antibiotics"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Cost Price (₦)</label>
                  <input
                    type="number"
                    required
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Selling Price (₦)</label>
                  <input
                    type="number"
                    required
                    value={newSellingPrice}
                    onChange={(e) => setNewSellingPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Opening Stock</label>
                  <input
                    type="number"
                    required
                    value={newOpeningStock}
                    onChange={(e) => setNewOpeningStock(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Reorder Point</label>
                  <input
                    type="number"
                    required
                    value={newReorderPoint}
                    onChange={(e) => setNewReorderPoint(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Save & Initialize Ledger
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
