/**
 * Winter privacy policy at /<locale>/winter/privacy.
 *
 * The Privacy Policy URL App Store Connect asks for. Static and in the repo
 * (see `winter-privacy.ts`), styled like the rest of the site: one column of
 * body text, display-type headings, hairlines between sections.
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { altMetadata } from "@/lib/seo";
import {
  WINTER_PRIVACY_CONTACT,
  WINTER_REPOSITORY_URL,
  winterPrivacy,
} from "@/lib/winter-privacy";

const PATH = "/winter/privacy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const policy = winterPrivacy[locale];
  return {
    title: policy.title,
    description: policy.description,
    ...altMetadata(locale, PATH),
  };
}

export default async function WinterPrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const policy = winterPrivacy[locale];
  const updated = new Date(`${policy.updated}T12:00:00Z`).toLocaleDateString(
    locale === "nl" ? "nl-BE" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <main id="main" className="px-5 pt-12 pb-16 md:px-11">
      <article className="max-w-[640px] text-[15px] leading-[1.65] text-text">
        <h1 className="font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-ink md:text-[34px] md:leading-[1.1]">
          {policy.title}
          <span className="text-accent">.</span>
        </h1>
        <p className="mt-3 font-mono text-[13px] text-muted">
          {policy.updatedLabel} · <time dateTime={policy.updated}>{updated}</time>
        </p>
        <p className="mt-6">{policy.intro}</p>

        {policy.sections.map((section) => (
          <section key={section.heading} className="mt-10 border-t border-line pt-6">
            <h2 className="font-display text-[18px] font-semibold tracking-[-0.01em] text-ink">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3">
                {paragraph}
              </p>
            ))}
            {section.list && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 marker:text-muted">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <p className="mt-10 border-t border-line pt-6 font-display text-sm font-semibold text-ink">
          <a href={`mailto:${WINTER_PRIVACY_CONTACT}`} className="hover:text-accent">
            {WINTER_PRIVACY_CONTACT}
          </a>
          <span className="mx-3 text-muted">·</span>
          <a href={WINTER_REPOSITORY_URL} className="hover:text-accent">
            github.com/fousa/winter
            <span aria-hidden className="text-accent"> →</span>
          </a>
        </p>
      </article>
    </main>
  );
}
