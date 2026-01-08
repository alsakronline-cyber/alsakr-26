import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, passwordConfirm, name, company } = body;

        // Validate required fields
        if (!email || !password || !passwordConfirm || !name || !company) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Registration is currently disabled pending ERPNext integration." },
            { status: 503 }
        );

    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred. Please try again." },
            { status: 500 }
        );
    }
}
