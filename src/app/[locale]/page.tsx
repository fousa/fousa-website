/**
 * Homepage — the project log.
 *
 * Phase 3a: server-rendered table of all projects. No filters or expansion
 * yet. Title + count above the table; that's it.
 */
import {notFound} from 'next/navigation'
import {isLocale} from '@/i18n/config'
import {fetchSanity} from '@/sanity/fetch'
import {PROJECTS_QUERY} from '@/sanity/queries/projects'
import {t} from '@/i18n/messages'
import {ProjectTable} from '@/components/log/project-table'
import type {PROJECTS_QUERY_RESULT} from '@/sanity.types'

export default async function HomePage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  if (!isLocale(locale)) notFound()

  const projects = await fetchSanity<PROJECTS_QUERY_RESULT>(PROJECTS_QUERY)

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="font-sans text-[22px] font-medium text-ink">
          {t(locale, 'allProjects')}
        </h1>
        <span className="font-mono text-[12px] text-ink-faint">
          {projects?.length ?? 0}
        </span>
      </div>
      <ProjectTable projects={projects} locale={locale} />
    </main>
  )
}
