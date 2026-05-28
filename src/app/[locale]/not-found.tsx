/**
 * Custom 404 page for the locale segment. Triggered by notFound() in any
 * child page. Reads locale from the URL path manually since Next doesn't
 * pass params to not-found.tsx.
 */
import Link from "next/link";
import { headers } from "next/headers";
import { t } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";

async function detectLocaleFromPath(): Promise<Locale> {
  const h = await headers();
  const pathname = h.get("x-pathname") || h.get("referer") || "";
  return pathname.includes("/nl/") ? "nl" : "en";
}

export default async function NotFound() {
  const locale = await detectLocaleFromPath();

  return (
    <main
      id="main"
      className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center"
    >
      <p className="font-mono text-[13px] font-semibold text-faint">404</p>
      <h1 className="mt-4 font-display text-[24px] font-bold tracking-[-0.02em] text-ink md:text-[28px]">
        {t(locale, "notFoundHeadline")}
      </h1>
      <Link
        href={`/${locale}`}
        className="mt-8 font-display text-sm font-semibold text-ink"
      >
        {t(locale, "backToTheLog")}
        <span className="text-accent"> →</span>
      </Link>
    </main>
  );
}
