"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const toggleLocale = () => {
    const next = locale === "en" ? "uk" : "en";
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`;
    router.refresh();
  };

  return (
    <button
      onClick={toggleLocale}
      className="neu-btn w-10 h-10 !p-0 rounded-xl flex items-center justify-center text-xs font-bold text-neu-muted hover:text-neu-text transition-colors"
      aria-label={locale === "en" ? "Перейти на українську" : "Switch to English"}
      title={locale === "en" ? "Українська" : "English"}
    >
      {locale === "en" ? "UK" : "EN"}
    </button>
  );
}
