/**
 * One row in the project log.
 *
 * Renders two layouts:
 *   - Desktop (md and up): a 6-column grid matching the header
 *   - Mobile: stacked card with name + state on the top line, metadata below
 *
 * The whole row is a <button> when the project has expandable content
 * (deck / description / screenshots / outcome). Otherwise it's a div —
 * thin projects with only a name/year shouldn't dangle a click affordance.
 *
 * Active state (when this is the currently-expanded row) lifts the background
 * to surface-warm for visual continuity with the panel that opens below.
 */
import {clsx} from 'clsx'
import {StackChip} from './stack-chip'
import {StateIndicator} from './state-indicator'
import type {Locale} from '@/i18n/config'
import type {PROJECTS_QUERY_RESULT} from '@/sanity.types'

type Project = NonNullable<PROJECTS_QUERY_RESULT>[number]

/**
 * Whether the project has enough content to warrant the expand affordance.
 */
export function hasExpandableContent(project: Project): boolean {
  const deck = project.deck
  const description = project.description
  return Boolean(
    (deck && (typeof deck === 'string' || deck.en || deck.nl)) ||
      (description && (description.en?.length || description.nl?.length)) ||
      (project.screenshots && project.screenshots.length > 0) ||
      (project.outcome && (project.outcome.en || project.outcome.nl))
  )
}

export function ProjectRow({
  project,
  locale,
  isExpanded,
  onToggle,
}: {
  project: Project
  locale: Locale
  isExpanded: boolean
  onToggle: () => void
}) {
  const canExpand = hasExpandableContent(project)
  const primaryStack = project.stack?.[0]

  // Composite "Employer (· Client)" string when client differs from employer
  const employerName = project.employer?.name ?? '—'
  const clientLabel = project.client && project.client !== employerName
    ? `${employerName} · ${project.client}`
    : employerName

  const yearRange = project.endYear && project.endYear !== project.year
    ? `${project.year}–${String(project.endYear).slice(2)}`
    : String(project.year ?? '')

  const baseClasses = clsx(
    'w-full text-left transition-colors',
    canExpand && 'cursor-pointer hover:bg-surface-warm/40',
    isExpanded && 'bg-surface-warm/60'
  )

  const content = (
    <>
      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-[24%_22%_12%_22%_8%_12%] gap-2 px-2 py-3 items-center">
        <span className="font-sans text-[13px] font-medium text-ink truncate">
          {project.name}
        </span>
        <span className="font-sans text-[13px] text-ink-muted truncate">
          {clientLabel}
        </span>
        <span>
          {primaryStack && (
            <StackChip name={primaryStack.name ?? ''} />
          )}
        </span>
        <span className="font-sans text-[13px] text-ink-muted truncate">
          {project.role ?? '—'}
        </span>
        <span className="font-mono text-[12px] text-ink-muted">{yearRange}</span>
        <span className="flex items-center justify-end gap-2">
          <StateIndicator state={project.state as never} locale={locale} />
          {canExpand && (
            <span
              className={clsx(
                'font-mono text-[13px] text-ink-faint transition-transform duration-300 motion-reduce:transition-none',
                isExpanded && 'rotate-180'
              )}
              aria-hidden
            >
              ▾
            </span>
          )}
        </span>
      </div>

      {/* Mobile stacked */}
      <div className="md:hidden flex flex-col gap-1 px-2 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-sans text-[14px] font-medium text-ink truncate">
            {project.name}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <StateIndicator state={project.state as never} locale={locale} />
            {canExpand && (
              <span
                className={clsx(
                  'font-mono text-[13px] text-ink-faint transition-transform duration-300 motion-reduce:transition-none',
                  isExpanded && 'rotate-180'
                )}
                aria-hidden
              >
                ▾
              </span>
            )}
          </div>
        </div>
        <div className="font-mono text-[11px] text-ink-muted flex flex-wrap gap-x-2">
          <span>{yearRange}</span>
          <span aria-hidden>·</span>
          <span>{clientLabel}</span>
          {primaryStack && (
            <>
              <span aria-hidden>·</span>
              <span>{primaryStack.name}</span>
            </>
          )}
        </div>
      </div>
    </>
  )

  if (!canExpand) {
    return <div className={baseClasses}>{content}</div>
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-controls={`panel-${project.slug}`}
      className={baseClasses}
    >
      {content}
    </button>
  )
}
