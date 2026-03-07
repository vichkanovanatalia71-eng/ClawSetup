import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-2xl shadow-neu mx-auto mb-6 flex items-center justify-center">
          <span className="text-4xl font-bold text-neu-muted">404</span>
        </div>
        <h1 className="text-2xl font-bold text-neu-text mb-2">{t("notFound")}</h1>
        <p className="text-neu-muted text-sm mb-8">
          {t("notFoundDescription")}
        </p>
        <Link
          href="/"
          className="neu-btn-primary rounded-full px-8 py-3 inline-block"
        >
          {t("goHome")}
        </Link>
      </div>
    </div>
  );
}
