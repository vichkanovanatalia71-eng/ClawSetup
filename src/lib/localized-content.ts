import { cookies } from "next/headers";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

/**
 * Get the current locale from cookies/headers (server-side).
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("NEXT_LOCALE")?.value;
  if (cookie && locales.includes(cookie as Locale)) {
    return cookie as Locale;
  }
  return defaultLocale;
}

/**
 * Pick the localized value of a field.
 * For Ukrainian locale, returns the *Uk field if available, otherwise falls back to the base field.
 *
 * Usage:
 *   localized(step, "title", locale)    // returns step.titleUk || step.title
 *   localized(step, "contentMd", locale) // returns step.contentMdUk || step.contentMd
 */
export function localized<T extends Record<string, unknown>>(
  obj: T,
  field: string,
  locale: Locale,
): string {
  if (locale === "uk") {
    const ukField = `${field}Uk` as keyof T;
    const ukValue = obj[ukField];
    if (typeof ukValue === "string" && ukValue.length > 0) {
      return ukValue;
    }
  }
  const value = obj[field as keyof T];
  return typeof value === "string" ? value : "";
}
