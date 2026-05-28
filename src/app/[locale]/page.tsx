/**
 * Homepage — the project log. Server component that fetches project data
 * and passes it to the client-side ProjectLog for filter/expand interactivity.
 */
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { ProjectLog } from "@/components/work/ProjectLog";
import { getProjects } from "@/lib/work";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const projects = await getProjects(locale);

  return (
    <main id="main">
      <div className="px-5 pb-[34px] pt-12 md:px-11">
        <h1 className="max-w-[560px] font-display text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] md:text-[34px] md:leading-[1.1]">
          Freelance iOS &amp; web developer.
        </h1>
        <p className="mt-[14px] max-w-[480px] text-[15px] leading-[1.6] text-muted">
          Twenty years and sixty-five projects, logged. Filter by what
          you&rsquo;re looking for.
        </p>
      </div>
      <ProjectLog projects={projects} />
    </main>
  );
}
