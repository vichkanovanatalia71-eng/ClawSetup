"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CS</span>
              </div>
              <span className="font-bold text-xl text-gray-900">ClawSetup</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Profile
                </Link>
                {(session.user.role === "ADMIN" ||
                  session.user.role === "SUPERADMIN") && (
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/#pricing"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Pricing
                </Link>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-600 p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {session ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded">Dashboard</Link>
                <Link href="/profile" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded">Profile</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded">Sign In</Link>
                <Link href="/register" className="block px-3 py-2 bg-brand-600 text-white rounded text-center">Get Started</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
