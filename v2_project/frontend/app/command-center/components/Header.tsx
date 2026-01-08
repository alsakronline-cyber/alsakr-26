"use client";

import React, { useState } from 'react';
import { Search, Mic, Bell, Settings } from 'lucide-react';

export function Header() {
    const [isListening, setIsListening] = useState(false);

    return (
        <div className="bg-[#1E293B] border-b border-slate-700 px-6 flex items-center justify-between h-16">
            {/* Left: Logo */}
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
                    <span className="font-black text-white text-sm">AS</span>
                </div>
                <div>
                    <h1 className="font-black text-lg text-white tracking-tight">AL SAKR <span className="text-cyan-400">V2</span></h1>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Command Center</p>
                </div>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-2xl mx-8">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search parts, vendors, or ask AI..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:bg-slate-900 transition-all"
                    />
                </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-4">
                {/* Voice Control */}
                <button
                    onClick={() => setIsListening(!isListening)}
                    className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isListening
                            ? 'bg-amber-500/20 border border-amber-500/50 text-amber-500'
                            : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50'
                        }`}
                >
                    <Mic className="w-4 h-4" />
                    {isListening && (
                        <div className="absolute inset-0 rounded-xl bg-amber-500/20 animate-pulse" />
                    )}
                </button>

                {/* Notifications */}
                <button className="relative w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all">
                    <Bell className="w-4 h-4" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#1E293B]" />
                </button>

                {/* Settings */}
                <button className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all">
                    <Settings className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
