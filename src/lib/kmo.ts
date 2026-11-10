/**
 * Helpers for the unlisted KMO page (`/nl/kmo`) and its sales sheets.
 *
 * The content itself lives in the KMO page singleton in Sanity
 * (`sanity/schemas/kmo-page.ts`); this file only derives what is shown from
 * it: numbering, anchors, price formatting, PDF names and links. Shared by
 * the page and by `scripts/build-kmo-pdf.ts`, so it stays free of Next and
 * Sanity imports.
 */

/** Route path without the locale prefix. Dutch only: `/nl/kmo`. */
export const KMO_PATH = "/kmo";

/** Public URL of the page (sheet header links and the canonical). */
export const KMO_URL = `https://fousa.be/nl${KMO_PATH}`;

/** Which decorative device mock a package card and sheet show. */
export type KmoMock = "phone" | "portal" | "tool";

export function isKmoMock(value: unknown): value is KmoMock {
  return value === "phone" || value === "portal" || value === "tool";
}

/** Two-digit display number for the package at `index`: 0 → "01". */
export function packageNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/** In-page anchor for the package at `index`: 0 → "pakket-1". */
export function packageAnchor(index: number): string {
  return `pakket-${index + 1}`;
}

/** Whole euros with Belgian thousands dots: 12500 → "€12.500". */
export function formatEuro(amount: number): string {
  const whole = Math.round(amount);
  return `€${String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

/** "€12.500 – €25.000", or a single price when both ends match. */
export function formatPriceRange(from: number, to: number): string {
  return from === to ? formatEuro(from) : `${formatEuro(from)} – ${formatEuro(to)}`;
}

/** Lowercase ASCII slug: "Werkbon- en inspectie-app" → "werkbon-en-inspectie-app". */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Filename of a package's sales sheet: "fousa-pakket-1-klantenportaal.pdf". */
export function sheetFilename(index: number, name: string): string {
  return `fousa-pakket-${index + 1}-${slugify(name)}.pdf`;
}

/** Filename of the combined sheets. */
export const ALL_SHEETS_FILENAME = "fousa-pakketten.pdf";

/** Only filenames this module would produce, so the PDF route can't be used as an open proxy. */
export function isSheetFilename(file: string): boolean {
  return file === ALL_SHEETS_FILENAME || /^fousa-pakket-\d+-[a-z0-9-]+\.pdf$/.test(file);
}

/** Site path the page links a sales sheet with: "/kmo/fousa-pakketten.pdf". */
export function sheetHref(file: string): string {
  return `${KMO_PATH}/${file}`;
}

/** `tel:` href for a phone number written for humans ("+32 470 12 34 56"). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}
