/**
 * Homepage — the project log. Server component that fetches project data
 * from Sanity and passes it to the client-side ProjectLog for filter/expand
 * interactivity. The lead (name, role, filter intro) comes from the Profile
 * singleton.
 */
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";
import { pickLocale } from "@/i18n/pick-locale";
import { ProjectLog } from "@/components/work/ProjectLog";
import { HomeLead } from "@/components/home/HomeLead";
import { getProjects, getEmptyStates } from "@/lib/work";
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

  const [projects, profile, overrides] = await Promise.all([
    getProjects(locale),
    fetchSanity<PROFILE_QUERY_RESULT>(PROFILE_QUERY),
    getEmptyStates(locale),
  ]);

  const name = profile?.name ?? "Jelle Vandebeeck";

  const role =
    pickLocale(
      typeof profile?.roleLine === "object" ? profile.roleLine : null,
      locale,
    ) ?? t(locale, "homeHeadline");

  const filterIntro =
    pickLocale(
      typeof profile?.filterIntro === "object" ? profile.filterIntro : null,
      locale,
    ) ?? t(locale, "homeFilterIntroFallback");

  return (
    <main id="main">
      <HomeLead name={name} role={role} filterIntro={filterIntro} />
      <Suspense>
        <ProjectLog projects={projects} locale={locale} overrides={overrides} />
      </Suspense>
    </main>
  );
}
