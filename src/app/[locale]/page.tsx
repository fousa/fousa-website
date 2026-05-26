/**
 * Homepage — the project log.
 *
 * Server component: fetches the project list once, hands it to the
 * InteractiveLog client component which owns filter/expansion state.
 */
import {notFound} from 'next/navigation'
import {isLocale} from '@/i18n/config'
import {fetchSanity} from '@/sanity/fetch'
import {PROJECTS_QUERY} from '@/sanity/queries/projects'
import {InteractiveLog} from '@/components/log/interactive-log'
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
      <InteractiveLog projects={projects} locale={locale} />
    </main>
  )
}
