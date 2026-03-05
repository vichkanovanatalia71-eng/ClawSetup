import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes require admin role
    if (pathname.startsWith("/admin")) {
      if (!token?.role || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(token.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes
        if (
          pathname === "/" ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/register") ||
          pathname.startsWith("/api/stripe/webhook") ||
          pathname.startsWith("/api/cron") ||
          pathname.startsWith("/api/health") ||
          pathname === "/login" ||
          pathname === "/register" ||
          pathname === "/terms" ||
          pathname === "/privacy"
        ) {
          return true;
        }

        // Protected routes require auth
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/instruction/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/api/ai/:path*",
    "/api/progress/:path*",
    "/api/stripe/checkout/:path*",
    "/api/stripe/portal/:path*",
    "/api/admin/:path*",
  ],
};
