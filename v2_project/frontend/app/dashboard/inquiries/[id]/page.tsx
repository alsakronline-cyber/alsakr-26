"use client";

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { InquiryService, Inquiry, Quote, Message } from '../../../services/InquiryService';
import { Send, Clock, CheckCircle, XCircle, AlertCircle, ShoppingCart, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function InquiryDetailPage() {
    const { data: session } = useSession();
    const params = useParams();
    const id = params.id as string;
    const scrollRef = useRef<HTMLDivElement>(null);

    const [inquiry, setInquiry] = useState<Inquiry | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user && id) {
            const token = (session as any).accessToken || "";

            Promise.all([
                InquiryService.getInquiry(id, token),
                InquiryService.getQuotes(id, token),
                InquiryService.getChatHistory(id, token)
            ]).then(([inqData, quotesData, chatData]) => {
                setInquiry(inqData);
                setQuotes(quotesData);
                setMessages(chatData);
                setLoading(false);
            });
        }
    }, [session, id]);

    // Scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !session) return;

        // Optimistic UI update could happen here
        const token = (session as any).accessToken || "";
        try {
            await InquiryService.sendMessage({
                inquiry_id: id,
                sender_id: (session.user as any).id || 'buyer',
                sender_role: 'buyer',
                content: newMessage
            }, token);

            setNewMessage('');
            // Refresh chat
            const updatedChat = await InquiryService.getChatHistory(id, token);
            setMessages(updatedChat);
        } catch (err) {
            console.error(err);
        }
    };

    const handleQuoteAction = async (quoteId: string, action: 'accepted' | 'rejected') => {
        const token = (session as any).accessToken || "";
        if (confirm(`Are you sure you want to ${action.toUpperCase()} this quote?`)) {
            await InquiryService.updateQuoteStatus(quoteId, action, token);
            // Refresh data
            const updatedQuotes = await InquiryService.getQuotes(id, token);
            setQuotes(updatedQuotes);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!inquiry) return <div className="p-8">Inquiry not found.</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">

            {/* Left Column: Details & Quotes */}
            <div className="lg:col-span-2 space-y-6 overflow-auto pr-2">
                {/* Header */}
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Inquiry #{inquiry.id.substring(0, 8)}</h1>
                            <p className="text-slate-500 text-sm">Created on {new Date(inquiry.created).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${inquiry.status === 'quoted' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100'
                            }`}>
                            {inquiry.status.toUpperCase()}
                        </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">Requested Items:</h3>
                        <ul className="space-y-2">
                            {inquiry.products.map((p, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 bg-white border border-slate-200 rounded flex items-center justify-center shrink-0">
                                        📦
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{p.name || p.part_number}</p>
                                        <p className="text-xs text-slate-500">Qty: {p.quantity || 1}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Quotes Section */}
                <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" /> Received Quotes
                    </h2>

                    {quotes.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center text-amber-800">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="font-medium">No quotes received yet.</p>
                            <p className="text-sm">Vendors are reviewing your request. Use the chat to follow up.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quotes.map(quote => (
                                <div key={quote.id} className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-lg text-slate-900">{quote.currency} {quote.total_price.toLocaleString()}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${quote.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' :
                                                quote.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    'bg-slate-100 text-slate-500'
                                                }`}>
                                                {quote.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500">Valid until: {quote.valid_until || 'N/A'}</p>
                                        {quote.notes && <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded">Note: {quote.notes}</p>}
                                    </div>

                                    {quote.status.toLowerCase() === 'pending' && (
                                        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                            <button
                                                onClick={() => handleQuoteAction(quote.id, 'rejected')}
                                                className="px-6 py-2.5 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all hover:scale-105 active:scale-95"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleQuoteAction(quote.id, 'accepted')}
                                                className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                            >
                                                <span>Accept Offer</span>
                                                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                                    <span className="text-xs">✓</span>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Chat */}
            <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-full shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Discussion
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={scrollRef}>
                    {messages.length === 0 && (
                        <p className="text-center text-slate-400 text-sm py-8">No messages yet. Start the conversation!</p>
                    )}

                    {messages.map(msg => {
                        const isMe = msg.sender_role === 'buyer';
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                                    }`}>
                                    <p>{msg.content}</p>
                                    <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                        {new Date(msg.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
                    <div className="relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message to vendors..."
                            className="w-full pl-4 pr-12 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
}
