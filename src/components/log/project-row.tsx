/**
 * One row in the project log table. Server component for Phase 3a — no
 * click handlers or hover state yet. Phase 3b will make this a client
 * component with expand behavior.
 *
 * Columns: project name, employer/client, primary stack chip, role, year,
 * state. Layout matches the wireframe — monospace for metadata, sans for
 * names, generous row height.
 */
import type {PROJECTS_QUERY_RESULT} from '@/sanity.types'
import type {Locale} from '@/i18n/config'
import {StackChip} from './stack-chip'
import {StateIndicator} from './state-indicator'

type Project = NonNullable<PROJECTS_QUERY_RESULT>[number]

export function ProjectRow({project, locale}: {project: Project; locale: Locale}) {
  const primaryStack = project.stack?.[0]
  // Display "Employer · Client" if both are present and distinct.
  const employerName = project.employer?.name ?? '—'
  const clientLabel = project.client && project.client !== employerName
    ? `${employerName} · ${project.client}`
    : employerName

  return (
    <tr className="border-b border-black/5">
      <td className="px-2 py-3 font-sans text-[13px] font-medium text-ink">
        {project.name}
      </td>
      <td className="px-2 py-3 font-sans text-[13px] text-ink-muted">
        {clientLabel}
      </td>
      <td className="px-2 py-3">
        {primaryStack ? (
          <StackChip name={primaryStack.name ?? ''} category={primaryStack.category as never} />
        ) : null}
      </td>
      <td className="px-2 py-3 font-sans text-[13px] text-ink-muted">
        {project.role ?? '—'}
      </td>
      <td className="px-2 py-3 font-mono text-[12px] text-ink-muted">
        {project.year}
        {project.endYear && project.endYear !== project.year && <>–{String(project.endYear).slice(2)}</>}
      </td>
      <td className="px-2 py-3 text-right">
        <StateIndicator state={project.state as never} locale={locale} />
      </td>
    </tr>
  )
}
