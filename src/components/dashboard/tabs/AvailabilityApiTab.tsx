import React, { useState } from 'react';
import {
  Code,
  Shield,
  Zap,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Terminal,
  Activity,
} from 'lucide-react';
import { Business, Product, User } from '../../../types';
import { calculateStockConfidence } from '../../../lib/intelligence';
import { StorageService } from '../../../lib/storage';

interface AvailabilityApiTabProps {
  business: Business;
  products: Product[];
  currentUser: User;
  currentStoreId: string;
  onToggleApiOptIn: (optedIn: boolean) => void;
  onRegenerateApiKey: () => void;
}

export const AvailabilityApiTab: React.FC<AvailabilityApiTabProps> = ({
  business,
  products,
  currentUser,
  currentStoreId,
  onToggleApiOptIn,
  onRegenerateApiKey,
}) => {
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || 'MED-AUG-625');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const selectedProduct = products.find((p) => p.sku === selectedSku) || products[0];

  const handleTestQuery = () => {
    setIsQuerying(true);
    setTimeout(() => {
      if (!business.optedInApi) {
        setApiResponse({
          error: 'Forbidden',
          status: 403,
          message: 'This business has not opted in to external availability sharing.',
        });
        setIsQuerying(false);
        return;
      }

      if (!selectedProduct) {
        setApiResponse({
          error: 'Not Found',
          status: 404,
          message: `SKU '${selectedSku}' not found in active catalog.`,
        });
        setIsQuerying(false);
        return;
      }

      const conf = calculateStockConfidence(selectedProduct, [], {
        verifiedAt: selectedProduct.lastVerifiedAt || new Date().toISOString(),
        variance: 0,
        expected: selectedProduct.currentStock,
      });

      // EXACT JSON contract from PRD Section 16
      const payload = {
        sku: selectedProduct.sku,
        product_name: selectedProduct.canonicalName,
        store_id: currentStoreId,
        sellable_quantity: selectedProduct.sellableStock,
        confidence: {
          score: conf.score,
          level: conf.level,
        },
        last_verified_at: selectedProduct.lastVerifiedAt || '2026-09-25T15:30:00Z',
        last_synchronized_at: new Date().toISOString(),
      };

      setApiResponse(payload);

      // Log external API query to storage
      StorageService.logApiQuery({
        partnerName: 'Interactive Dev Console (MediSwitch Simulation)',
        endpoint: `/api/v1/availability?sku=${selectedProduct.sku}&store=${currentStoreId}`,
        sku: selectedProduct.sku,
        storeId: currentStoreId,
        statusCode: 200,
        latencyMs: 34,
        responseSummary: `sellable_qty: ${payload.sellable_quantity}, confidence: ${payload.confidence.score}`,
      });

      setIsQuerying(false);
    }, 280);
  };

  const curlSnippet = `curl -X GET "https://api.inventoryintel.ng/api/v1/availability?sku=${selectedSku}&store=${currentStoreId}" \\
  -H "Authorization: Bearer ${business.apiKey || 'iip_live_sec_sandbox'}" \\
  -H "Content-Type: application/json"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(curlSnippet);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Pledge Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-sm text-white">
              Opt-In Inventory Availability API (Infrastructure for Consuming Platforms)
            </h3>
            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PRD Section 16 & 17
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Turns your store's inventory from a private silo into trusted infrastructure that patient
            discovery apps (e.g. <strong className="text-white">MediSwitch</strong>) and marketplaces can query in real time.
          </p>
        </div>

        {/* Opt-In Toggle */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
          <span className="text-xs font-semibold text-slate-300">
            {business.optedInApi ? 'Sharing Active' : 'Sharing Disabled'}
          </span>
          <button
            type="button"
            onClick={() => onToggleApiOptIn(!business.optedInApi)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 focus:outline-none ${
              business.optedInApi ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                business.optedInApi ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* PRD Section 17 Hard Boundary Box */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
        <div className="space-y-1 text-xs">
          <div className="font-bold text-amber-300">
            PRD Section 17 Architectural Rule: Quantity, Never Identity
          </div>
          <p className="text-slate-300 leading-relaxed">
            This API returns <strong className="text-white">sellable quantity and stock confidence</strong> only.
            It <strong className="text-red-400">never exposes cost price, profit margins, or supplier data</strong>,
            and <strong className="text-red-400">never makes clinical equivalence or drug substitutability claims</strong>.
            Any substitution logic stays strictly inside the consuming platform (such as MediSwitch).
          </p>
        </div>
      </div>

      {/* API Key Credentials Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Production API Secret Key
          </span>
          <button
            type="button"
            onClick={onRegenerateApiKey}
            className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Rotate Key
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 flex items-center justify-between">
            <span>
              {showApiKey
                ? business.apiKey || 'iip_live_sec_89df231c6a782e41'
                : 'iip_live_sec_••••••••••••••••••••••••'}
            </span>
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="text-slate-500 hover:text-slate-300"
            >
              {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive API Query Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Builder */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-white">
              Live Endpoint Sandbox
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="block text-slate-400">Select Test SKU</label>
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.sku}>
                    {p.sku} — {p.canonicalName}
                  </option>
                ))}
              </select>
            </div>

            {/* cURL Snippet */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span>cURL Request</span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  {copiedCurl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedCurl ? 'Copied' : 'Copy cURL'}
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                {curlSnippet}
              </pre>
            </div>

            <button
              type="button"
              disabled={isQuerying}
              onClick={handleTestQuery}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
            >
              {isQuerying ? 'Executing API Call...' : 'Execute GET /api/v1/availability'}
            </button>
          </div>
        </div>

        {/* Right: Live JSON Response Viewer */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                  JSON Response Payload
                </h4>
              </div>
              {apiResponse && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  HTTP 200 OK • 34ms
                </span>
              )}
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto min-h-[190px]">
              {apiResponse
                ? JSON.stringify(apiResponse, null, 2)
                : `// Click "Execute GET /api/v1/availability" to test\n// the real endpoint contract from PRD Section 16.`}
            </pre>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tested with downstream partner: MediSwitch Healthcare Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};
