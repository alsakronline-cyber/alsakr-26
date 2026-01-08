import { getSession } from "next-auth/react";

const normalizeUrl = (url: string) => url.endsWith('/') ? url.slice(0, -1) : url;
const API_URL = normalizeUrl(process.env.NEXT_PUBLIC_API_URL || "https://app.alsakronline.com");

export interface Inquiry {
    id: string;
    buyer_id: string;
    products: any[];
    message: string;
    status: 'pending' | 'quoted' | 'closed';
    created: string;
}

export interface Quote {
    id: string;
    inquiry_id: string;
    vendor_id: string;
    items: any[];
    total_price: number;
    currency: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    valid_until?: string;
    notes?: string;
    created: string;
}

export interface Message {
    id: string;
    inquiry_id: string;
    sender_id: string;
    sender_role: 'buyer' | 'vendor';
    content: string;
    read: boolean;
    created: string;
}

export const InquiryService = {
    // Get all inquiries for the current buyer
    async getMyInquiries(buyerId: string): Promise<Inquiry[]> {
        const res = await fetch(`${API_URL}/api/inquiries/buyer/${buyerId}`);
        if (!res.ok) return [];
        return await res.json();
    },

    // Get details of a single inquiry
    async getInquiry(id: string, token: string): Promise<Inquiry | null> {
        const res = await fetch(`${API_URL}/api/inquiries/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) return null;
        return await res.json();
    },

    // Get quotes for an inquiry
    async getQuotes(inquiryId: string, token: string): Promise<Quote[]> {
        const res = await fetch(`${API_URL}/api/quotes/inquiry/${inquiryId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) return [];
        return await res.json();
    },

    // Accept/Reject a quote
    async updateQuoteStatus(quoteId: string, status: 'accepted' | 'rejected', token: string) {
        const res = await fetch(`${API_URL}/api/quotes/${quoteId}/status`, {
            method: 'PATCH',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status })
        });
        return res.json();
    },

    // Get chat history
    async getChatHistory(inquiryId: string, token: string): Promise<Message[]> {
        const res = await fetch(`${API_URL}/api/chat/history/${inquiryId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) return [];
        return await res.json();
    },

    // Send a message
    async sendMessage(msg: { inquiry_id: string, sender_id: string, sender_role: 'buyer' | 'vendor', content: string }, token: string) {
        const res = await fetch(`${API_URL}/api/chat/message`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(msg)
        });
        return res.json();
    }
};
