"use client";

import React from 'react';
import Link from 'next/link';
import {
    ShieldCheck,
    Store,
    ArrowRight,
    LayoutDashboard
} from 'lucide-react';
import { ThemeToggle } from '../components/ui/theme-toggle';

export default function EntryPortal() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
            {/* Minimal Header */}
            <header className="px-8 py-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-white">AS</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">Al Sakr Online</span>
                </div>
                <ThemeToggle />
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="text-center mb-12 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        Choose Your Path
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        Select your role to access the dedicated workspace.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
                    {/* Buyer Card */}
                    <Link href="/command-center" className="group relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 h-full hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 flex flex-col">
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <LayoutDashboard className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Buyer Command Center</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 flex-1">
                                Access AI-powered procurement, search specifically for industrial parts, and manage your RFQs.
                            </p>
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                                Enter Workspace <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </Link>

                    {/* Vendor Card */}
                    <Link href="/vendor/marketplace" className="group relative">
                        <div className="absolute inset-0 bg-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 h-full hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 flex flex-col">
                            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Store className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Vendor Portal</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 flex-1">
                                List your inventory, respond to RFQs, and manage your digital storefront.
                            </p>
                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                                Manage Shop <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-slate-400 dark:text-slate-600 text-sm">
                <div className="flex justify-center gap-4 mb-2">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure Environment</span>
                </div>
                © 2025 Al Sakr Online System
            </footer>
        </div>
    );
}
