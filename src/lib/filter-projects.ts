/**
 * Pure filtering for the project log.
 *
 * Two filter categories:
 *   - `stack` filters by Stack tag CATEGORY (ios / rails / frontend / tooling
 *     / other), NOT by individual tag. A project with any tag in the chosen
 *     category(ies) matches.
 *   - `engagement` filters by the project's engagement enum.
 *
 * Within a category: OR. Across categories: AND.
 * "iOS + Rails" → projects with iOS OR Rails tags.
 * "iOS + Freelance" → projects with iOS tags AND engagement=freelance.
 *
 * Empty arrays mean "no filter applied for this category" — the whole list
 * passes through.
 */
import type {PROJECTS_QUERY_RESULT} from '@/sanity.types'

export type StackCategory = 'ios' | 'rails' | 'frontend' | 'tooling' | 'other'
export type Engagement = 'freelance' | 'full-time' | 'owner' | 'internship'

export type Filters = {
  stack: StackCategory[]
  engagement: Engagement[]
}

type Project = NonNullable<PROJECTS_QUERY_RESULT>[number]

/**
 * Apply filters to a list of projects.
 *
 * @param projects - Source list (typically all projects, server-fetched)
 * @param filters - Current filter state
 * @returns A new array with projects matching ALL non-empty categories
 */
export function filterProjects(
  projects: PROJECTS_QUERY_RESULT,
  filters: Filters
): NonNullable<PROJECTS_QUERY_RESULT> {
  if (!projects) return []
  return projects.filter((p) => projectMatches(p, filters))
}

function projectMatches(project: Project, filters: Filters): boolean {
  // Stack: project has at least one tag whose category is in filters.stack
  if (filters.stack.length > 0) {
    const projectCategories = new Set(
      (project.stack ?? [])
        .map((s) => s?.category)
        .filter((c): c is StackCategory => Boolean(c))
    )
    const matchesStack = filters.stack.some((c) => projectCategories.has(c))
    if (!matchesStack) return false
  }

  // Engagement: project's engagement is in the chosen list
  if (filters.engagement.length > 0) {
    if (!project.engagement) return false
    if (!filters.engagement.includes(project.engagement as Engagement)) return false
  }

  return true
}

/**
 * Pre-compute filter option counts from the full project list.
 *
 * Counts are computed once from the full list — they represent "what's
 * available in total" rather than "what's available given current filters".
 * This is the standard pattern: chips don't go to zero as you filter, so
 * you can always add another filter and see something.
 *
 * @param projects - The full project list (unfiltered)
 * @returns Per-option counts for each filter category
 */
export function deriveFilterCounts(projects: PROJECTS_QUERY_RESULT): {
  stack: Record<StackCategory, number>
  engagement: Record<Engagement, number>
} {
  const stack: Record<StackCategory, number> = {
    ios: 0,
    rails: 0,
    frontend: 0,
    tooling: 0,
    other: 0,
  }
  const engagement: Record<Engagement, number> = {
    freelance: 0,
    'full-time': 0,
    owner: 0,
    internship: 0,
  }

  for (const p of projects ?? []) {
    // Per-category stack count: a project counts once per distinct category
    const cats = new Set(
      (p.stack ?? [])
        .map((s) => s?.category)
        .filter((c): c is StackCategory => Boolean(c))
    )
    for (const c of cats) stack[c]++

    // Engagement count
    if (p.engagement && engagement[p.engagement as Engagement] !== undefined) {
      engagement[p.engagement as Engagement]++
    }
  }

  return {stack, engagement}
}
