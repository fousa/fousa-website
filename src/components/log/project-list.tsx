/**
 * Renders the project list with header + rows. Pure presentational —
 * expansion and filter state are owned by the parent (InteractiveLog).
 *
 * Each row's <li> has id="project-<slug>" so deep links (/en#itsme) can
 * scroll the right row into view.
 */
import type {Locale} from '@/i18n/config'
import type {PROJECTS_QUERY_RESULT} from '@/sanity.types'
import {ProjectListHeader} from './project-list-header'
import {ProjectRow} from './project-row'
import {CaseStudyPanel} from './case-study-panel'

export function ProjectList({
  projects,
  locale,
  expandedSlug,
  onToggle,
}: {
  projects: NonNullable<PROJECTS_QUERY_RESULT>
  locale: Locale
  expandedSlug: string | null
  onToggle: (slug: string) => void
}) {
  return (
    <div>
      <ProjectListHeader locale={locale} />
      <ul role="list" className="divide-y divide-black/5">
        {projects.map((project) => {
          const isExpanded = project.slug === expandedSlug
          return (
            <li
              key={project._id}
              id={project.slug ? `project-${project.slug}` : undefined}
            >
              <ProjectRow
                project={project}
                locale={locale}
                isExpanded={isExpanded}
                onToggle={() => project.slug && onToggle(project.slug)}
              />
              <CollapsiblePanel isOpen={isExpanded}>
                <CaseStudyPanel project={project} locale={locale} />
              </CollapsiblePanel>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * CSS-only height animation using the grid-rows-[0fr → 1fr] trick.
 * No JavaScript measurement, no fixed max-height — content sizes itself.
 * Respects prefers-reduced-motion.
 */
function CollapsiblePanel({
  isOpen,
  children,
}: {
  isOpen: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`grid ${
        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      } transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none`}
      aria-hidden={!isOpen}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}
