import { LOCALE_KEY } from "../storage-keys";
import { stored } from "../stored";
import { en } from "./en";
import { es } from "./es";

export type Locale = "en" | "es";

export const LOCALES: Record<Locale, string> = { en: "English", es: "Español" };

/** English unless the person switches; the choice is remembered. */
const locale = stored<Locale>({
  key: LOCALE_KEY,
  fallback: "en",
  parse: (raw) => (raw === "en" || raw === "es" ? raw : null),
});

export const setLocale = locale.set;

/** The current language. `<html lang>` follows it from `App`. */
export const useLocale = locale.use;

const MESSAGES = { en, es };

/** The interface texts in the current language. */
export function useMessages() {
  return MESSAGES[useLocale()];
}
