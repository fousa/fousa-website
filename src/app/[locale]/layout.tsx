/**
 * Locale layout — validates the locale param, renders the TopBar + SiteFooter,
 * and wraps every page. Children fill the remaining height so the footer sits
 * at the viewport bottom on short pages.
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { locales, isLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";
import { pickLocale } from "@/i18n/pick-locale";
import { altMetadata } from "@/lib/seo";
import { fetchSanity } from "@/sanity/fetch";
import { PROFILE_QUERY } from "@/sanity/queries/profile";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries/site-settings";
import type {
  PROFILE_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
} from "@/sanity.types";
import { Analytics } from "@vercel/analytics/next";
import { JsonLd } from "@/components/seo/JsonLd";
import { TopBar } from "@/components/layout/TopBar";
import { SiteFooter } from "@/components/layout/SiteFooter";

const SITE_URL = "https://fousa.be";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: {
      default: "fousa.be — Freelance iOS & web developer",
      template: "%s · fousa.be",
    },
    description: t(locale, "siteDescription"),
    ...altMetadata(locale, "/"),
    openGraph: {
      siteName: "fousa.be",
      locale: locale === "nl" ? "nl_BE" : "en_US",
      alternateLocale: locale === "nl" ? ["en_US"] : ["nl_BE"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [profile, settings] = await Promise.all([
    fetchSanity<PROFILE_QUERY_RESULT>(PROFILE_QUERY),
    fetchSanity<SITE_SETTINGS_QUERY_RESULT>(SITE_SETTINGS_QUERY),
  ]);

  // Person entity, embedded on every page so search engines tie the whole
  // site back to a single identity. sameAs links prefer the curated Site
  // Settings socials, falling back to the profile's own list.
  const sameAs = (
    settings?.socials?.length
      ? settings.socials
      : (profile?.socialLinks ?? [])
  )
    .map((s) => s.url)
    .filter((url): url is string => Boolean(url));
  const jobTitle = pickLocale(
    typeof profile?.roleLine === "object" ? profile.roleLine : null,
    locale,
  );
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile?.name ?? "Jelle Vandebeeck",
    url: SITE_URL,
    ...(jobTitle ? { jobTitle } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={personJsonLd} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-bg focus:text-ink focus:px-3 focus:py-2 focus:rounded focus:outline focus:outline-2 focus:outline-accent"
      >
        {t(locale, "skipToContent")}
      </a>
      <TopBar locale={locale} />
      <div className="flex-1">{children}</div>
      <SiteFooter locale={locale} />
      <Analytics />
    </div>
  );
}
