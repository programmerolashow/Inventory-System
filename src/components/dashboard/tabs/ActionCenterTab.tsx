import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  TrendingDown,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Filter,
  Check,
  Package,
} from 'lucide-react';
import { ActionCard, ActionType, User } from '../../../types';
import { hasPermission } from '../../../lib/rbac';

interface ActionCenterTabProps {
  actionCards: ActionCard[];
  currentUser: User;
  onResolveCard: (cardId: string, actionNote: string) => void;
  onStartCountForProduct: (productId: string) => void;
}

export const ActionCenterTab: React.FC<ActionCenterTabProps> = ({
  actionCards,
  currentUser,
  onResolveCard,
  onStartCountForProduct,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<ActionCard | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const canResolve = hasPermission(currentUser, 'action_center:resolve');

  const filteredCards = actionCards.filter((card) => {
    if (filterType === 'all') return true;
    return card.type === filterType;
  });

  const getBadgeStyle = (type: ActionType) => {
    switch (type) {
      case 'reorder':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'expiry':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'variance':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'dead_capital':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'transfer':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
    }
  };

  const getSeverityBadge = (severity: 'critical' | 'high' | 'medium') => {
    switch (severity) {
      case 'critical':
        return 'bg-red-950 text-red-300 border-red-800';
      case 'high':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'medium':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleExecuteAction = (card: ActionCard) => {
    if (card.type === 'variance') {
      onStartCountForProduct(card.productId);
      return;
    }
    setSelectedCard(card);
    setResolutionNote(`Executed: ${card.suggestedActionLabel}`);
  };

  const submitResolution = () => {
    if (!selectedCard) return;
    setIsResolving(true);
    setTimeout(() => {
      onResolveCard(selectedCard.id, resolutionNote || 'Action confirmed by manager');
      setIsResolving(false);
      setSelectedCard(null);
      setResolutionNote('');
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the 4-question constitution */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Action Center: The Intelligence Layer
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Section 12.5 & 13.5 PRD
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Every card strictly answers four operational questions:{' '}
            <strong className="text-white">What happened</strong>,{' '}
            <strong className="text-white">Why it matters</strong>,{' '}
            <strong className="text-white">What to do</strong>, and{' '}
            <strong className="text-white">What evidence supports it</strong>. No vanity charts.
          </p>
        </div>

        {/* Action Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'reorder', label: 'Reorder' },
            { id: 'expiry', label: 'Expiry & FEFO' },
            { id: 'variance', label: 'Variance' },
            { id: 'dead_capital', label: 'Dead Capital' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterType === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">All Action Items Resolved</h3>
          <p className="text-xs text-slate-400 mt-1">
            No critical stockouts, expiring batches, or uninvestigated variances detected for this store.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 p-5 space-y-4 shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${getBadgeStyle(
                        card.type
                      )}`}
                    >
                      {card.type.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityBadge(
                        card.severity
                      )}`}
                    >
                      {card.severity}
                    </span>
                  </div>

                  {card.financialImpact && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Impact: </span>
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        ₦{card.financialImpact.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight">{card.title}</h3>

                {/* The 4 PRD Questions */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      1. What Happened
                    </span>
                    <p className="text-slate-200">{card.whatHappened}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 block">
                      2. Why It Matters
                    </span>
                    <p className="text-slate-200">{card.whyItMatters}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      3. Recommended Action
                    </span>
                    <p className="text-emerald-100 font-medium">{card.whatToDo}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      4. Supporting Evidence
                    </span>
                    <p className="text-slate-300 font-mono text-[11px]">{card.evidence}</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <span className="text-[11px] text-slate-500">
                  Logged {new Date(card.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {canResolve ? (
                  <button
                    type="button"
                    onClick={() => handleExecuteAction(card)}
                    className="px-3.5 py-1.5 rounded-xl font-semibold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/10 flex items-center gap-1.5 transition-colors"
                  >
                    <span>{card.suggestedActionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 italic">
                    Requires Manager / Owner role to resolve
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Confirmation Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white">Execute Action Resolution</h4>
              <span className="text-xs text-emerald-400 font-mono">RBAC Authorized</span>
            </div>

            <p className="text-xs text-slate-300">
              You are resolving <strong className="text-white">{selectedCard.title}</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Resolution Audit Note</label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Explain the operational adjustment or order placed..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResolving}
                onClick={submitResolution}
                className="px-4 py-1.5 rounded-xl font-semibold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
              >
                {isResolving ? 'Committing...' : 'Commit & Resolve Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
