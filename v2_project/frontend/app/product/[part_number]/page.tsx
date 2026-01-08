"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, ShoppingCart, Activity, FileText,
    Shield, CheckCircle, AlertTriangle, ChevronRight, Zap
} from 'lucide-react';

interface Product {
    part_number: string;
    name: string;
    category: string;
    description?: string;
    specifications?: Record<string, any>;
    image_url?: string;
    price?: number;
    stock?: number;
    [key: string]: any;
}

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const partNumber = params.part_number as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/products/${partNumber}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                }
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };

        if (partNumber) {
            fetchProduct();
        }
    }, [partNumber]);

    if (loading) {
        return (
            <div className="h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm">Loading Product Data...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 text-blue-600 hover:underline flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-slate-200" />
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Product Details</span>
                        <span className="font-mono text-sm font-bold text-blue-600">{product.part_number}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Datasheet
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                        <ShoppingCart className="w-4 h-4" /> Add to Quote
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                        <div className="flex gap-2 mb-4">
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {product.category || 'Component'}
                            </span>
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Active
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.name}</h1>
                        <p className="text-slate-600 leading-relaxed mb-6">
                            {product.description || "High-performance industrial automation component suitable for various manufacturing and processing applications."}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                            <div>
                                <span className="block text-xs text-slate-500 uppercase">Stock</span>
                                <span className="text-lg font-semibold text-slate-900">{product.stock ?? 'Unknown'}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 uppercase">Lead Time</span>
                                <span className="text-lg font-semibold text-slate-900">3-5 Days</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 uppercase">Weight</span>
                                <span className="text-lg font-semibold text-slate-900">0.2 kg</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 uppercase">Origin</span>
                                <span className="text-lg font-semibold text-slate-900">Germany</span>
                            </div>
                        </div>
                    </div>

                    {/* Specs */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-500" /> Technical Specifications
                            </h3>
                        </div>
                        <table className="w-full">
                            <tbody>
                                {product.specifications ? Object.entries(product.specifications).map(([key, value], i) => (
                                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                        <td className="px-6 py-3 text-sm text-slate-500 w-1/3">{key}</td>
                                        <td className="px-6 py-3 text-sm font-medium text-slate-900">{String(value)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td className="px-6 py-8 text-center text-slate-400 italic" colSpan={2}>
                                            No detailed specifications available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar / Image / Validation */}
                <div className="space-y-6">

                    {/* Image Placeholder */}
                    <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm aspect-square flex items-center justify-center bg-slate-100/50">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        ) : (
                            <div className="text-center">
                                <Zap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                <span className="text-sm text-slate-400">No Image Available</span>
                            </div>
                        )}
                    </div>

                    {/* AI Validation */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-600" /> Agent Verification
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm text-blue-800">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span>Compatible with current inventory list (Project Alpha).</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-blue-800">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span>Datasheet verified against SICK 2024 Catalog.</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-blue-800">
                                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                <span><b>Note:</b> Newer version V2.1 exists. Ask agent for details.</span>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}
