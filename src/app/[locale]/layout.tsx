/**
 * Locale layout — validates the locale param, renders the TopBar + SiteFooter,
 * and wraps every page. Children fill the remaining height so the footer sits
 * at the viewport bottom on short pages.
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { locales, isLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";
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
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        nl: `${SITE_URL}/nl`,
      },
    },
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

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-bg focus:text-ink focus:px-3 focus:py-2 focus:rounded focus:outline focus:outline-2 focus:outline-accent"
      >
        {t(locale, "skipToContent")}
      </a>
      <TopBar locale={locale} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
