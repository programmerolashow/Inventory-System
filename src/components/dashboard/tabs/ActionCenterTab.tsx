import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  TrendingDown,
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
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'expiry':
        return 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800';
      case 'variance':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'dead_capital':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'transfer':
        return 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800';
    }
  };

  const getSeverityBadge = (severity: 'critical' | 'high' | 'medium') => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white font-bold';
      case 'high':
        return 'bg-amber-600 text-white font-bold';
      case 'medium':
        return 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300';
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
      {/* Top Banner: Solid Color, No Gradients */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Action Center: The Intelligence Layer
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              PRD Section 12.5 & 13.5
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Every operational card answers four mandatory questions:{' '}
            <strong className="text-slate-900 dark:text-white">What happened</strong>,{' '}
            <strong className="text-slate-900 dark:text-white">Why it matters</strong>,{' '}
            <strong className="text-slate-900 dark:text-white">What to do</strong>, and{' '}
            <strong className="text-slate-900 dark:text-white">Supporting evidence</strong>.
          </p>
        </div>

        {/* Action Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
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
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterType === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">All Action Items Resolved</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No critical stockouts, expiring batches, or uninvestigated variances detected for this store.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(
                        card.type
                      )}`}
                    >
                      {card.type.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getSeverityBadge(
                        card.severity
                      )}`}
                    >
                      {card.severity}
                    </span>
                  </div>

                  {card.financialImpact && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Impact: </span>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                        ₦{card.financialImpact.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{card.title}</h3>

                {/* The 4 PRD Questions */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      1. What Happened
                    </span>
                    <p className="text-slate-800 dark:text-slate-200">{card.whatHappened}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                      2. Why It Matters
                    </span>
                    <p className="text-slate-800 dark:text-slate-200">{card.whyItMatters}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      3. Recommended Action
                    </span>
                    <p className="text-emerald-900 dark:text-emerald-100 font-semibold">{card.whatToDo}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      4. Supporting Evidence
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{card.evidence}</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500">
                  {new Date(card.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {canResolve ? (
                  <button
                    type="button"
                    onClick={() => handleExecuteAction(card)}
                    className="px-3.5 py-1.5 rounded-lg font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Execute Action Resolution</h4>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">RBAC Authorized</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              You are resolving <strong className="text-slate-900 dark:text-white">{selectedCard.title}</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Resolution Audit Note
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                placeholder="Explain the operational adjustment or order placed..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResolving}
                onClick={submitResolution}
                className="px-4 py-1.5 rounded-lg font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
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
