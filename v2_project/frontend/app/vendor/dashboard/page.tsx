"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Filter, CheckCircle, Clock, LayoutGrid, FileText, Settings, Bell, Zap, Users, Shield } from 'lucide-react';

interface Inquiry {
    id: string;
    buyer_id: string;
    products: any[];
    message: string;
    status: string;
    created: string;
}

const maskEmail = (email: string) => {
    if (!email || !email.includes('@')) return 'Buyer';
    const [local, domain] = email.split('@');
    const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
    return `${maskedLocal}@${domain}`;
};

export default function VendorDashboard() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/inquiries`);
                const data = await res.json();
                setInquiries(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchInquiries();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
            {/* Sidebar */}
            <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-4 shadow-sm z-20">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <LayoutGrid className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 flex flex-col gap-3 mt-4">
                    {[Zap, FileText, Shield, Users].map((Icon, i) => (
                        <button key={i} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                            <Icon className="w-5 h-5" />
                        </button>
                    ))}
                </div>
                <div className="flex flex-col gap-3">
                    <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10">
                    <h1 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Vendor Portal <span className="text-blue-200 mx-2">|</span> All Inquiries</h1>
                    <div className="flex items-center gap-4">
                        <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="w-9 h-9 bg-slate-200 rounded-full" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="font-bold text-slate-700 flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-500" />
                                All Market Requests ({inquiries.length})
                            </h2>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                    <Filter className="w-3 h-3" /> Filter
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3">Request ID</th>
                                        <th className="px-6 py-3">Buyer</th>
                                        <th className="px-6 py-3">Products</th>
                                        <th className="px-6 py-3">Quantity</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Loading inquiries...</td></tr>
                                    ) : inquiries.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No new inquiries found.</td></tr>
                                    ) : (
                                        inquiries.map((inquiry) => (
                                            <tr key={inquiry.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">#{inquiry.id.substring(0, 8)}</td>
                                                <td className="px-6 py-4 font-medium text-slate-600">{maskEmail(inquiry.buyer_id)}</td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {Array.isArray(inquiry.products) ? inquiry.products.map((p, idx) => (
                                                        <div key={p.part_number || idx} className="text-xs">
                                                            {p.name} <span className="text-slate-400">({p.part_number})</span>
                                                        </div>
                                                    )) : <div className="text-xs text-red-400">Invalid product data</div>}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                                    {Array.isArray(inquiry.products) && inquiry.products[0]?.quantity ?
                                                        `${inquiry.products[0].quantity}x` : '1x'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize
                                                ${inquiry.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                            inquiry.status === 'quoted' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        {inquiry.status === 'pending' && <Clock className="w-3 h-3" />}
                                                        {inquiry.status === 'quoted' && <CheckCircle className="w-3 h-3" />}
                                                        {inquiry.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-xs">
                                                    {new Date(inquiry.created).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/vendor/inquiries/${inquiry.id}`}>
                                                        <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors">
                                                            Submit Quote
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
