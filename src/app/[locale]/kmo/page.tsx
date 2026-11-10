/**
 * KMO page at /nl/kmo — unlisted: not in the nav or the sitemap and marked
 * `noindex` (meta robots here, `X-Robots-Tag` in next.config.ts), it is
 * shared by link with prospective small-business clients.
 *
 * Hero with a package overview, the packages (each with its sales-sheet
 * PDF), how an engagement runs, why work with me, a short FAQ and the dark
 * contact panel. All copy comes from the KMO page singleton in Sanity; the
 * section labels stay here. Dutch only: the English path redirects here.
 */
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { isLocale } from "@/i18n/config";
import { fetchSanity } from "@/sanity/fetch";
import { KMO_PAGE_QUERY } from "@/sanity/queries/kmo";
import type { KMO_PAGE_QUERY_RESULT } from "@/sanity.types";
import { AvailabilityBadge } from "@/components/about/AvailabilityBadge";
import { OutboundLink } from "@/components/layout/OutboundLink";
import { DeviceMock } from "@/components/kmo/DeviceMock";
import {
  KMO_PATH,
  KMO_URL,
  formatEuro,
  formatPriceRange,
  isKmoMock,
  packageAnchor,
  packageNumber,
  sheetHref,
  telHref,
} from "@/lib/kmo";

/**
 * Section label. `text-muted` rather than the site's usual `text-faint`:
 * these are the page's h2s, so they need AA contrast in both themes.
 */
const EYEBROW = "font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-muted";
/** Display-type text link with the coral arrow. */
const ARROW_LINK =
  "inline-flex min-h-11 items-center font-display text-[14px] font-semibold text-ink transition-colors hover:text-text";
const ARROW = (
  <span aria-hidden className="text-accent">
    &nbsp;→
  </span>
);

function getPage() {
  return fetchSanity<KMO_PAGE_QUERY_RESULT>(KMO_PAGE_QUERY);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Unlisted on every path: the English URL only redirects, but say so anyway.
  const robots = { index: false, follow: false };
  if (locale !== "nl") return { robots };

  const page = await getPage();
  const title = page?.title ?? undefined;
  const description = page?.description ?? undefined;

  return {
    title,
    description,
    robots,
    // Dutch only, so a canonical without hreflang alternates.
    alternates: { canonical: KMO_URL },
    openGraph: {
      title,
      description,
      url: KMO_URL,
      siteName: "fousa.be",
      locale: "nl_BE",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** The email with its last dot in coral, as in the About contact panel. */
function accentedEmail(email: string) {
  const lastDot = email.lastIndexOf(".");
  if (lastDot < 0) return email;
  return (
    <>
      {email.slice(0, lastDot)}
      <span className="text-accent">.</span>
      {email.slice(lastDot + 1)}
    </>
  );
}

/** A site path goes through `<Link>`, anything else is an outbound link. */
function ReasonLink({ href, label, locale }: { href: string; label: string; locale: string }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={ARROW_LINK}>
        {label}
        {ARROW}
      </Link>
    );
  }
  return (
    <OutboundLink kind="live" href={href} locale={locale} className={ARROW_LINK}>
      {label}
      {ARROW}
    </OutboundLink>
  );
}

export default async function KmoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  // There is no English version; the footer's language switch lands here too.
  if (locale !== "nl") redirect(`/nl${KMO_PATH}`);

  const page = await getPage();
  if (!page?.title) notFound();

  const packages = (page.packages ?? []).flatMap((p, i) =>
    p.name && p.priceFrom != null && p.priceTo != null
      ? [{ ...p, name: p.name, priceFrom: p.priceFrom, priceTo: p.priceTo, anchor: packageAnchor(i), number: packageNumber(i) }]
      : [],
  );
  const steps = page.steps ?? [];
  const reasons = page.reasons ?? [];
  const faq = page.faq ?? [];
  const email = page.email?.trim() || null;
  const phone = page.phone?.trim() || null;
  const cta = page.contactTitle ?? "Neem contact op";

  return (
    <main id="main">
      {/* Hero + package overview */}
      <section
        aria-labelledby="kmo-title"
        className="flex flex-wrap items-end gap-x-16 gap-y-10 px-5 pt-10 pb-12 md:gap-y-12 md:px-11 md:pt-16 md:pb-16"
      >
        <div className="min-w-0 max-w-[760px] flex-[999_1_520px]">
          {page.eyebrow && <p className={EYEBROW}>{page.eyebrow}</p>}
          <h1
            id="kmo-title"
            className="mt-4 text-balance font-display text-[34px] font-bold leading-[1.05] tracking-[-0.035em] text-ink [overflow-wrap:anywhere] min-[380px]:text-[40px] sm:text-[52px] sm:leading-none md:text-[56px]"
          >
            {page.title}
            <span className="text-accent">.</span>
          </h1>
          {page.intro && (
            <p className="mt-[18px] max-w-[560px] text-pretty text-[16px] leading-[1.6] text-text">
              {page.intro}
            </p>
          )}
          <div className="mt-5 flex flex-col font-display text-[15px] font-semibold text-ink sm:flex-row sm:gap-x-7">
            <a href="#verkenning" className="inline-flex min-h-11 items-center">
              {cta}
              {ARROW}
            </a>
            {packages.length > 0 && (
              <a href="#pakketten" className="inline-flex min-h-11 items-center">
                Bekijk de pakketten
                {ARROW}
              </a>
            )}
          </div>
        </div>

        {packages.length > 0 && (
          <nav aria-label="Overzicht van de pakketten" className="w-full min-w-0 max-w-[560px] flex-[1_1_380px]">
            <div
              aria-hidden
              className="flex justify-between gap-4 border-b border-line pb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted"
            >
              <span>Pakket</span>
              <span>Bouw vanaf</span>
            </div>
            <ul role="list">
              {packages.map((p) => (
                <li key={p._key}>
                  <a
                    href={`#${p.anchor}`}
                    className="grid min-h-11 grid-cols-[28px_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-line py-3.5 text-ink transition-colors hover:bg-hover md:grid-cols-[32px_minmax(0,1fr)_auto]"
                  >
                    <span aria-hidden className="font-mono text-[12px] text-muted">{p.number}</span>
                    <span className="font-display text-[16px] font-semibold leading-[1.3]">{p.name}</span>
                    <span className="font-mono text-[13px] text-text">
                      <span className="sr-only">vanaf </span>
                      {formatEuro(p.priceFrom)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            {page.overviewNote && (
              <p className="mt-3 font-mono text-[12px] leading-[1.5] text-muted">{page.overviewNote}</p>
            )}
          </nav>
        )}
      </section>

      {/* Packages */}
      {packages.length > 0 && (
        <section
          id="pakketten"
          aria-labelledby="pakketten-title"
          className="scroll-mt-20 border-t border-line px-5 py-10 md:px-11"
        >
          <h2 id="pakketten-title" className={EYEBROW}>Pakketten</h2>
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((p) => {
              const features = (p.features ?? []).filter((f) => !f.sheetOnly && f.name);
              return (
                <article
                  key={p._key}
                  id={p.anchor}
                  aria-labelledby={`${p.anchor}-title`}
                  className="flex min-w-0 scroll-mt-20 flex-col"
                >
                  {isKmoMock(p.mock) && <DeviceMock kind={p.mock} />}
                  <p aria-hidden className="mt-5 font-mono text-[12px] text-muted">{p.number}</p>
                  <h3
                    id={`${p.anchor}-title`}
                    className="mt-1.5 font-display text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] text-ink"
                  >
                    {p.name}
                  </h3>
                  {p.summary && <p className="mt-2 text-[15px] leading-[1.55] text-text">{p.summary}</p>}
                  {p.audience && (
                    <p className="mt-2.5 font-mono text-[12px] leading-[1.5] text-muted">{p.audience}</p>
                  )}
                  {features.length > 0 && (
                    <dl className="mt-5 border-t border-line">
                      {features.map((f) => (
                        <div
                          key={f._key}
                          className="grid grid-cols-[88px_minmax(0,1fr)] items-baseline gap-3 border-b border-line py-2 min-[380px]:grid-cols-[104px_minmax(0,1fr)]"
                        >
                          <dt className="font-display text-[14px] font-semibold text-ink [overflow-wrap:anywhere]">
                            {f.name}
                          </dt>
                          <dd className="text-[14px] leading-[1.45] text-text">{f.detail}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <div className="mt-auto flex flex-col gap-2 pt-5">
                    <p className="flex flex-col gap-1">
                      <span className="font-display text-[24px] font-bold tracking-[-0.02em] text-ink">
                        <span className="sr-only">Bouw: </span>
                        {formatPriceRange(p.priceFrom, p.priceTo)}
                      </span>
                      {p.maintenanceFrom != null && (
                        <span className="text-[13px] leading-[1.5] text-muted">
                          Onderhoud en hosting vanaf {formatEuro(p.maintenanceFrom)} per maand · excl. btw
                        </span>
                      )}
                    </p>
                    {p.pdfFile && (
                      <OutboundLink
                        kind="pdf"
                        href={sheetHref(p.pdfFile)}
                        locale={locale}
                        download
                        className={ARROW_LINK}
                      >
                        {/* One span: flex would trim the spaces around the sr-only part. */}
                        <span>
                          Download het verkoopblad<span className="sr-only"> van {p.name}</span> (PDF)
                        </span>
                        {ARROW}
                      </OutboundLink>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* How it works */}
      {steps.length > 0 && (
        <section aria-labelledby="werkwijze-title" className="border-t border-line px-5 py-10 md:px-11">
          <h2 id="werkwijze-title" className={EYEBROW}>Werkwijze</h2>
          <ol role="list" className="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step._key} className="border-t border-line pt-3.5">
                <p aria-hidden className="flex items-center gap-[7px] font-mono text-[12px] text-muted">
                  {i === 0 && <span className="size-[7px] rounded-full bg-accent" />}
                  {packageNumber(i)}
                </p>
                <h3 className="mt-1.5 font-display text-[17px] font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.6] text-text">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Why work with me */}
      {reasons.length > 0 && (
        <section aria-labelledby="waarom-title" className="border-t border-line px-5 py-10 md:px-11">
          <h2 id="waarom-title" className={EYEBROW}>Waarom met mij</h2>
          <div className="mt-6 grid gap-7 md:grid-cols-3 md:gap-8">
            {reasons.map((reason) => (
              <div key={reason._key}>
                <h3 className="font-display text-[16px] font-semibold text-ink">{reason.title}</h3>
                <p className="mt-1.5 max-w-[400px] text-[14px] leading-[1.6] text-text">{reason.body}</p>
                {reason.linkLabel && reason.linkHref && (
                  <ReasonLink href={reason.linkHref} label={reason.linkLabel} locale={locale} />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section aria-labelledby="vragen-title" className="border-t border-line px-5 py-10 md:px-11">
          <h2 id="vragen-title" className={EYEBROW}>Vragen</h2>
          <dl className="mt-4 border-b border-line">
            {faq.map((item) => (
              <div
                key={item._key}
                className="grid gap-1.5 border-t border-line py-[18px] md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-8"
              >
                <dt className="font-display text-[16px] font-semibold text-ink">{item.question}</dt>
                <dd className="max-w-[680px] text-[15px] leading-[1.6] text-text">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Contact panel — the one filled block, as on the About page */}
      <section
        id="verkenning"
        aria-labelledby="verkenning-title"
        className="scroll-mt-20 bg-panel px-5 py-14 md:px-11"
      >
        {page.contactBadge && <AvailabilityBadge status="available" message={page.contactBadge} />}
        <h2
          id="verkenning-title"
          className="mt-4 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-panel-text md:text-[40px]"
        >
          {cta}
          <span className="text-accent">.</span>
        </h2>
        {page.contactBody && (
          <p className="mt-3 max-w-[560px] text-[16px] leading-[1.6] text-panel-muted">{page.contactBody}</p>
        )}
        {email && (
          <OutboundLink
            kind="email"
            href={`mailto:${email}`}
            locale={locale}
            className="mt-6 inline-flex min-h-11 max-w-full items-center font-display text-[22px] font-bold tracking-[-0.02em] text-panel-text [overflow-wrap:anywhere] min-[380px]:text-[24px] md:text-[32px]"
          >
            {accentedEmail(email)}
          </OutboundLink>
        )}
        <div className="mt-4 flex flex-col text-sm text-panel-muted sm:flex-row sm:flex-wrap sm:gap-x-6">
          {phone && (
            <OutboundLink
              kind="phone"
              href={telHref(phone)}
              locale={locale}
              className="inline-flex min-h-11 items-center transition-colors hover:text-panel-text"
            >
              <span>
                <span className="sr-only">Bel </span>
                {phone}
              </span>
            </OutboundLink>
          )}
          {page.allPdfFile && (
            <OutboundLink
              kind="pdf"
              href={sheetHref(page.allPdfFile)}
              locale={locale}
              download
              className="inline-flex min-h-11 items-center transition-colors hover:text-panel-text"
            >
              Download alle verkoopbladen (PDF)
            </OutboundLink>
          )}
        </div>
      </section>
    </main>
  );
}
