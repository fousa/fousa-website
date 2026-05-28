/**
 * Homepage — the project log. Server component that fetches project data
 * from Sanity and passes it to the client-side ProjectLog for filter/expand
 * interactivity. The lead headline and subline come from the Profile singleton.
 */
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";
import { pickLocale } from "@/i18n/pick-locale";
import { ProjectLog } from "@/components/work/ProjectLog";
import { getProjects } from "@/lib/work";
import { fetchSanity } from "@/sanity/fetch";
import { PROFILE_QUERY } from "@/sanity/queries/profile";
import type { PROFILE_QUERY_RESULT } from "@/sanity.types";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [projects, profile] = await Promise.all([
    getProjects(locale),
    fetchSanity<PROFILE_QUERY_RESULT>(PROFILE_QUERY),
  ]);

  const headline =
    pickLocale(
      typeof profile?.leadHeadline === "object" ? profile.leadHeadline : null,
      locale,
    ) ?? t(locale, "homeHeadline");

  const subline =
    pickLocale(
      typeof profile?.leadSubline === "object" ? profile.leadSubline : null,
      locale,
    ) ?? t(locale, "homeSubline");

  return (
    <main id="main">
      <div className="px-5 pb-[34px] pt-12 md:px-11">
        <h1 className="max-w-[560px] font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] md:text-[34px] md:leading-[1.1]">
          {headline}
        </h1>
        <p className="mt-[14px] max-w-[480px] text-[15px] leading-[1.6] text-muted">
          {subline}
        </p>
      </div>
      <ProjectLog projects={projects} locale={locale} />
    </main>
  );
}
