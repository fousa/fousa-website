'use client'
// Client component: composes the URL/hash hooks with the presentational
// list and filter bar.

/**
 * The orchestrator. Fetches no data — accepts the full project list as a
 * prop and handles all client-side state:
 *
 *   - Filter state (delegated to useFilterState — URL search params)
 *   - Filtered projects (derived via filterProjects)
 *   - Expansion state (delegated to useExpandedSlug — URL hash)
 *
 * Renders the FilterBar above the list (or empty state). The "All projects"
 * count above the table reflects the filtered count, not the total.
 */
import {useMemo} from 'react'
import {t} from '@/i18n/messages'
import {useFilterState} from '@/hooks/use-filter-state'
import {useExpandedSlug} from '@/hooks/use-expanded-slug'
import {filterProjects, deriveFilterCounts} from '@/lib/filter-projects'
import type {Locale} from '@/i18n/config'
import type {PROJECTS_QUERY_RESULT} from '@/sanity.types'
import {FilterBar} from './filter-bar'
import {ProjectList} from './project-list'
import {EmptyState} from './empty-state'

export function InteractiveLog({
  projects,
  locale,
}: {
  projects: PROJECTS_QUERY_RESULT
  locale: Locale
}) {
  const {filters, toggle, reset, hasAnyFilter} = useFilterState()
  const {slug: expandedSlug, toggle: toggleExpanded} = useExpandedSlug()

  // Filter counts: computed once from the FULL list (so chips don't go to zero)
  const counts = useMemo(() => deriveFilterCounts(projects), [projects])

  // Filtered projects: re-derived when filters change
  const filtered = useMemo(
    () => filterProjects(projects, filters),
    [projects, filters]
  )

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-3">
        <h1 className="font-sans text-[22px] font-medium text-ink">
          {t(locale, 'allProjects')}
        </h1>
        <span className="font-mono text-[12px] text-ink-faint">
          {filtered.length}
          {hasAnyFilter && projects && (
            <span className="text-ink-faint/60"> / {projects.length}</span>
          )}
        </span>
      </div>

      <div className="mb-6">
        <FilterBar
          filters={filters}
          counts={counts}
          onToggle={toggle}
          onReset={reset}
          hasAnyFilter={hasAnyFilter}
          locale={locale}
        />
      </div>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {filtered.length === projects.length
          ? t(locale, 'allProjectsVisible')
          : t(locale, 'filteredCount').replace('{count}', String(filtered.length))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState locale={locale} onReset={reset} />
      ) : (
        <ProjectList
          projects={filtered}
          locale={locale}
          expandedSlug={expandedSlug}
          onToggle={toggleExpanded}
        />
      )}
    </div>
  )
}
