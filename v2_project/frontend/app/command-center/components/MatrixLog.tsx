"use client";

import React, { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

const SIMULATED_LOGS = [
    "[Orchestrator] Routing query to VisualMatch Agent...",
    "[VisualMatch] Image analysis complete. Part: SKF-6205-2RS1",
    "[MultiVendor] Querying 8 verified suppliers...",
    "[MultiVendor] Match found: Bearing House Co. | Stock: 45 units",
    "[QuoteCompare] Calculating landed cost with VAT...",
    "[SafeGuard] HS Code verified: 8482.10.50",
    "[Orchestrator] Negotiation initiated with 3 vendors",
    "[MultiVendor] Haggle Agent active on Vendor X",
    "[QuoteCompare] Best quote: $24.50 USD (Delivered)",
    "[SupplierHub] RFQ sent via white-label broker mode",
    "[TechAssistant] Extracting BOM from manual: pump_spec.pdf",
    "[Troubleshoot] Diagnostic complete: Replace bearing + coupling",
    "[LocalSourcer] Service provider found: 12km away",
    "[InventoryVoice] Stock level updated: -2 units SKF-6205",
];

export function MatrixLog() {
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        // Simulate live log streaming
        let index = 0;
        const interval = setInterval(() => {
            if (index < SIMULATED_LOGS.length) {
                setLogs(prev => [...prev, SIMULATED_LOGS[index]]);
                index++;
            } else {
                index = 0;
                setLogs([]);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#0F172A] border-r border-slate-800 flex flex-col h-full matrix-bg">
            {/* Header */}
            <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs text-emerald-400 font-bold tracking-widest uppercase">Live Agent Thoughts</span>
                <div className="ml-auto flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-500 font-mono">STREAMING</span>
                </div>
            </div>

            {/* Log Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono-term text-xs leading-relaxed">
                {logs.length === 0 && (
                    <div className="text-slate-600 italic">Waiting for agent activity...</div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className="text-slate-300 hover:text-emerald-400 transition-colors animate-fadeIn flex items-start gap-2">
                        <span className="text-slate-600 select-none">{String(i + 1).padStart(3, '0')}</span>
                        <span>{log}</span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="bg-slate-900/80 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>MESSAGES: {logs.length}</span>
                <span>LATENCY: 47ms</span>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}
