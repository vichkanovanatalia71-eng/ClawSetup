import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const LOCALES = ["en", "uk"];
const DEFAULT_LOCALE = "en";

function detectLocale(req: { cookies: { get: (name: string) => { value: string } | undefined }; headers: { get: (name: string) => string | null } }): string {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && LOCALES.includes(cookie)) return cookie;

  const acceptLang = req.headers.get("accept-language") || "";
  const preferred = acceptLang
    .split(",")
    .map((part) => part.split(";")[0].trim().substring(0, 2).toLowerCase())
    .find((lang) => LOCALES.includes(lang));

  return preferred || DEFAULT_LOCALE;
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    const response = NextResponse.next();

    // Set locale cookie if not present
    if (!req.cookies.get("NEXT_LOCALE")?.value) {
      const locale = detectLocale(req);
      response.cookies.set("NEXT_LOCALE", locale, {
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
        sameSite: "lax",
      });
    }

    // Admin routes require admin role
    if (pathname.startsWith("/admin")) {
      if (!token?.role || !["ADMIN", "SUPERADMIN", "EDITOR"].includes(token.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return response;
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
    "/",
    "/login",
    "/register",
    "/terms",
    "/privacy",
    "/forgot-password",
    "/reset-password",
    "/dashboard/:path*",
    "/instruction/:path*",
    "/profile/:path*",
    "/certificates/:path*",
    "/admin/:path*",
    "/api/ai/:path*",
    "/api/progress/:path*",
    "/api/stripe/checkout/:path*",
    "/api/stripe/portal/:path*",
    "/api/admin/:path*",
  ],
};
