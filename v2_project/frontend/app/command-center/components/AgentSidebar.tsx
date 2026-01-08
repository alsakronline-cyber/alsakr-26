import React from 'react';
import { Cpu, Activity, ShoppingCart, Search, FileText, Globe, Wrench, AlertTriangle, UserCheck, Shield } from 'lucide-react';

const AGENTS = [
    { id: 1, name: 'Orchestrator', role: 'Supervisor', icon: Activity, status: 'thinking' },
    { id: 2, name: 'VisualMatch', role: 'Computer Vision', icon: UserCheck, status: 'idle' },
    { id: 3, name: 'MultiVendor', role: 'Sourcing', icon: Globe, status: 'active' },
    { id: 4, name: 'QuoteCompare', role: 'Finance', icon: ShoppingCart, status: 'idle' },
    { id: 5, name: 'SafeGuard', role: 'Compliance', icon: Shield, status: 'idle' },
    { id: 6, name: 'TechAssistant', role: 'Documentation', icon: FileText, status: 'idle' },
    { id: 7, name: 'InventoryVoice', role: 'WMS', icon: Search, status: 'idle' },
    { id: 8, name: 'LocalSourcer', role: 'Services', icon: Wrench, status: 'idle' },
    { id: 9, name: 'Troubleshoot', role: 'Engineering', icon: AlertTriangle, status: 'idle' },
    { id: 10, name: 'SupplierHub', role: 'CRM', icon: Cpu, status: 'idle' },
];

export function AgentSidebar() {
    return (
        <div className="bg-[#1E293B] border-r border-slate-700 p-4 flex flex-col h-full">
            <div className="mb-8 flex items-center gap-3 text-cyan-400">
                <Cpu className="w-6 h-6" />
                <span className="font-bold tracking-wider font-mono-term text-sm">ACTIVE AGENTS</span>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {AGENTS.map((agent) => (
                    <div key={agent.id} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800 transition-all border border-transparent hover:border-slate-600 cursor-pointer">
                        <div className="relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700`}>
                                <agent.icon className={`w-5 h-5 ${agent.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`} />
                            </div>
                            {/* Status Ring */}
                            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1E293B] ${agent.status === 'active' ? 'bg-emerald-500 animate-pulse' :
                                    agent.status === 'thinking' ? 'bg-amber-500 animate-bounce' : 'bg-slate-600'
                                }`} />
                        </div>

                        <div>
                            <div className="font-bold text-slate-200 text-sm group-hover:text-cyan-400 transition-colors">{agent.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">{agent.role}</div>
                        </div>

                        {agent.status === 'thinking' && (
                            <div className="ml-auto w-1 h-1 bg-amber-500 rounded-full animate-ping" />
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-700">
                <div className="text-[10px] text-slate-500 font-mono text-center">
                    SWARM LATENCY: <span className="text-emerald-500">24ms</span>
                </div>
            </div>
        </div>
    );
}
