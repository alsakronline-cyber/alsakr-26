"use client";

import React from 'react';

export default function VendorMarketplace() {
    return (
        <div className="min-h-screen bg-neutral-900 text-white p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Vendor Marketplace & Inventory</h1>
                <div className="flex gap-4">
                    <button className="bg-emerald-600 px-4 py-2 rounded font-bold ">BULK STOCK UPLOAD</button>
                    <div className="bg-slate-800 px-4 py-2 rounded text-sm">Verified Vendor: Al-Amal Trading</div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* RFQ FEED */}
                <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
                    <h2 className="text-lg font-bold mb-4 border-b border-neutral-700 pb-2">Open Inquiries (Blind Feed)</h2>
                    <div className="space-y-4">
                        <MarketplaceItem title="500x SKF Bearings" location="Riyadh Region" deadline="2h 15m" />
                        <MarketplaceItem title="Project: Neom Ph-1 - 50 Pumps" location="Neom / Tabuk" deadline="4d" />
                    </div>
                </div>

                {/* INVENTORY MANAGER */}
                <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
                    <h2 className="text-lg font-bold mb-4 border-b border-neutral-700 pb-2">My Inventory</h2>
                    <div className="text-neutral-500 text-center py-12">
                        You have 1,450 SKUs listed. <br />
                        Next auto-sync with <strong>Al Sakr Agents</strong> in 12 minutes.
                    </div>
                </div>
            </div>
        </div>
    );
}

interface MarketplaceItemProps {
    title: string;
    location: string;
    deadline: string;
}

function MarketplaceItem({ title, location, deadline }: MarketplaceItemProps) {
    return (
        <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 flex justify-between items-center">
            <div>
                <div className="font-bold text-blue-400">{title}</div>
                <div className="text-xs text-neutral-500">{location} | Closing in: {deadline}</div>
            </div>
            <button className="bg-white text-black px-4 py-1 rounded text-sm font-bold">QUOTE</button>
        </div>
    )
}
