/**
 * Detail page at /<locale>/work/<slug>.
 *
 * Handles three depth levels:
 *   - "full"    → case study with portable text body + cover image
 *   - "gallery" → screenshot gallery with device frames
 *   - "none"    → 404 (no detail page exists)
 *
 * Statically prerendered via generateStaticParams (only slugs with depth ≠ "none").
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";
import { getProjectDetail, getProjectSlugs, yearRange } from "@/lib/work";
import { ForCell } from "@/components/work/ForCell";
import { fetchSanity } from "@/sanity/fetch";
import { PROFILE_QUERY } from "@/sanity/queries/profile";
import { localizedHref } from "@/lib/href";
import { altMetadata } from "@/lib/seo";
import { buildProjectJsonLd } from "@/lib/json-ld";
import { JsonLd } from "@/components/seo/JsonLd";
import { OutboundLink } from "@/components/layout/OutboundLink";
import { StatusDot } from "@/components/work/StatusDot";
import { ToolingChip } from "@/components/work/ToolingChip";
import { PortableTextRenderer } from "@/components/portable-text";
import { Gallery } from "@/components/work/Gallery";
import type { PROFILE_QUERY_RESULT } from "@/sanity.types";

const SITE_URL = "https://fousa.be";

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const project = await getProjectDetail(slug, locale);
  if (!project || project.depth === "none")
    return { title: t(locale, "notFoundTitle") };

  const title = `${project.name} ${t(locale, "caseStudyMetaSuffix")}`;
  const path = `/work/${slug}`;
  // Per-project share image from the dedicated /og generator; falls back to
  // the site default only if a project somehow has no generated card.
  const ogImage = `${SITE_URL}/og/${slug}`;

  return {
    title,
    description: project.summary,
    ...altMetadata(locale, path),
    openGraph: {
      title,
      description: project.summary,
      url: altMetadata(locale, path).alternates?.canonical as string,
      siteName: "fousa.be",
      locale: locale === "nl" ? "nl_BE" : "en_US",
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630, alt: project.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.summary,
      images: [ogImage],
    },
  };
}

export default async function DetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const [project, profile] = await Promise.all([
    getProjectDetail(slug, locale),
    fetchSanity<PROFILE_QUERY_RESULT>(PROFILE_QUERY),
  ]);
  if (!project || project.depth === "none") notFound();

  // CreativeWork structured data, pointing at this page's canonical URL so it
  // agrees with the sitemap and hreflang alternates.
  const jsonLd = buildProjectJsonLd({
    project,
    locale,
    siteUrl: SITE_URL,
    url: altMetadata(locale, `/work/${slug}`).alternates?.canonical as string,
    authorName: profile?.name ?? "Jelle Vandebeeck",
  });

  const coverUrl = project.cover?.url ?? null;
  const coverAlt = project.cover?.alt ?? project.name;
  const related = project.related;
  const body = project.body;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <main id="main">
        {/* Back link */}
      <div className="px-5 pt-8 md:px-11">
        <Link
          href={localizedHref(locale, "/")}
          className="font-display text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          ← {t(locale, "backToTheLog")}
        </Link>
      </div>

      {/* Meta */}
      <header className="px-5 pt-8 pb-8 md:px-11">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.03em] md:text-[36px]">
          {project.name}
        </h1>
        <p className="mt-3 max-w-[520px] text-[15px] leading-[1.6] text-text">
          {project.summary}
        </p>
        {project.featureTooling && (
          <div className="mt-4 -ml-2">
            <ToolingChip label={t(locale, "toolingChip")} />
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-6 md:flex md:gap-12">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
              {t(locale, "for")}
            </p>
            <p className="mt-1 text-[14.5px]">
              <ForCell p={project} locale={locale} />
            </p>
          </div>
          {[
            { label: t(locale, "stack"), value: project.stack },
            { label: t(locale, "role"), value: project.role },
          ].map((m) => (
            <div key={m.label}>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
                {m.label}
              </p>
              <p className="mt-1 text-[14.5px] text-text">{m.value}</p>
            </div>
          ))}
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
              {t(locale, "year")}
            </p>
            <p className="mt-1 font-mono text-[13px] text-muted">
              {(() => {
                const { start, end } = yearRange(project);
                if (end == null) return start;
                return (
                  <>
                    {start}
                    <span className="mx-1 text-faint" aria-hidden>
                      →
                    </span>
                    {end}
                  </>
                );
              })()}
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
              {t(locale, "state")}
            </p>
            <div className="mt-1">
              <StatusDot state={project.state} locale={locale} />
            </div>
          </div>
        </div>

        {/* External links — only render the ones that exist. */}
        {(project.links?.live || project.links?.github) && (
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            {(
              [
                { href: project.links?.live, kind: "live", label: t(locale, "linkLive") },
                { href: project.links?.github, kind: "github", label: t(locale, "linkSource") },
              ] as const
            )
              .filter((l) => l.href)
              .map((l) => (
                <OutboundLink
                  key={l.kind}
                  kind={l.kind}
                  href={l.href as string}
                  locale={locale}
                  className="font-display text-sm font-semibold text-ink transition-colors hover:text-accent"
                >
                  {l.label}
                  <span aria-hidden className="text-accent"> →</span>
                </OutboundLink>
              ))}
          </div>
        )}
      </header>

      {/* Full case study: cover + body */}
      {project.depth === "full" && (
        <>
          {coverUrl ? (
            <div className="mx-5 md:mx-11">
              <Image
                src={coverUrl}
                alt={coverAlt}
                width={1800}
                height={600}
                priority
                className="h-auto w-full rounded object-cover"
              />
            </div>
          ) : (
            <div className="mx-5 h-[240px] rounded bg-surface md:mx-11 md:h-[360px]" />
          )}
          {body && (
            <div className="px-5 py-12 md:px-11">
              <PortableTextRenderer
                value={body as unknown[]}
                className="max-w-[600px] text-[15px] leading-[1.65] text-text"
              />
            </div>
          )}
        </>
      )}

      {/* Gallery: screenshots in device frames. Shown whenever shots exist —
          on a gallery-only project it's the main content, on a full case study
          it sits after the body. Click a shot to open the lightbox carousel. */}
      {project.gallery.length > 0 && (
        <Gallery shots={project.gallery} locale={locale} />
      )}

      {/* Related work */}
      {related.length > 0 && (
        <section className="border-t border-line px-5 py-10 md:px-11">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
            {t(locale, "relatedWork")}
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={localizedHref(locale, `/work/${r.slug}`)}
                className="group border-t border-line pt-5"
              >
                <span className="font-display text-base font-semibold text-ink transition-colors group-hover:text-accent">
                  {r.name}
                </span>
                <span className="mt-1 block text-[13px] text-muted">
                  {r.year}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
    </>
  );
}
