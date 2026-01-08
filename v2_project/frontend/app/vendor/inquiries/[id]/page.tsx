"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, CheckCircle, AlertCircle } from 'lucide-react';

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

export default function VendorInquiryDetail() {
    const params = useParams();
    const router = useRouter();
    const inquiryId = params.id as string;

    const [inquiry, setInquiry] = useState<Inquiry | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Quote form state
    const [price, setPrice] = useState('');
    const [leadTime, setLeadTime] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchInquiry = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/inquiries/${inquiryId}`);
                if (res.ok) {
                    const data = await res.json();
                    setInquiry(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        if (inquiryId) fetchInquiry();
    }, [inquiryId]);

    const handleSubmitQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/quotes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inquiry_id: inquiryId,
                    vendor_id: 'current_vendor',  // TODO: Get from session
                    price: parseFloat(price),
                    lead_time: leadTime,
                    notes: notes
                })
            });

            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => router.push('/vendor/dashboard'), 2000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-400">Loading inquiry...</div>
            </div>
        );
    }

    if (!inquiry) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-slate-600">Inquiry not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => router.push('/vendor/dashboard')}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>

                {submitted ? (
                    <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Quote Submitted!</h2>
                        <p className="text-slate-600">Redirecting to dashboard...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Inquiry Details */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-500" />
                                Request Details
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Request ID</label>
                                    <p className="font-mono text-sm text-slate-600">#{inquiry.id.substring(0, 8)}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Buyer</label>
                                    <p className="text-sm text-slate-600">{maskEmail(inquiry.buyer_id)}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Products</label>
                                    {Array.isArray(inquiry.products) && inquiry.products.map((p, idx) => (
                                        <div key={idx} className="mt-2 p-3 bg-slate-50 rounded-lg">
                                            <p className="font-semibold text-slate-900">{p.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{p.part_number}</p>
                                            {p.quantity && (
                                                <p className="text-sm text-blue-600 font-bold mt-1">Quantity: {p.quantity}x</p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message</label>
                                    <p className="text-sm text-slate-600 mt-1">{inquiry.message || 'No additional notes'}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</label>
                                    <p className="text-sm text-slate-600">{new Date(inquiry.created).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Quote Form */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Submit Your Quote</h2>

                            <form onSubmit={handleSubmitQuote} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Total Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Lead Time
                                    </label>
                                    <select
                                        value={leadTime}
                                        onChange={(e) => setLeadTime(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select lead time</option>
                                        <option value="In Stock">In Stock (Same Day)</option>
                                        <option value="2 Days">2 Days</option>
                                        <option value="5 Days">5 Days</option>
                                        <option value="10 Days">10 Days</option>
                                        <option value="2 Weeks">2 Weeks</option>
                                        <option value="1 Month">1 Month</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Warranty, shipping details, payment terms..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-lg transition-colors"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Quote'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
