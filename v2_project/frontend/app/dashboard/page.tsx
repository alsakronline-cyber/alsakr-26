"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { InquiryService } from '../services/InquiryService';

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({ inquiries: 0, quotes: 0, orders: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.email) {
            InquiryService.getMyInquiries(session.user.email)
                .then(inquiries => {
                    const activeQuotes = inquiries.filter(i => i.status === 'quoted').length;
                    setStats({
                        inquiries: inquiries.length,
                        quotes: activeQuotes,
                        orders: 0 // Orders logic to be implemented
                    });
                })
                .finally(() => setLoading(false));
        }
    }, [session]);

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Buyer Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-slate-500 text-sm font-medium mb-2">Total Inquiries</h3>
                    <p className="text-3xl font-bold text-slate-900">
                        {loading ? <span className="text-slate-300 animate-pulse">--</span> : stats.inquiries}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-slate-500 text-sm font-medium mb-2">Active Quotes</h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {loading ? <span className="text-blue-200 animate-pulse">--</span> : stats.quotes}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-slate-500 text-sm font-medium mb-2">Orders</h3>
                    <p className="text-3xl font-bold text-emerald-600">{stats.orders}</p>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <h2 className="text-lg font-bold text-blue-900 mb-2">Welcome to Al Sakr V2</h2>
                <p className="text-blue-700 mb-4">
                    Your command center for industrial procurement. Use the sidebar to track your inquiries or browse the catalog to make new requests.
                </p>
                <Link href="/command-center" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Go to Command Center
                </Link>
            </div>
        </div>
    );
}
