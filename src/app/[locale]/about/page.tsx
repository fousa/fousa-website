/**
 * About page — hero, career timeline, beyond code columns, and the dark
 * contact panel. Profile copy, beyond-code items, CV links, and socials
 * all come from Sanity. Career rows come from the Employer collection.
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";
import { pickLocale } from "@/i18n/pick-locale";
import { fetchSanity } from "@/sanity/fetch";
import { ABOUT_QUERY } from "@/sanity/queries/about";
import { AVAILABILITY_QUERY } from "@/sanity/queries/availability";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries/site-settings";
import {
  AvailabilityBadge,
  type AvailabilityStatus,
} from "@/components/about/AvailabilityBadge";
import { PortableTextRenderer } from "@/components/portable-text";
import type {
  ABOUT_QUERY_RESULT,
  AVAILABILITY_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
} from "@/sanity.types";
import { formatYearRange } from "@/lib/format-year-range";

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

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [about, availability, settings] = await Promise.all([
    fetchSanity<ABOUT_QUERY_RESULT>(ABOUT_QUERY),
    fetchSanity<AVAILABILITY_QUERY_RESULT>(AVAILABILITY_QUERY),
    fetchSanity<SITE_SETTINGS_QUERY_RESULT>(SITE_SETTINGS_QUERY),
  ]);

  const profile = about?.profile;
  const employers = about?.employers ?? [];
  const beyondCode = profile?.beyondCode ?? [];

  const availStatus = (availability?.status ?? "available") as AvailabilityStatus;
  const availMessage =
    pickLocale(
      typeof availability?.message === "object" ? availability.message : null,
      locale,
    ) ?? t(locale, `availability_${availStatus.replace("-", "_")}` as any);

  const headline =
    pickLocale(
      typeof profile?.aboutHeadline === "object" ? profile.aboutHeadline : null,
      locale,
    ) ?? profile?.name ?? "Jelle Vandebeeck";

  const bioObj = typeof profile?.bio === "object" && profile?.bio ? profile.bio : null;
  const bio = bioObj
    ? (locale === "nl" && Array.isArray(bioObj.nl) && bioObj.nl.length > 0
        ? bioObj.nl
        : bioObj.en) ?? null
    : null;

  const cvUrl =
    locale === "nl"
      ? (profile?.cvNlUrl ?? profile?.cvEnUrl)
      : profile?.cvEnUrl;

  const email = settings?.email ?? profile?.email ?? "jelle@fousa.be";
  const socials = settings?.socials ?? [];

  return (
    <>
      <main id="main">
        {/* Hero */}
        <section className="px-5 pt-12 pb-10 md:px-11">
          <div className="flex flex-col gap-10 md:flex-row md:gap-16">
            <div className="flex-1">
              <h1 className="font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] md:text-[34px] md:leading-[1.1]">
                {headline}
              </h1>
              {bio && (
                <PortableTextRenderer
                  value={bio}
                  className="mt-4 max-w-[480px] text-[15px] leading-[1.65] text-text"
                />
              )}
              <div className="mt-6 flex gap-5">
                <Link
                  href={`/${locale}/about#contact`}
                  className="font-display text-sm font-semibold text-ink"
                >
                  {t(locale, "hireMe")}
                  <span className="text-accent"> →</span>
                </Link>
                {cvUrl && (
                  <a
                    href={`${cvUrl}?dl=cv-${locale}.pdf`}
                    download
                    className="font-display text-sm font-semibold text-ink"
                  >
                    {t(locale, "cv")}
                    <span className="text-accent"> →</span>
                  </a>
                )}
              </div>
            </div>
            {profile?.portraitUrl ? (
              <Image
                src={profile.portraitUrl}
                alt={profile.name ?? "Portrait"}
                width={260}
                height={320}
                className="h-[280px] w-[220px] shrink-0 rounded object-cover md:h-[320px] md:w-[260px]"
              />
            ) : (
              <div className="h-[280px] w-[220px] shrink-0 rounded bg-surface md:h-[320px] md:w-[260px]" />
            )}
          </div>
        </section>

        {/* Career */}
        <section className="border-t border-line px-5 py-10 md:px-11">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
            {t(locale, "career")}
          </h2>
          <div className="mt-6">
            {employers.map((e) => (
              <div
                key={e._id}
                className="flex gap-6 border-t border-line py-4 first:border-t-0"
              >
                <span className="w-[120px] shrink-0 font-mono text-[13px] text-muted">
                  {formatYearRange(e.startYear ?? undefined, e.endYear ?? undefined)}
                </span>
                <div className="text-[14.5px]">
                  <span className="font-display font-semibold text-ink">
                    {e.role}
                  </span>
                  <span className="text-muted"> · {e.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Beyond code */}
        {beyondCode.length > 0 && (
          <section className="border-t border-line px-5 py-10 md:px-11">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
              {t(locale, "beyondCode")}
            </h2>
            <div className="mt-6 grid gap-8 md:grid-cols-3">
              {beyondCode.map((b, i) => {
                const title = pickLocale(
                  typeof b.title === "object" ? b.title : null,
                  locale,
                );
                const body = pickLocale(
                  typeof b.body === "object" ? b.body : null,
                  locale,
                );
                return (
                  <div key={title ?? i}>
                    <h3 className="font-display text-base font-semibold text-ink">
                      {title}
                    </h3>
                    {body && (
                      <p className="mt-2 text-[14px] leading-[1.65] text-text">
                        {body}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Contact panel — the one filled block */}
      <section id="contact" className="bg-panel px-5 py-14 md:px-11">
        <AvailabilityBadge status={availStatus} message={availMessage} />
        <a
          href={`mailto:${email}`}
          className="mt-4 block font-display text-[24px] font-bold tracking-[-0.02em] text-panel-text md:text-[32px]"
        >
          {email}
        </a>
        {socials.length > 0 && (
          <div className="mt-6 flex gap-6 text-sm text-panel-muted">
            {socials.map((s) => (
              <a
                key={s.platform}
                href={s.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-panel-text"
              >
                {s.label ?? s.platform}
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
