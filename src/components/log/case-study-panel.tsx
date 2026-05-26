/**
 * Expanded case study panel — shown below a row when that row is the
 * currently-active expanded one. Full implementation in Step 4.
 */
import type {Locale} from '@/i18n/config'
import type {PROJECTS_QUERY_RESULT} from '@/sanity.types'

type Project = NonNullable<PROJECTS_QUERY_RESULT>[number]

export function CaseStudyPanel({
  project,
  locale,
}: {
  project: Project
  locale: Locale
}) {
  return (
    <div className="px-2 py-6 bg-surface-warm/40">
      <div className="rounded-lg bg-surface p-5 border border-black/5">
        <p className="font-mono text-[12px] text-ink-muted">{project.name} — {locale}</p>
      </div>
    </div>
  )
}
