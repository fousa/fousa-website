/**
 * SEO helpers for canonical URLs and hreflang alternates.
 *
 * English is the unprefixed default; Dutch lives under /nl. `x-default`
 * points at the English variant so search engines prefer it when unsure.
 */
import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";

const SITE_URL = "https://fousa.be";

/**
 * Build canonical + alternates metadata for a given path.
 *
 * @param locale - active locale
 * @param path - path without locale prefix (e.g. "/" or "/about" or "/work/vulture")
 */
export function altMetadata(locale: Locale, path: string): Pick<Metadata, "alternates"> {
  const normalizedPath = path === "/" ? "" : path;
  const en = `${SITE_URL}${normalizedPath}` || SITE_URL;
  const nl = `${SITE_URL}/nl${normalizedPath}`;
  const canonical = locale === "en" ? en : nl;
  return {
    alternates: {
      canonical,
      languages: { en, nl, "x-default": en },
    },
  };
}
