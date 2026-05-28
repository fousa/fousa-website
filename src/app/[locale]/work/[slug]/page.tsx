/**
 * Case study page at /<locale>/work/<slug>.
 *
 * Statically prerendered via generateStaticParams. Fetches a single project
 * by slug, renders meta grid + cover placeholder + body sections + related
 * work. Calls notFound() on slug miss.
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { isLocale } from "@/i18n/config";
import { getProject, getProjects } from "@/lib/work";
import { StatusDot } from "@/components/work/StatusDot";

const SITE_URL = "https://fousa.be";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const project = await getProject(slug, locale);
  if (!project) return { title: "Not found" };

  return {
    title: `${project.name} — case study`,
    description: project.summary,
    alternates: {
      canonical: `${SITE_URL}/${locale}/work/${slug}`,
      languages: {
        en: `${SITE_URL}/en/work/${slug}`,
        nl: `${SITE_URL}/nl/work/${slug}`,
      },
    },
    openGraph: {
      title: `${project.name} — case study`,
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

  const allProjects = await getProjects(locale);
  const related = allProjects
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  return (
    <article id="main">
      {/* Back link */}
      <div className="px-5 pt-8 md:px-11">
        <Link
          href={`/${locale}`}
          className="font-display text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          ← Back to the log
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
            { label: "Client", value: project.client },
            { label: "Stack", value: project.stack },
            { label: "Role", value: project.role },
            { label: "Year", value: String(project.year) },
          ].map((m) => (
            <div key={m.label}>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
                {m.label}
              </p>
              <p
                className={`mt-1 text-[14.5px] ${m.label === "Year" ? "font-mono text-[13px] text-muted" : "text-text"}`}
              >
                {m.value}
              </p>
            </div>
          ))}
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
              Status
            </p>
            <div className="mt-1">
              <StatusDot status={project.status} />
            </div>
          </div>
        </div>
      </header>

      {/* Cover placeholder */}
      <div className="mx-5 h-[240px] rounded bg-surface md:mx-11 md:h-[360px]" />

      {/* Body sections */}
      <div className="space-y-10 px-5 py-12 md:px-11">
        {["Context", "Approach", "Outcome"].map((section) => (
          <section key={section}>
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
              {section}
            </h2>
            <p className="mt-4 max-w-[600px] text-[15px] leading-[1.65] text-text">
              Case study content will be loaded from Sanity once the project
              schema is connected. This placeholder demonstrates the layout.
            </p>
          </section>
        ))}
      </div>

      {/* Related work */}
      {related.length > 0 && (
        <section className="border-t border-line px-5 py-10 md:px-11">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
            Related work
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
                  {r.client} · {r.year}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
