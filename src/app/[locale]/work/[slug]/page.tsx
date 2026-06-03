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
import { getProject, getProjectSlugs } from "@/lib/work";
import { forLabel } from "@/lib/work-display";
import { fetchSanity } from "@/sanity/fetch";
import { CASE_STUDY_QUERY } from "@/sanity/queries/case-study";
import { PROFILE_QUERY } from "@/sanity/queries/profile";
import { localizedHref } from "@/lib/href";
import { altMetadata } from "@/lib/seo";
import { buildProjectJsonLd } from "@/lib/json-ld";
import { JsonLd } from "@/components/seo/JsonLd";
import { StatusDot } from "@/components/work/StatusDot";
import { ToolingChip } from "@/components/work/ToolingChip";
import { PortableTextRenderer } from "@/components/portable-text";
import { Frame } from "@/components/work/Frame";
import type {
  CASE_STUDY_QUERY_RESULT,
  PROFILE_QUERY_RESULT,
} from "@/sanity.types";

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

  const project = await getProject(slug, locale);
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

  const project = await getProject(slug, locale);
  if (!project || project.depth === "none") notFound();

  const [raw, profile] = await Promise.all([
    fetchSanity<CASE_STUDY_QUERY_RESULT>(CASE_STUDY_QUERY, { slug }),
    fetchSanity<PROFILE_QUERY_RESULT>(PROFILE_QUERY),
  ]);

  // CreativeWork structured data, pointing at this page's canonical URL so it
  // agrees with the sitemap and hreflang alternates.
  const jsonLd = raw
    ? buildProjectJsonLd({
        project: raw,
        locale,
        siteUrl: SITE_URL,
        url: altMetadata(locale, `/work/${slug}`).alternates
          ?.canonical as string,
        authorName: profile?.name ?? "Jelle Vandebeeck",
      })
    : null;

  const coverUrl = raw?.coverUrl ?? null;
  const coverAlt = raw?.coverAlt ?? project.name;
  const related = raw?.related ?? [];

  const body =
    project.depth === "full" && typeof raw?.body === "object" && raw.body !== null
      ? (() => {
          const b = raw.body as Record<string, unknown>;
          return locale === "nl" &&
            Array.isArray(b.nl) &&
            (b.nl as unknown[]).length > 0
            ? b.nl
            : b.en;
        })() ?? null
      : null;

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
              {(() => {
                const f = forLabel(project, t(locale, "personal"));
                if (f.kind === "via") {
                  return (
                    <>
                      <span className="text-muted">{f.employer}</span>
                      <span className="mx-1 text-faint" aria-hidden>
                        →
                      </span>
                      <span className="text-ink">{f.client}</span>
                    </>
                  );
                }
                return (
                  <span
                    className={
                      f.kind === "personal" ? "text-muted" : "text-ink"
                    }
                  >
                    {f.text}
                  </span>
                );
              })()}
            </p>
          </div>
          {[
            { label: t(locale, "stack"), value: project.stack },
            { label: t(locale, "role"), value: project.role },
            { label: t(locale, "year"), value: String(project.year) },
          ].map((m) => (
            <div key={m.label}>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
                {m.label}
              </p>
              <p
                className={`mt-1 text-[14.5px] ${m.label === t(locale, "year") ? "font-mono text-[13px] text-muted" : "text-text"}`}
              >
                {m.value}
              </p>
            </div>
          ))}
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
              {t(locale, "state")}
            </p>
            <div className="mt-1">
              <StatusDot state={project.state} locale={locale} />
            </div>
          </div>
        </div>
      </header>

      {/* Full case study: cover + body */}
      {project.depth === "full" && (
        <>
          {coverUrl ? (
            <div className="mx-5 md:mx-11">
              <Image
                src={coverUrl}
                alt={coverAlt}
                width={1200}
                height={600}
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

      {/* Gallery: screenshots in device frames */}
      {project.depth === "gallery" && project.gallery.length > 0 && (
        <div className="px-5 py-10 md:px-11">
          <div className="flex flex-wrap items-end justify-center gap-8 md:gap-10">
            {project.gallery.map((shot) => (
              <div
                key={shot.key}
                className={
                  shot.frame === "phone"
                    ? "w-[180px]"
                    : shot.frame === "tablet"
                      ? "w-[280px]"
                      : "w-full max-w-[560px]"
                }
              >
                <Frame shot={shot} />
                {shot.caption && (
                  <p className="mt-2 text-center font-mono text-[11px] text-muted">
                    {shot.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
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
