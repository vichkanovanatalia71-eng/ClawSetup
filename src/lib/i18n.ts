import en from "@/messages/en.json";
import uk from "@/messages/uk.json";

export type Locale = "en" | "uk";
type Messages = typeof en;

const messages: Record<Locale, Messages> = { en, uk };

export function getMessages(locale: Locale): Messages {
  return messages[locale] || messages.en;
}

export function t(locale: Locale, key: string): string {
  const msgs = getMessages(locale);
  const keys = key.split(".");
  let result: unknown = msgs;
  for (const k of keys) {
    if (result && typeof result === "object" && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  return typeof result === "string" ? result : key;
}
