"use client";

import React, { useState } from 'react';
import { Package, FileText, DollarSign, Image, AlertCircle } from 'lucide-react';

const TABS = [
    { id: 'task', label: 'Current Task', icon: Package },
    { id: 'docs', label: 'Tech Docs', icon: FileText },
    { id: 'quotes', label: 'Price Compare', icon: DollarSign },
];

export function ActionPanel() {
    const [activeTab, setActiveTab] = useState('task');

    return (
        <div className="bg-[#1E293B] flex flex-col h-full">
            {/* Tabs */}
            <div className="flex border-b border-slate-700">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-3 text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                                ? 'bg-slate-900 text-cyan-400 border-b-2 border-cyan-400'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                            }`}
                    >
                        <tab.icon className="w-3 h-3" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'task' && <CurrentTask />}
                {activeTab === 'docs' && <TechDocs />}
                {activeTab === 'quotes' && <PriceCompare />}
            </div>
        </div>
    );
}

function CurrentTask() {
    return (
        <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="w-24 h-24 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                        <Image className="w-8 h-8 text-slate-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white mb-1">SKF-6205-2RS1</h3>
                        <p className="text-xs text-slate-400 mb-2">Deep Groove Ball Bearing</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded">IN STOCK</span>
                            <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-mono rounded">HS: 8482.10.50</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Specifications</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-slate-500">Material:</span> <span className="text-white">Chrome Steel</span></div>
                    <div><span className="text-slate-500">Bore:</span> <span className="text-white">25mm</span></div>
                    <div><span className="text-slate-500">OD:</span> <span className="text-white">52mm</span></div>
                    <div><span className="text-slate-500">Width:</span> <span className="text-white">15mm</span></div>
                </div>
            </div>
        </div>
    );
}

function TechDocs() {
    return (
        <div className="space-y-3">
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-cyan-500/50 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-white mb-1">SKF_Bearing_Manual.pdf</h4>
                        <p className="text-xs text-slate-400">Installation guide and BOM</p>
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-cyan-500/50 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-white mb-1">Assembly_Drawing.dwg</h4>
                        <p className="text-xs text-slate-400">Technical specifications</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PriceCompare() {
    const quotes = [
        { vendor: 'Bearing House Co.', price: 24.50, leadTime: '3 days', stock: 45, verified: true },
        { vendor: 'Global Industrial', price: 26.80, leadTime: '5 days', stock: 120, verified: true },
        { vendor: 'SKF Official', price: 32.00, leadTime: '2 days', stock: 200, verified: true },
    ];

    return (
        <div className="space-y-2">
            {quotes.map((quote, i) => (
                <div key={i} className={`bg-slate-900/50 border rounded-xl p-4 transition-all ${i === 0
                        ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white text-sm">{quote.vendor}</h4>
                        {quote.verified && (
                            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[9px] font-mono rounded">VERIFIED</span>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                            <div className="text-slate-500 text-[10px]">Price</div>
                            <div className="text-white font-bold">${quote.price}</div>
                        </div>
                        <div>
                            <div className="text-slate-500 text-[10px]">Lead Time</div>
                            <div className="text-white">{quote.leadTime}</div>
                        </div>
                        <div>
                            <div className="text-slate-500 text-[10px]">Stock</div>
                            <div className="text-white">{quote.stock}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
