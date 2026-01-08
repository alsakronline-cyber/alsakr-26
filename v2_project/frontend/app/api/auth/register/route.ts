import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

// Use internal Docker network URL for server-side API routes
// NEXT_PUBLIC_PB_URL is for client-side, PB_INTERNAL_URL is for server-side
const pb = new PocketBase(process.env.PB_INTERNAL_URL || "http://pocketbase:8090");

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, passwordConfirm, name, company, phone, jobTitle, country } = body;

        // Validate required fields
        if (!email || !password || !passwordConfirm || !name || !company) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate password match
        if (password !== passwordConfirm) {
            return NextResponse.json(
                { error: "Passwords do not match" },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // Create user in PocketBase
        try {
            const record = await pb.collection("users").create({
                email,
                password,
                passwordConfirm,
                name,
                company,
                phone: phone || "",
                jobTitle: jobTitle || "",
                country: country || "",
                emailVisibility: true,
            });

            // Request email verification
            await pb.collection("users").requestVerification(email);

            return NextResponse.json({
                success: true,
                message: "Registration successful. Please check your email to verify your account.",
                userId: record.id,
            });
        } catch (pbError: any) {
            // Handle PocketBase-specific errors
            if (pbError.status === 400) {
                // Check for duplicate email
                if (pbError.data?.data?.email) {
                    return NextResponse.json(
                        { error: "This email is already registered" },
                        { status: 400 }
                    );
                }

                // Other validation errors
                const errorMessage = pbError.data?.message || "Invalid registration data";
                return NextResponse.json(
                    { error: errorMessage },
                    { status: 400 }
                );
            }

            // Server error
            console.error("PocketBase error:", pbError);
            return NextResponse.json(
                { error: "Registration failed. Please try again later." },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred. Please try again." },
            { status: 500 }
        );
    }
}
