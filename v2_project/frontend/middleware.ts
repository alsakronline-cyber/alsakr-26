import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;
        const role = token?.role;

        // Protect Vendor Routes
        if (path.startsWith("/vendor") && role !== "vendor" && role !== "admin") {
            // Redirect non-vendors to dashboard or unauthorized page
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // Protect Admin Routes (if any)
        if (path.startsWith("/admin") && role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        "/command-center/:path*",
        "/vendor/:path*",
        "/product/:path*",
        "/dashboard/:path*",
    ],
};
