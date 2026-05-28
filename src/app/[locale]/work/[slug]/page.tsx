/**
 * Case study page at /<locale>/work/<slug>.
 *
 * Statically prerendered via generateStaticParams. Fetches a single project
 * by slug from Sanity, renders meta grid + cover image + portable text body
 * + related work. Calls notFound() on slug miss.
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";
import { pickLocale } from "@/i18n/pick-locale";
import { getProject, getProjectSlugs } from "@/lib/work";
import { fetchSanity } from "@/sanity/fetch";
import { CASE_STUDY_QUERY } from "@/sanity/queries/case-study";
import { StatusDot } from "@/components/work/StatusDot";
import { PortableTextRenderer } from "@/components/portable-text";
import type { CASE_STUDY_QUERY_RESULT } from "@/sanity.types";

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
  if (!project) return { title: t(locale, "notFoundTitle") };

  const title = `${project.name} ${t(locale, "caseStudyMetaSuffix")}`;

  return {
    title,
    description: project.summary,
    alternates: {
      canonical: `${SITE_URL}/${locale}/work/${slug}`,
      languages: {
        en: `${SITE_URL}/en/work/${slug}`,
        nl: `${SITE_URL}/nl/work/${slug}`,
      },
    },
    openGraph: {
      title,
      description: project.summary,
      url: `${SITE_URL}/${locale}/work/${slug}`,
      siteName: "fousa.be",
      locale: locale === "nl" ? "nl_BE" : "en_US",
      type: "article",
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const project = await getProject(slug, locale);
  if (!project) notFound();

  const raw = await fetchSanity<CASE_STUDY_QUERY_RESULT>(CASE_STUDY_QUERY, {
    slug,
  });

  const body =
    typeof raw?.body === "object" && raw.body !== null
      ? (locale === "nl" &&
          Array.isArray((raw.body as Record<string, unknown>).nl) &&
          ((raw.body as Record<string, unknown>).nl as unknown[]).length > 0
          ? (raw.body as Record<string, unknown>).nl
          : (raw.body as Record<string, unknown>).en) ?? null
      : null;

  const coverUrl = raw?.coverUrl ?? null;
  const coverAlt = raw?.coverAlt ?? project.name;
  const related = raw?.related ?? [];

  return (
    <article id="main">
      {/* Back link */}
      <div className="px-5 pt-8 md:px-11">
        <Link
          href={`/${locale}`}
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

        <div className="mt-8 grid grid-cols-2 gap-6 md:flex md:gap-12">
          {[
            { label: t(locale, "client"), value: project.client },
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
              {t(locale, "status")}
            </p>
            <div className="mt-1">
              <StatusDot status={project.status} />
            </div>
          </div>
        </div>
      </header>

      {/* Cover */}
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

      {/* Body */}
      {body && (
        <div className="px-5 py-12 md:px-11">
          <PortableTextRenderer
            value={body as any[]}
            className="max-w-[600px] text-[15px] leading-[1.65] text-text"
          />
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
                href={`/${locale}/work/${r.slug}`}
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
    </article>
  );
}
