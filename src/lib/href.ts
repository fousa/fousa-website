/**
 * Build a locale-aware path. English (default) is unprefixed; Dutch gets `/nl`.
 *
 * @param locale - target locale
 * @param path - path without locale prefix (e.g. "/" or "/about" or "/work/vulture")
 * @returns the localized href
 */
import { defaultLocale } from "@/i18n/config";
import type { Locale } from "@/i18n/config";

export function localizedHref(locale: Locale, path: string = "/"): string {
  if (locale === defaultLocale) return path === "/" ? "/" : path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
