import React, { useState } from 'react';
import {
  ClipboardCheck,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Info,
  ShieldAlert,
  Save,
  Plus,
} from 'lucide-react';
import { Product, User, VerificationLine, VerificationSession } from '../../../types';
import { RANKED_VARIANCE_CAUSES } from '../../../lib/intelligence';
import { hasPermission } from '../../../lib/rbac';

interface VerificationTabProps {
  products: Product[];
  verifications: VerificationSession[];
  currentUser: User;
  currentStoreId: string;
  onCompleteVerificationSession: (session: VerificationSession) => void;
  targetProductId?: string;
}

export const VerificationTab: React.FC<VerificationTabProps> = ({
  products,
  verifications,
  currentUser,
  currentStoreId,
  onCompleteVerificationSession,
  targetProductId,
}) => {
  const [activeSession, setActiveSession] = useState<VerificationSession | null>(() => {
    // If targetProductId passed, initiate count for that item
    const target = products.find((p) => p.id === targetProductId);
    const initialItems = target
      ? [target]
      : products.slice(0, 4); // prioritize top items

    const lines: VerificationLine[] = initialItems.map((p) => ({
      id: `vline_${Date.now()}_${p.id}`,
      productId: p.id,
      productName: p.canonicalName,
      sku: p.sku,
      expectedQty: p.currentStock,
      countedQty: p.currentStock, // starts at expected for ease
      variance: 0,
      unitCost: p.costPrice,
      varianceValue: 0,
      reason: RANKED_VARIANCE_CAUSES[0].label,
      status: 'pending',
    }));

    return {
      id: `ver_sess_${Date.now().toString(36)}`,
      businessId: currentUser.businessId || 'biz_01',
      storeId: currentStoreId,
      storeName: 'Active Store Branch',
      startedAt: new Date().toISOString(),
      startedBy: currentUser.id,
      startedByName: currentUser.name,
      status: 'in_progress',
      lines,
      totalExpectedUnits: lines.reduce((acc, l) => acc + l.expectedQty, 0),
      totalCountedUnits: lines.reduce((acc, l) => acc + l.countedQty, 0),
      netVarianceUnits: 0,
      netVarianceValue: 0,
    };
  });

  const [selectedHistory, setSelectedHistory] = useState<VerificationSession | null>(
    verifications[0] || null
  );

  const canCount = hasPermission(currentUser, 'verification:count');
  const canApprove = hasPermission(currentUser, 'verification:approve_variance');

  const updateCount = (lineId: string, counted: number) => {
    if (!activeSession) return;
    const updatedLines = activeSession.lines.map((l) => {
      if (l.id !== lineId) return l;
      const variance = counted - l.expectedQty;
      const varianceValue = variance * l.unitCost;
      return {
        ...l,
        countedQty: counted,
        variance,
        varianceValue,
        status: (variance === 0 ? 'adjusted' : 'flagged') as any,
      };
    });

    const netUnits = updatedLines.reduce((acc, l) => acc + l.variance, 0);
    const netVal = updatedLines.reduce((acc, l) => acc + l.varianceValue, 0);

    setActiveSession({
      ...activeSession,
      lines: updatedLines,
      totalCountedUnits: updatedLines.reduce((acc, l) => acc + l.countedQty, 0),
      netVarianceUnits: netUnits,
      netVarianceValue: netVal,
    });
  };

  const updateCause = (lineId: string, reason: string) => {
    if (!activeSession) return;
    const updatedLines = activeSession.lines.map((l) => {
      if (l.id !== lineId) return l;
      return { ...l, reason };
    });
    setActiveSession({ ...activeSession, lines: updatedLines });
  };

  const handleFinishSession = () => {
    if (!activeSession) return;
    const completedSession: VerificationSession = {
      ...activeSession,
      completedAt: new Date().toISOString(),
      status: 'completed',
    };
    onCompleteVerificationSession(completedSession);
    setSelectedHistory(completedSession);
  };

  return (
    <div className="space-y-6">
      {/* Educational Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-800/40 flex items-start gap-3">
        <ClipboardCheck className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Physical Verification & Variance Investigation</span>
            <span className="px-2 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
              PRD Section 12.6 & 15
            </span>
          </div>
          <p className="text-slate-300">
            Rather than waiting for silent shrinkage, weekly counts prompt staff on prioritized items. When
            variances occur, managers must assign a ranked cause before the adjustment posts to the immutable ledger.
          </p>
        </div>
      </div>

      {/* Active Count Session */}
      {activeSession && activeSession.status === 'in_progress' ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Active Stock Count Session</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                  In Progress
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Conducted by <strong className="text-slate-200">{activeSession.startedByName}</strong> ({currentUser.role})
              </p>
            </div>

            {/* Quick Net Variance Summary */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Expected</span>
                <span className="font-bold text-white">{activeSession.totalExpectedUnits} units</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Net Variance</span>
                <span
                  className={`font-bold ${
                    activeSession.netVarianceUnits < 0
                      ? 'text-red-400'
                      : activeSession.netVarianceUnits > 0
                      ? 'text-emerald-400'
                      : 'text-slate-300'
                  }`}
                >
                  {activeSession.netVarianceUnits > 0
                    ? `+${activeSession.netVarianceUnits}`
                    : activeSession.netVarianceUnits}{' '}
                  units
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Discrepancy ₦</span>
                <span
                  className={`font-bold ${
                    activeSession.netVarianceValue < 0 ? 'text-red-400' : 'text-slate-300'
                  }`}
                >
                  ₦{Math.abs(activeSession.netVarianceValue).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Lines Table */}
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Product Name & SKU</th>
                  <th className="py-2.5 px-3 text-right">Expected Stock</th>
                  <th className="py-2.5 px-3 text-center">Physical Count</th>
                  <th className="py-2.5 px-3 text-right">Variance</th>
                  <th className="py-2.5 px-3">Ranked Likely Cause (PRD 12.6)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {activeSession.lines.map((line) => {
                  const hasDiscrepancy = line.variance !== 0;

                  return (
                    <tr
                      key={line.id}
                      className={hasDiscrepancy ? 'bg-amber-950/10' : 'hover:bg-slate-800/30'}
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{line.productName}</div>
                        <div className="text-[10px] font-mono text-emerald-400">{line.sku}</div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-200">
                        {line.expectedQty} units
                      </td>

                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          value={line.countedQty}
                          disabled={!canCount}
                          onChange={(e) => updateCount(line.id, parseInt(e.target.value, 10) || 0)}
                          className="w-20 bg-slate-900 border border-slate-700 rounded-lg py-1 px-2 text-center text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>

                      <td className="py-3 px-3 text-right font-mono">
                        <span
                          className={`font-bold ${
                            line.variance < 0
                              ? 'text-red-400'
                              : line.variance > 0
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {line.variance > 0 ? `+${line.variance}` : line.variance} units
                        </span>
                        {line.variance !== 0 && (
                          <div className="text-[10px] text-slate-400">
                            ₦{Math.abs(line.varianceValue).toLocaleString()}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {hasDiscrepancy ? (
                          <select
                            value={line.reason}
                            onChange={(e) => updateCause(line.id, e.target.value)}
                            className="bg-slate-900 border border-amber-800/60 text-amber-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 max-w-[240px]"
                          >
                            {RANKED_VARIANCE_CAUSES.map((cause) => (
                              <option key={cause.id} value={cause.label}>
                                {cause.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified In Sync
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400">
              {canApprove ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Your role ({currentUser.role}) has authority to approve ledger adjustments.
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Count entered will be submitted for Manager or Owner approval.
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleFinishSession}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Approve Variance & Post ADJUSTMENT to Ledger</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h4 className="font-bold text-sm text-white">No Physical Count Currently Active</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Ready to perform a quick weekly count cycle on high-value or fast-moving shelf stock?
          </p>
          <button
            type="button"
            onClick={() => {
              const lines: VerificationLine[] = products.slice(0, 4).map((p) => ({
                id: `vline_${Date.now()}_${p.id}`,
                productId: p.id,
                productName: p.canonicalName,
                sku: p.sku,
                expectedQty: p.currentStock,
                countedQty: p.currentStock,
                variance: 0,
                unitCost: p.costPrice,
                varianceValue: 0,
                reason: RANKED_VARIANCE_CAUSES[0].label,
                status: 'pending',
              }));
              setActiveSession({
                id: `ver_sess_${Date.now().toString(36)}`,
                businessId: currentUser.businessId || 'biz_01',
                storeId: currentStoreId,
                storeName: 'Active Branch',
                startedAt: new Date().toISOString(),
                startedBy: currentUser.id,
                startedByName: currentUser.name,
                status: 'in_progress',
                lines,
                totalExpectedUnits: lines.reduce((acc, l) => acc + l.expectedQty, 0),
                totalCountedUnits: lines.reduce((acc, l) => acc + l.countedQty, 0),
                netVarianceUnits: 0,
                netVarianceValue: 0,
              });
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Start Prioritized Count Session
          </button>
        </div>
      )}

      {/* Historical Verification Sessions Audit */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
          Previous Verification & Audit Logs
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {verifications.map((v) => (
            <div
              key={v.id}
              onClick={() => setSelectedHistory(v)}
              className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                selectedHistory?.id === v.id
                  ? 'bg-slate-800/80 border-slate-600'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">Session #{v.id.slice(0, 10)}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(v.startedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Items: {v.lines.length} SKUs counted</span>
                <span
                  className={`font-mono font-bold ${
                    v.netVarianceUnits < 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  Net: {v.netVarianceUnits} units (₦{Math.abs(v.netVarianceValue).toLocaleString()})
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Audited by {v.startedByName}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
