import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const ERPNEXT_URL = process.env.NEXT_PUBLIC_ERP_URL || "http://erpnext-backend:8000";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "ERPNext",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    // TODO: Implement actual ERPNext login call
                    // const res = await fetch(`${ERPNEXT_URL}/api/method/login`, {
                    //     method: 'POST',
                    //     headers: { 'Content-Type': 'application/json' },
                    //     body: JSON.stringify({
                    //         usr: credentials.email,
                    //         pwd: credentials.password
                    //     })
                    // });
                    
                    // Mock Success for now until ERPNext is fully configured
                    if (credentials.email === "admin@alsakronline.com") {
                        return {
                            id: "1",
                            email: credentials.email,
                            name: "Administrator",
                            role: "admin",
                            token: "mock-token"
                        };
                    }
                    
                    return null;
                } catch (error) {
                    throw new Error("Invalid email or password");
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.accessToken = (user as any).token;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                (session as any).user.id = token.id;
                (session as any).user.role = token.role;
                (session as any).user.accessToken = token.accessToken;
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "CHANGE_ME",
};
