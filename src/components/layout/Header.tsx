"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useTranslations } from "next-intl";

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("common");

  return (
    <header className="sticky top-0 z-50 pt-4 px-4">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
        {t("skipToContent")}
      </a>
      <nav className="max-w-7xl mx-auto bg-[#e0e5ec] rounded-2xl shadow-neu-sm px-6">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-brand-600 shadow-neu-xs flex items-center justify-center">
                <span className="text-white font-bold text-sm">CS</span>
              </div>
              <span className="font-bold text-xl text-neu-text">ClawSetup</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="neu-nav-item"
                >
                  {t("dashboard")}
                </Link>
                <Link
                  href="/profile"
                  className="neu-nav-item"
                >
                  {t("profile")}
                </Link>
                {(session.user.role === "ADMIN" ||
                  session.user.role === "SUPERADMIN") && (
                  <Link
                    href="/admin"
                    className="neu-nav-item"
                  >
                    {t("admin")}
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="neu-nav-item"
                >
                  {t("signOut")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/#pricing"
                  className="neu-nav-item"
                >
                  {t("pricing")}
                </Link>
                <Link
                  href="/login"
                  className="neu-nav-item"
                >
                  {t("signIn")}
                </Link>
                <Link
                  href="/register"
                  className="neu-btn-primary rounded-full px-6 py-2.5 text-sm"
                >
                  {t("getStarted")}
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="neu-btn w-10 h-10 !p-0 rounded-xl flex items-center justify-center"
            >
              <svg className="h-5 w-5 text-neu-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              id="mobile-nav"
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 space-y-2">
                {session ? (
                  <>
                    <Link href="/dashboard" className="block neu-nav-item">{t("dashboard")}</Link>
                    <Link href="/profile" className="block neu-nav-item">{t("profile")}</Link>
                    {(session.user.role === "ADMIN" ||
                      session.user.role === "SUPERADMIN") && (
                      <Link href="/admin" className="block neu-nav-item">{t("admin")}</Link>
                    )}
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left neu-nav-item">{t("signOut")}</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block neu-nav-item">{t("signIn")}</Link>
                    <Link href="/register" className="block neu-btn-primary rounded-xl text-center py-3">{t("getStarted")}</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
