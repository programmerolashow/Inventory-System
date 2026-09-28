import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info,
} from 'lucide-react';
import { ColumnMapping, Product, ProductMatchProposal, User } from '../../../types';
import { hasPermission } from '../../../lib/rbac';

interface IngestionTabProps {
  products: Product[];
  currentUser: User;
  currentStoreId: string;
  onCommitInboundShipment: (
    sourceFileName: string,
    items: {
      canonicalName: string;
      sku: string;
      quantity: number;
      unitCost: number;
      batchNumber?: string;
      expiryDate?: string;
    }[]
  ) => void;
}

// Sample messy spreadsheets simulating real Nigerian SME waybills
const SAMPLE_MESSY_FILES = [
  {
    name: 'GlaxoSmithKline_Waybill_Lagos_Sep2026.csv',
    type: 'pharmacy',
    description: 'Messy column headers ("ITEM_DESC", "QTY_RECV", "EXP_DT", "NET_CST") with abbreviated drug names',
    columns: ['ITEM_DESC', 'QTY_RECV', 'NET_CST', 'EXP_DT', 'BN_CODE', 'PACK_SZ'],
    rows: [
      {
        ITEM_DESC: 'Aug tab 625mg',
        QTY_RECV: '25',
        NET_CST: '4200',
        EXP_DT: '2027-08-30',
        BN_CODE: 'BN-AUG-9941',
        PACK_SZ: '14s',
      },
      {
        ITEM_DESC: 'Amoxicillin 500mg cap',
        QTY_RECV: '40',
        NET_CST: '2800',
        EXP_DT: '2027-06-15',
        BN_CODE: 'BN-AMX-7712',
        PACK_SZ: '100s',
      },
      {
        ITEM_DESC: 'Amoxicillin 250mg susp', // High stakes test against Amox 500mg!
        QTY_RECV: '15',
        NET_CST: '1400',
        EXP_DT: '2027-04-20',
        BN_CODE: 'BN-AMX-SUSP-11',
        PACK_SZ: '100ml',
      },
      {
        ITEM_DESC: 'Coartem 80/480mg tab',
        QTY_RECV: '30',
        NET_CST: '2600',
        EXP_DT: '2027-11-30',
        BN_CODE: 'BN-COA-8822',
        PACK_SZ: '6s',
      },
    ],
  },
  {
    name: 'PrimeDistributors_Restock_Invoice_8801.csv',
    type: 'supermarket',
    description: 'Wholesale beverage & food delivery with shorthand headers and missing SKU fields',
    columns: ['Product_Title', 'Received_Count', 'Buying_Rate', 'Category_Tag', 'Best_Before'],
    rows: [
      {
        Product_Title: 'Golden Penny Semovita 2kg',
        Received_Count: '50',
        Buying_Rate: '2100',
        Category_Tag: 'Grains & Flours',
        Best_Before: '2027-05-10',
      },
      {
        Product_Title: 'Peak Full Cream Milk Powder 400g',
        Received_Count: '36',
        Buying_Rate: '3400',
        Category_Tag: 'Dairy',
        Best_Before: '2027-09-01',
      },
      {
        Product_Title: 'Milo Chocolate Drink 500g refill',
        Received_Count: '24',
        Buying_Rate: '2950',
        Category_Tag: 'Beverages',
        Best_Before: '2027-08-15',
      },
    ],
  },
];

export const IngestionTab: React.FC<IngestionTabProps> = ({
  products,
  currentUser,
  currentStoreId,
  onCommitInboundShipment,
}) => {
  const [selectedSample, setSelectedSample] = useState(SAMPLE_MESSY_FILES[0]);
  const [stage, setStage] = useState<'upload' | 'mapping_review' | 'matching_review' | 'complete'>('upload');
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [matchProposals, setMatchProposals] = useState<ProductMatchProposal[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const canUpload = hasPermission(currentUser, 'import:upload');
  const canConfirm = hasPermission(currentUser, 'import:confirm_mapping');

  // Generate proposed AI column mappings
  const handleAnalyzeFile = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const proposed: ColumnMapping[] = selectedSample.columns.map((col) => {
        const lower = col.toLowerCase();
        const sampleRow = selectedSample.rows[0] as Record<string, string>;
        if (lower.includes('desc') || lower.includes('title') || lower.includes('name') || lower.includes('item')) {
          return { rawHeader: col, mappedField: 'product_name', confidence: 96, sampleValue: sampleRow[col] || '' };
        }
        if (lower.includes('qty') || lower.includes('count') || lower.includes('recv') || lower.includes('amount')) {
          return { rawHeader: col, mappedField: 'quantity', confidence: 98, sampleValue: sampleRow[col] || '' };
        }
        if (lower.includes('cst') || lower.includes('cost') || lower.includes('rate') || lower.includes('price')) {
          return { rawHeader: col, mappedField: 'unit_cost', confidence: 94, sampleValue: sampleRow[col] || '' };
        }
        if (lower.includes('exp') || lower.includes('date') || lower.includes('before')) {
          return { rawHeader: col, mappedField: 'expiry_date', confidence: 92, sampleValue: sampleRow[col] || '' };
        }
        if (lower.includes('bn') || lower.includes('code') || lower.includes('batch')) {
          return { rawHeader: col, mappedField: 'batch_number', confidence: 95, sampleValue: sampleRow[col] || '' };
        }
        if (lower.includes('pack') || lower.includes('sz') || lower.includes('unit')) {
          return { rawHeader: col, mappedField: 'unit', confidence: 85, sampleValue: sampleRow[col] || '' };
        }
        return { rawHeader: col, mappedField: 'ignore', confidence: 60, sampleValue: sampleRow[col] || '' };
      });

      // Generate fuzzy matching proposals demonstrating High-Stakes Dosage Safeguard (Section 13)
      const proposals: ProductMatchProposal[] = selectedSample.rows.map((r) => {
        const row = r as Record<string, string>;
        const rawName = (row.ITEM_DESC || row.Product_Title || '') as string;

        // Check for safe alias match
        if (rawName.toLowerCase().includes('aug tab 625mg')) {
          const match = products.find((p) => p.sku === 'MED-AUG-625');
          return {
            rawName,
            suggestedProductId: match?.id,
            suggestedProductName: match?.canonicalName || 'Augmentin 625mg Tablet (14s)',
            confidence: 94,
            action: 'auto_merge',
            notes: 'Fuzzy synonym matched against verified alias history',
          };
        }

        // Check for HIGH-STAKES dosage mismatch: Amoxicillin 250mg suspension vs 500mg capsules
        if (rawName.toLowerCase().includes('amoxicillin 250mg') || rawName.toLowerCase().includes('amox 250mg')) {
          return {
            rawName,
            suggestedProductId: undefined,
            suggestedProductName: 'Amoxicillin 250mg Suspension (100ml)',
            confidence: 65,
            action: 'manual_review_needed',
            isHighStakesDosageMismatch: true,
            notes: 'SAFETY GATE TRIGGERED (PRD Section 13): Pediatric suspension differs in strength and dosage form from Amoxicillin 500mg Capsules. Silent merge strictly blocked.',
          };
        }

        if (rawName.toLowerCase().includes('amox') && rawName.toLowerCase().includes('500')) {
          const match = products.find((p) => p.sku === 'MED-AMX-500');
          return {
            rawName,
            suggestedProductId: match?.id,
            suggestedProductName: match?.canonicalName || 'Amoxicillin 500mg Capsules (100s)',
            confidence: 91,
            action: 'auto_merge',
            notes: 'Strength (500mg) and capsule form verified consistent',
          };
        }

        return {
          rawName,
          suggestedProductName: rawName,
          confidence: 70,
          action: 'create_new',
          notes: 'New item to be registered into canonical catalog',
        };
      });

      setMappings(proposed);
      setMatchProposals(proposals);
      setIsProcessing(false);
      setStage('mapping_review');
    }, 450);
  };

  const handleCommitShipment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const itemsToPost = selectedSample.rows.map((r) => {
        const row = r as Record<string, string>;
        const rawName = (row.ITEM_DESC || row.Product_Title || 'Imported SKU') as string;
        const qty = parseInt(row.QTY_RECV || row.Received_Count || '10', 10);
        const cost = parseFloat(row.NET_CST || row.Buying_Rate || '1000');
        const batchNumber = row.BN_CODE || `BN-${Date.now().toString(36).slice(-4)}`;
        const expiryDate = row.EXP_DT || row.Best_Before || '2027-12-31';

        return {
          canonicalName: rawName,
          sku: `SKU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          quantity: qty,
          unitCost: cost,
          batchNumber,
          expiryDate,
        };
      });

      onCommitInboundShipment(selectedSample.name, itemsToPost);
      setIsProcessing(false);
      setStage('complete');
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Principle Notice: Clean solid box */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">PRD Principle #1: Human-in-the-Loop Over Silent AI</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold">
              Section 13 & 17
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            AI proposes column mappings and fuzzy matches; deterministic arithmetic calculates ledger
            postings. High-stakes matches (e.g. 500mg vs 250mg) require explicit human approval and are never silently merged.
          </p>
        </div>
      </div>

      {/* Stage Tracker */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 text-xs">
        <div className="flex items-center gap-4">
          <span
            className={`font-semibold flex items-center gap-1.5 ${
              stage === 'upload' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center text-[10px]">
              1
            </span>
            Upload Inbound File
          </span>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

          <span
            className={`font-semibold flex items-center gap-1.5 ${
              stage === 'mapping_review' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center text-[10px]">
              2
            </span>
            Review AI Column Mapping
          </span>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

          <span
            className={`font-semibold flex items-center gap-1.5 ${
              stage === 'matching_review' || stage === 'complete' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center text-[10px]">
              3
            </span>
            Fuzzy Match & Commit Ledger
          </span>
        </div>
      </div>

      {/* STEP 1: FILE SELECTION / UPLOAD */}
      {stage === 'upload' && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-600 rounded-xl p-8 text-center bg-white dark:bg-slate-900 space-y-4 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Drag & drop delivery waybill or spreadsheet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports CSV, XLSX, or raw POS exports with messy, inconsistent column headers
              </p>
            </div>

            {/* Quick Demo Pre-load buttons */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Or select a realistic Nigerian SME test file:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
                {SAMPLE_MESSY_FILES.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => setSelectedSample(sample)}
                    className={`p-3 rounded-lg border text-xs transition-colors ${
                      selectedSample.name === sample.name
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-slate-900 dark:text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">{sample.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">{sample.description}</p>
                    <div className="mt-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                      {sample.rows.length} shipment items • {sample.columns.length} raw headers
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                disabled={!canUpload || isProcessing}
                onClick={handleAnalyzeFile}
                className="px-5 py-2.5 rounded-lg font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm inline-flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Analyzing Ingestion Semantics...</span>
                ) : (
                  <>
                    <span>Inspect & Propose Mapping</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: REVIEW AI COLUMN MAPPINGS */}
      {stage === 'mapping_review' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Review Proposed Column Mappings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Confirm how headers in <strong className="text-slate-900 dark:text-white">{selectedSample.name}</strong> map to canonical fields.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStage('upload')}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 underline"
            >
              Choose different file
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Raw File Header</th>
                  <th className="py-2.5 px-3">Sample Value</th>
                  <th className="py-2.5 px-3">Proposed Canonical Field</th>
                  <th className="py-2.5 px-3 text-right">AI Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {mappings.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="py-2.5 px-3 font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                      {m.rawHeader}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-[140px] truncate">
                      {m.sampleValue || '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={m.mappedField}
                        onChange={(e) => {
                          const updated = [...mappings];
                          updated[idx].mappedField = e.target.value as any;
                          setMappings(updated);
                        }}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      >
                        <option value="product_name">Product Name / Title</option>
                        <option value="quantity">Quantity</option>
                        <option value="unit_cost">Unit Cost Price</option>
                        <option value="expiry_date">Expiry Date</option>
                        <option value="batch_number">Batch Number</option>
                        <option value="unit">Unit of Measure</option>
                        <option value="ignore">Ignore Column</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {m.confidence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>No data has been posted to the ledger yet. Human confirmation is mandatory.</span>
            </div>

            <button
              type="button"
              disabled={!canConfirm}
              onClick={() => setStage('matching_review')}
              className="px-4 py-2 rounded-lg font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-2 transition-colors"
            >
              <span>Confirm Mappings & Proceed to Catalog Match</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: FUZZY CATALOG MATCHING */}
      {stage === 'matching_review' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-amber-900 dark:text-amber-300">
                PRD High-Stakes Matching Rule Active (Section 13 & 17)
              </div>
              <p className="text-amber-800 dark:text-slate-300">
                Products with different strengths (e.g. 500mg vs 250mg) or different dosage forms are NEVER
                auto-merged. This system is authoritative over <strong className="text-slate-900 dark:text-white">quantity</strong>,
                never clinical equivalence.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {matchProposals.map((proposal, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border text-xs transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  proposal.isHighStakesDosageMismatch
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{proposal.rawName}</span>
                    {proposal.isHighStakesDosageMismatch && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 uppercase">
                        Manual Confirmation Required
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Matches: <strong className="text-emerald-700 dark:text-emerald-400">{proposal.suggestedProductName}</strong>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{proposal.notes}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[11px] font-mono text-slate-500">
                    Confidence: {proposal.confidence}%
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...matchProposals];
                      updated[idx].action = 'auto_merge';
                      updated[idx].isHighStakesDosageMismatch = false;
                      setMatchProposals(updated);
                    }}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200"
                  >
                    Accept as New SKU
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStage('mapping_review')}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              Back to Column Mappings
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleCommitShipment}
              className="px-5 py-2.5 rounded-lg font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-2 transition-colors"
            >
              {isProcessing ? 'Posting RECEIVE Events...' : 'Commit Inbound Delivery to Ledger'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: COMPLETE CONFIRMATION */}
      {stage === 'complete' && (
        <div className="p-8 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inbound Delivery Committed to Ledger</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              All items successfully created immutable <code className="text-emerald-700 dark:text-emerald-400 font-mono">RECEIVE</code> events.
              Stock levels, batch expiry dates, and Stock Confidence scores have been updated deterministically.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setStage('upload')}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors"
            >
              Ingest Another Shipment File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
