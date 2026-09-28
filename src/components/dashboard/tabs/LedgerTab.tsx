import React, { useState } from 'react';
import {
  Layers,
  History,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Download,
  ShieldCheck,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { LedgerEvent, MovementType } from '../../../types';

interface LedgerTabProps {
  ledgerEvents: LedgerEvent[];
}

export const LedgerTab: React.FC<LedgerTabProps> = ({ ledgerEvents }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = ledgerEvents.filter((ev) => {
    const matchesType = selectedType === 'all' || ev.type === selectedType;
    const matchesSearch =
      ev.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.createdByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.reason && ev.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getMovementTypeBadge = (type: MovementType) => {
    switch (type) {
      case 'RECEIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'SALE':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'ADJUSTMENT':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'DAMAGE':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'EXPIRY':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleExportCsv = () => {
    const headers = ['Event ID', 'Timestamp', 'Product', 'Type', 'Quantity', 'Unit Cost', 'Operator', 'Reason'];
    const rows = filteredEvents.map((e) => [
      e.id,
      e.occurredAt,
      `"${e.productName}"`,
      e.type,
      e.quantity,
      e.unitCost || 0,
      `"${e.createdByName}"`,
      `"${e.reason || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `immutable_ledger_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Principle Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-800/40 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Immutable Event Ledger (The Non-Negotiable Rule)</span>
            <span className="px-2 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px]">
              PRD Section 11 & 20.3
            </span>
          </div>
          <p className="text-slate-300">
            No ordinary user action is allowed to silently change a stock number. Every material change
            creates a ledger event with a source, operator signature, and timestamp. Current stock is always
            deterministically computed from this stream.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product, operator, or reason..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="all">All Movement Types</option>
            <option value="RECEIVE">RECEIVE (Inbound)</option>
            <option value="SALE">SALE (Outbound)</option>
            <option value="ADJUSTMENT">ADJUSTMENT (Variance)</option>
            <option value="DAMAGE">DAMAGE (Write-off)</option>
            <option value="EXPIRY">EXPIRY (Spoilage)</option>
          </select>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit CSV
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Event ID & Timestamp</th>
                <th className="py-3 px-3">Movement Type</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-3 text-right">Quantity Delta</th>
                <th className="py-3 px-3 text-right">Unit Cost</th>
                <th className="py-3 px-3">Operator Signature</th>
                <th className="py-3 px-4">Audit Note / Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredEvents.map((ev) => {
                const isPositive = ev.quantity > 0;

                return (
                  <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono text-purple-300 font-semibold">{ev.id}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(ev.occurredAt).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getMovementTypeBadge(
                          ev.type
                        )}`}
                      >
                        {ev.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-white">{ev.productName}</td>

                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {isPositive ? `+${ev.quantity}` : ev.quantity}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      {ev.unitCost ? `₦${ev.unitCost.toLocaleString()}` : '—'}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{ev.createdByName}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{ev.createdByRole || 'Staff'}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                      {ev.reason || ev.sourceFile || 'Direct ledger transaction'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
