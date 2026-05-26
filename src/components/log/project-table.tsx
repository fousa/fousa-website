/**
 * Renders the full project log as an HTML <table>. Phase 3a shows every
 * project — no filtering, no expansion. The header row uses monospace
 * uppercase labels matching the wireframe.
 *
 * Mobile: overflow-x-auto on the wrapper. Phase 3b will redesign mobile
 * properly (probably to a card list).
 */
import {t} from '@/i18n/messages'
import type {Locale} from '@/i18n/config'
import type {PROJECTS_QUERY_RESULT} from '@/sanity.types'
import {ProjectRow} from './project-row'

export function ProjectTable({
  projects,
  locale,
}: {
  projects: PROJECTS_QUERY_RESULT
  locale: Locale
}) {
  if (!projects || projects.length === 0) {
    return <p className="py-8 text-center font-mono text-[12px] text-ink-muted">No projects yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] table-fixed border-collapse">
        <colgroup>
          <col style={{width: '24%'}} />
          <col style={{width: '24%'}} />
          <col style={{width: '12%'}} />
          <col style={{width: '20%'}} />
          <col style={{width: '8%'}} />
          <col style={{width: '12%'}} />
        </colgroup>
        <thead>
          <tr className="border-b border-ink-faint/30">
            {(['project', 'client', 'stack', 'role', 'year', 'state'] as const).map((key, i) => (
              <th
                key={key}
                className={`px-2 py-3 font-mono text-[9px] font-medium uppercase tracking-wider text-ink-muted ${
                  i === 5 ? 'text-right' : 'text-left'
                }`}
              >
                {t(locale, key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <ProjectRow key={p._id} project={p} locale={locale} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
