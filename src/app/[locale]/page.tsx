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
import { getSkills } from "@/lib/skills";
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

  const [projects, profile, overrides, skills] = await Promise.all([
    getProjects(locale),
    fetchSanity<PROFILE_QUERY_RESULT>(PROFILE_QUERY),
    getEmptyStates(locale),
    getSkills(),
  ]);

  // Map each skill key to its display name so the log's "Filtering by" pills
  // render "PostgreSQL", not the raw slug.
  const skillLabels = Object.fromEntries(skills.map((s) => [s.key, s.name]));

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
      <HomeLead
        locale={locale}
        name={name}
        role={role}
        filterIntro={filterIntro}
      />
      <Suspense>
        <ProjectLog
          projects={projects}
          locale={locale}
          overrides={overrides}
          skillLabels={skillLabels}
        />
      </Suspense>
    </main>
  );
}
