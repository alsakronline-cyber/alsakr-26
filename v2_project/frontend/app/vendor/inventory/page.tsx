"use client";

import { Package, Search, Plus } from 'lucide-react';

export default function VendorInventoryPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Inventory</h1>
                    <p className="text-slate-500">Manage your stock levels and custom pricing.</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Inventory System Coming Soon</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                    Phase 3.2 Inventory Management is currently under development. Soon you will be able to upload your stock sheets and set automated pricing rules.
                </p>
                <button className="text-blue-600 font-medium hover:underline">
                    Learn about the Roadmap
                </button>
            </div>
        </div>
    );
}
