/**
 * Computes the dominant stack category for each employer based on their
 * project history. Used to wire career timeline rows to filtered homepage
 * URLs ("click on icapps → see all icapps-era iOS projects").
 *
 * "Dominant" = most-frequent category across that employer's projects.
 * Ties broken by enum order (ios > rails > frontend > tooling > other) —
 * arbitrary but stable.
 */
import type {PROJECTS_QUERY_RESULT} from '@/sanity.types'
import type {StackCategory} from './filter-projects'

const TIE_BREAK_ORDER: readonly StackCategory[] = [
  'ios',
  'rails',
  'frontend',
  'tooling',
  'other',
]

/**
 * Build a map from employer _id → dominant stack category.
 *
 * @param projects - The full project list (with dereferenced employer + stack)
 * @returns Map of employer _id to its dominant stack category, or null when
 *          the employer has no projects with stack tags
 */
export function deriveEmployerStackCategories(
  projects: PROJECTS_QUERY_RESULT
): Map<string, StackCategory | null> {
  const counts = new Map<string, Map<StackCategory, number>>()

  for (const p of projects ?? []) {
    const employerId = p.employer?._id
    if (!employerId) continue

    const cats = new Set<StackCategory>()
    for (const tag of p.stack ?? []) {
      const c = tag?.category as StackCategory | undefined
      if (c) cats.add(c)
    }
    if (cats.size === 0) continue

    if (!counts.has(employerId)) counts.set(employerId, new Map())
    const bucket = counts.get(employerId)!
    for (const c of cats) {
      bucket.set(c, (bucket.get(c) ?? 0) + 1)
    }
  }

  const result = new Map<string, StackCategory | null>()
  for (const [employerId, bucket] of counts) {
    let winner: StackCategory | null = null
    let winnerCount = -1
    for (const cat of TIE_BREAK_ORDER) {
      const c = bucket.get(cat) ?? 0
      if (c > winnerCount) {
        winnerCount = c
        winner = cat
      }
    }
    result.set(employerId, winner)
  }
  return result
}
