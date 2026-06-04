/**
 * About page — hero, career timeline, beyond code columns, and the dark
 * contact panel. Profile copy, beyond-code items, CV links, and socials
 * all come from Sanity. Career rows come from the TimelineEntry collection.
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { isLocale } from "@/i18n/config";
import { t, type MessageKey } from "@/i18n/messages";
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
import { CareerTimeline } from "@/components/about/career-section";
import { Skills } from "@/components/about/Skills";
import { getSkills } from "@/lib/skills";
import { localizedHref } from "@/lib/href";
import { altMetadata } from "@/lib/seo";
import { OutboundLink } from "@/components/layout/OutboundLink";
import { SocialIcon } from "@/components/layout/SocialIcon";
import { resolveSocialKind } from "@/lib/socials";

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
    ...altMetadata(locale, "/about"),
    openGraph: {
      title,
      description,
      url: altMetadata(locale, "/about").alternates?.canonical as string,
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

  const [about, availability, settings, skills] = await Promise.all([
    fetchSanity<ABOUT_QUERY_RESULT>(ABOUT_QUERY),
    fetchSanity<AVAILABILITY_QUERY_RESULT>(AVAILABILITY_QUERY),
    fetchSanity<SITE_SETTINGS_QUERY_RESULT>(SITE_SETTINGS_QUERY),
    getSkills(),
  ]);

  const profile = about?.profile;
  const timeline = about?.timeline ?? [];
  const beyondCode = profile?.beyondCode ?? [];

  const availStatus = (availability?.status ?? "available") as AvailabilityStatus;
  const availMessage =
    pickLocale(
      typeof availability?.message === "object" ? availability.message : null,
      locale,
    ) ?? t(locale, `availability_${availStatus.replace("-", "_")}` as MessageKey);

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
                {headline.endsWith(".")
                  ? <>{headline.slice(0, -1)}<span className="text-accent">.</span></>
                  : headline}
              </h1>
              {bio && (
                <PortableTextRenderer
                  value={bio}
                  className="mt-4 max-w-[480px] text-[15px] leading-[1.65] text-text"
                />
              )}
              <div className="mt-6 flex gap-5">
                <Link
                  href={`${localizedHref(locale, "/about")}#contact`}
                  className="font-display text-sm font-semibold text-ink"
                >
                  {t(locale, "hireMe")}
                  <span aria-hidden className="text-accent"> →</span>
                </Link>
                {cvUrl && (
                  <OutboundLink
                    kind="cv"
                    href={`${cvUrl}?dl=cv-${locale}.pdf`}
                    locale={locale}
                    download
                    className="font-display text-sm font-semibold text-ink"
                  >
                    {t(locale, "cv")}
                    <span aria-hidden className="text-accent"> →</span>
                  </OutboundLink>
                )}
              </div>
            </div>
            {profile?.portraitUrl ? (
              <Image
                src={profile.portraitUrl}
                alt={profile.name ?? "Portrait"}
                width={260}
                height={320}
                priority
                className="h-[280px] w-[220px] shrink-0 rounded object-cover md:h-[320px] md:w-[260px]"
              />
            ) : (
              <div className="h-[280px] w-[220px] shrink-0 rounded bg-surface md:h-[320px] md:w-[260px]" />
            )}
          </div>
        </section>

        {/* Skills */}
        {skills.length > 0 && (
          <section id="skills" className="scroll-mt-20 border-t border-line px-5 py-10 md:px-11">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
              {t(locale, "skills")}
            </h2>
            <Skills skills={skills} locale={locale} />
          </section>
        )}

        {/* Career */}
        <section className="border-t border-line px-5 py-10 md:px-11">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
            {t(locale, "career")}
          </h2>
          <div className="mt-6">
            <CareerTimeline timeline={timeline} locale={locale} />
          </div>
        </section>

        {/* Beyond code */}
        {beyondCode.length > 0 && (
          <section className="border-t border-line px-5 py-10 md:px-11">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
              {t(locale, "beyondCode")}
            </h2>
            <div className="mt-6 grid grid-cols-1 border-t border-line md:grid-cols-3">
              {beyondCode.map((b, i) => {
                const title = pickLocale(
                  typeof b.title === "object" ? b.title : null,
                  locale,
                );
                const body = pickLocale(
                  typeof b.body === "object" ? b.body : null,
                  locale,
                );
                const image = b.image;
                const alt =
                  pickLocale(
                    typeof image?.alt === "object" ? image.alt : null,
                    locale,
                  ) ?? title;
                return (
                  <article
                    key={title ?? i}
                    className="border-line py-5 [&:not(:first-child)]:border-t md:border-t-0 md:border-r md:px-6 md:py-6 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
                  >
                    <div className="grid grid-cols-[96px_1fr] items-start gap-4">
                      {image?.url ? (
                        <div className="relative h-24 w-24 overflow-hidden rounded-md bg-surface">
                          <Image
                            src={image.url}
                            alt={alt ?? ""}
                            fill
                            sizes="96px"
                            placeholder={image.lqip ? "blur" : "empty"}
                            blurDataURL={image.lqip ?? undefined}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        /* reserve the column so titles align across items */
                        <div aria-hidden className="h-24 w-24" />
                      )}
                      <div className="min-w-0">
                        <h3 className="font-display text-base font-semibold text-ink">
                          {title}
                        </h3>
                        {body && (
                          <p className="mt-1 text-[14px] leading-[1.6] text-text">
                            {body}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

      {/* Contact panel — the one filled block */}
      <section id="contact" className="bg-panel px-5 py-14 md:px-11">
        <AvailabilityBadge status={availStatus} message={availMessage} />
        <OutboundLink
          kind="email"
          href={`mailto:${email}`}
          locale={locale}
          className="mt-4 block font-display text-[24px] font-bold tracking-[-0.02em] text-panel-text md:text-[32px]"
        >
          {(() => {
            const lastDot = email.lastIndexOf(".");
            return lastDot >= 0
              ? <>{email.slice(0, lastDot)}<span className="text-accent">.</span>{email.slice(lastDot + 1)}</>
              : email;
          })()}
        </OutboundLink>
        {socials.length > 0 && (
          <div className="mt-6 flex gap-6 text-sm text-panel-muted">
            {socials.map((s) => {
              const kind = resolveSocialKind(s.platform);
              return (
                <OutboundLink
                  key={s.platform}
                  kind={kind}
                  href={s.url ?? "#"}
                  locale={locale}
                  className="group inline-flex items-center gap-2 transition-colors hover:text-panel-text"
                >
                  <SocialIcon kind={kind} />
                  {s.label ?? s.platform}
                </OutboundLink>
              );
            })}
          </div>
        )}
      </section>
      </main>
    </>
  );
}
