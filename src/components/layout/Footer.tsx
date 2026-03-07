"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-neu-bg mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="rounded-2xl shadow-neu p-5 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-brand-600 shadow-neu-xs flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CS</span>
                </div>
                <span className="font-bold text-lg text-neu-text">ClawSetup</span>
              </div>
              <p className="text-neu-muted text-sm leading-relaxed">
                {t("description")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-neu-text mb-3">{t("product")}</h3>
              <ul className="space-y-2 text-sm text-neu-muted">
                <li>
                  <Link href="/#features" className="hover:text-neu-text transition-colors duration-200">
                    {t("features")}
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="hover:text-neu-text transition-colors duration-200">
                    {t("pricing")}
                  </Link>
                </li>
                <li>
                  <Link href="/#faq" className="hover:text-neu-text transition-colors duration-200">
                    {t("faq")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-neu-text mb-3">{t("legal")}</h3>
              <ul className="space-y-2 text-sm text-neu-muted">
                <li>
                  <Link href="/terms" className="hover:text-neu-text transition-colors duration-200">
                    {t("terms")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-neu-text transition-colors duration-200">
                    {t("privacy")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neu-dark/20 text-center text-sm text-neu-muted">
            &copy; {new Date().getFullYear()} ClawSetup. {t("rights")}
          </div>
        </div>
      </div>
    </footer>
  );
}
