/**
 * Pure filtering for the project log.
 *
 * Three groups:
 *   - stack        — `apple` matches a project carrying any Apple-platform
 *                    stack tag (iOS / iPadOS / macOS / watchOS / Swift / SwiftUI).
 *   - status       — `active` means the project is ongoing (no end year).
 *   - affiliation  — how the work was done: `freelance` (engagement) or
 *                    `icapps` / `10to1` (employer). Mutually exclusive per
 *                    project, so picking several = OR.
 *
 * OR within a group, AND across groups. Empty array = group not applied.
 */
import type {PROJECTS_QUERY_RESULT} from '@/sanity.types'

export type StackFilter = 'apple'
export type StatusFilter = 'active'
export type AffiliationFilter = 'freelance' | 'icapps' | '10to1'

export type Filters = {
  stack: StackFilter[]
  status: StatusFilter[]
  affiliation: AffiliationFilter[]
}

type Project = NonNullable<PROJECTS_QUERY_RESULT>[number]

/** Stack tags that count as "Apple" work. Normalized: lowercase, no spaces. */
const APPLE_TAGS = new Set(['ios', 'ipados', 'macos', 'watchos', 'swift', 'swiftui'])

/** Normalize a stack tag for comparison (lowercase, strip spaces). */
function normTag(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '')
}

/** Ongoing = no end year set. */
function isActive(project: Project): boolean {
  return !project.endYear
}

/** Employer slug projected by the GROQ query (lowercase organisation). */
function employerSlug(project: Project): string | null {
  const raw = project.employer?.slug
  return raw ? String(raw).toLowerCase() : null
}

function matchesStack(project: Project, picks: StackFilter[]): boolean {
  if (!picks.includes('apple')) return false
  return (project.stack ?? [])
    .map((s) => s?.slug)
    .filter((t): t is string => Boolean(t))
    .some((t) => APPLE_TAGS.has(normTag(t)))
}

function matchesAffiliation(project: Project, picks: AffiliationFilter[]): boolean {
  return picks.some((p) =>
    p === 'freelance' ? project.engagement === 'freelance' : employerSlug(project) === p
  )
}

function projectMatches(project: Project, filters: Filters): boolean {
  if (filters.stack.length && !matchesStack(project, filters.stack)) return false
  if (filters.status.includes('active') && !isActive(project)) return false
  if (filters.affiliation.length && !matchesAffiliation(project, filters.affiliation)) return false
  return true
}

export function filterProjects(
  projects: PROJECTS_QUERY_RESULT,
  filters: Filters
): NonNullable<PROJECTS_QUERY_RESULT> {
  if (!projects) return []
  return projects.filter((p) => projectMatches(p, filters))
}

export type FilterCounts = {
  stack: Record<StackFilter, number>
  status: Record<StatusFilter, number>
  affiliation: Record<AffiliationFilter, number>
}

/** Counts from the FULL list, so chips never drop to zero as you filter. */
export function deriveFilterCounts(projects: PROJECTS_QUERY_RESULT): FilterCounts {
  const counts: FilterCounts = {
    stack: {apple: 0},
    status: {active: 0},
    affiliation: {freelance: 0, icapps: 0, '10to1': 0},
  }
  for (const p of projects ?? []) {
    if (matchesStack(p, ['apple'])) counts.stack.apple++
    if (isActive(p)) counts.status.active++
    if (p.engagement === 'freelance') counts.affiliation.freelance++
    const emp = employerSlug(p)
    if (emp === 'icapps') counts.affiliation.icapps++
    if (emp === '10to1') counts.affiliation['10to1']++
  }
  return counts
}
