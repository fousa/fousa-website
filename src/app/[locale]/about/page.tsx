/**
 * About page — hero, career timeline, beyond code columns, and the dark
 * contact panel. Uses new minimal-modern tokens while preserving locale
 * metadata from prior phases.
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";

const SITE_URL = "https://fousa.be";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const title = t(locale, "aboutTitle");
  const description = t(locale, "aboutDescription");

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/about`,
      languages: {
        en: `${SITE_URL}/en/about`,
        nl: `${SITE_URL}/nl/about`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/about`,
      siteName: "fousa.be",
      locale: locale === "nl" ? "nl_BE" : "en_US",
      type: "profile",
    },
    twitter: { card: "summary", title, description },
  };
}

/** Placeholder career rows until Employer data comes from Sanity. */
const CAREER = [
  { year: "2022 – now", role: "Freelance iOS Lead", company: "fousa" },
  { year: "2018 – 2022", role: "Senior iOS Engineer", company: "iCapps" },
  { year: "2014 – 2018", role: "iOS Developer", company: "Appwise" },
  { year: "2008 – 2014", role: "Web Developer", company: "Various" },
];

/** Placeholder beyond-code items. */
const BEYOND = [
  {
    title: "Gliding",
    text: "Reading thermals over the Belgian heath since the early days. Both flying gliders and writing software require reading the conditions carefully.",
  },
  {
    title: "Open source",
    text: "Maintainer of several Swift and Ruby libraries. Building tools I actually use, then sharing them.",
  },
  {
    title: "Photography",
    text: "Documenting flights, landscapes, and the occasional street scene. Always with a light travel kit.",
  },
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <main id="main">
        {/* Hero */}
        <section className="px-5 pt-12 pb-10 md:px-11">
          <div className="flex flex-col gap-10 md:flex-row md:gap-16">
            <div className="flex-1">
              <h1 className="font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] md:text-[34px] md:leading-[1.1]">
                Jelle Vandebeeck
              </h1>
              <p className="mt-4 max-w-[480px] text-[15px] leading-[1.65] text-text">
                iOS developer and Rails engineer from Edegem, Belgium. Building
                products since 2008, gliding the Belgian skies in between.
              </p>
              <div className="mt-6 flex gap-5">
                <Link
                  href={`/${locale}/about#contact`}
                  className="font-display text-sm font-semibold text-ink"
                >
                  {t(locale, "hireMe")}
                  <span className="text-accent"> →</span>
                </Link>
                <a
                  href={`/cv-${locale}.pdf`}
                  download
                  className="font-display text-sm font-semibold text-ink"
                >
                  {t(locale, "cv")}
                  <span className="text-accent"> →</span>
                </a>
              </div>
            </div>
            {/* Portrait placeholder */}
            <div className="h-[280px] w-[220px] shrink-0 rounded bg-surface md:h-[320px] md:w-[260px]" />
          </div>
        </section>

        {/* Career */}
        <section className="border-t border-line px-5 py-10 md:px-11">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
            {t(locale, "career")}
          </h2>
          <div className="mt-6">
            {CAREER.map((c) => (
              <div
                key={c.year}
                className="flex gap-6 border-t border-line py-4 first:border-t-0"
              >
                <span className="w-[120px] shrink-0 font-mono text-[13px] text-muted">
                  {c.year}
                </span>
                <div className="text-[14.5px]">
                  <span className="font-display font-semibold text-ink">
                    {c.role}
                  </span>
                  <span className="text-muted"> · {c.company}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Beyond code */}
        <section className="border-t border-line px-5 py-10 md:px-11">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
            {t(locale, "beyondCode")}
          </h2>
          <div className="mt-6 grid gap-8 md:grid-cols-3">
            {BEYOND.map((b) => (
              <div key={b.title}>
                <h3 className="font-display text-base font-semibold text-ink">
                  {b.title}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.65] text-text">
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Contact panel — the one filled block */}
      <section
        id="contact"
        className="bg-panel px-5 py-14 md:px-11"
      >
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-panel-muted">
          {t(locale, "available")}
        </p>
        <a
          href="mailto:jelle@fousa.be"
          className="mt-4 block font-display text-[24px] font-bold tracking-[-0.02em] text-panel-text md:text-[32px]"
        >
          jelle@fousa.be
        </a>
        <div className="mt-6 flex gap-6 text-sm text-panel-muted">
          <a
            href="https://github.com/fousa"
            className="transition-colors hover:text-panel-text"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/jellevandebeeck"
            className="transition-colors hover:text-panel-text"
          >
            LinkedIn
          </a>
          <a
            href="https://twitter.com/fousa"
            className="transition-colors hover:text-panel-text"
          >
            Twitter
          </a>
        </div>
      </section>
    </>
  );
}
