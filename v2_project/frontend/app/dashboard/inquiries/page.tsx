"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { InquiryService, Inquiry } from '../../services/InquiryService';
import { Clock, CheckCircle, XCircle, ChevronRight, Loader2 } from 'lucide-react';

export default function InquiriesPage() {
    const { data: session } = useSession();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.email) {
            // Use email as buyer_id (this matches what's stored when creating inquiries)
            InquiryService.getMyInquiries(session.user.email)
                .then(setInquiries)
                .finally(() => setLoading(false));
        }
    }, [session]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'quoted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'closed': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">My Inquiries</h1>

            {inquiries.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                    <p className="text-slate-500 mb-4">You haven't made any inquiries yet.</p>
                    <Link href="/command-center" className="text-blue-600 font-medium hover:underline">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 ml-2">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">ID</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Item(s)</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {inquiries.map((inq) => (
                                <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                        #{inq.id.substring(0, 8)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">
                                            {inq.products?.[0]?.name || 'Unknown Item'}
                                        </div>
                                        {inq.products?.length > 1 && (
                                            <div className="text-xs text-slate-500">
                                                + {inq.products.length - 1} more items
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(inq.created).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(inq.status)}`}>
                                            {inq.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                            {inq.status === 'quoted' && <CheckCircle className="w-3 h-3 mr-1" />}
                                            {inq.status.charAt(0).toUpperCase() + inq.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/dashboard/inquiries/${inq.id}`} className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                                            Details <ChevronRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
