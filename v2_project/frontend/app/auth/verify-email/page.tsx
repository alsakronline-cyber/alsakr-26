"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import PocketBase from "pocketbase";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get("token");

            if (!token) {
                setStatus("error");
                setMessage("Invalid verification link. Please check your email and try again.");
                return;
            }

            try {
                const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL || "http://127.0.0.1:8090");

                // Confirm email verification
                await pb.collection("users").confirmVerification(token);

                setStatus("success");
                setMessage("Your email has been successfully verified!");

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push("/auth/login?verified=true");
                }, 3000);
            } catch (error: any) {
                console.error("Verification error:", error);
                setStatus("error");

                if (error.status === 404) {
                    setMessage("Verification link has expired or is invalid. Please request a new one.");
                } else {
                    setMessage("Verification failed. Please try again or contact support.");
                }
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center"
            >
                {status === "verifying" && (
                    <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <Loader2 className="w-12 h-12 text-blue-400" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-white mb-3">Verifying Your Email</h2>
                        <p className="text-slate-300">Please wait while we confirm your email address...</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle2 className="w-12 h-12 text-green-400" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-white mb-3">Email Verified!</h2>
                        <p className="text-slate-300 mb-6">{message}</p>
                        <p className="text-slate-400 text-sm mb-6">You can now log in to access the platform.</p>
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
                        >
                            <Mail className="w-5 h-5" />
                            Go to Login
                        </Link>
                        <div className="text-xs text-slate-500 mt-4">Redirecting automatically...</div>
                    </>
                )}

                {status === "error" && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                            className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <XCircle className="w-12 h-12 text-red-400" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-white mb-3">Verification Failed</h2>
                        <p className="text-slate-300 mb-6">{message}</p>
                        <div className="space-y-3">
                            <Link
                                href="/auth/login"
                                className="block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
                            >
                                Go to Login
                            </Link>
                            <Link
                                href="/auth/register"
                                className="block px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
                            >
                                Register Again
                            </Link>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
