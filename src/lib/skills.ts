/**
 * Typed content layer for the About "Skills" section.
 *
 * One stack tag that's actually used by a project, normalized into a flat
 * `Skill` the component renders directly: a filter `key` (the tag slug), a
 * display `name`, and the `count` of projects using it. Backed by SKILLS_QUERY.
 */
import {fetchSanity} from '@/sanity/fetch'
import {SKILLS_QUERY} from '@/sanity/queries/skills'
import type {SKILLS_QUERY_RESULT} from '@/sanity.types'

/** A technology used by ≥1 project, with its filter key and usage count. */
export type Skill = {
  key: string
  name: string
  count: number
}

/** A skill plus its rendered size step and vertical drift for the cloud. */
export type SizedSkill = Skill & {step: 1 | 2 | 3 | 4 | 5; drift: number}

/**
 * Stable 32-bit-ish hash of a string. Drives the deterministic drift and
 * display order so the server and client render identically — no hydration
 * mismatch, and no jitter when the component re-renders.
 *
 * @param s - input string (a skill key)
 * @returns a non-negative integer hash
 */
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * Vertical drift in px (−6..+6) for a skill, derived from its key so it stays
 * constant across renders. Gives the cloud a gently uneven baseline.
 *
 * @param key - skill key
 * @returns drift offset in pixels, −6..+6
 */
export function driftOffset(key: string): number {
  return (hash(key) % 13) - 6
}

/**
 * Assign each skill a size step 1 (largest/most-used) … 5 (smallest), by rank
 * quantile over the FULL set so a skill's size is stable whether the single-use
 * tail is shown or not. Equal counts share a step (ties take the first/larger
 * step seen).
 *
 * @param skills - the complete skill set
 * @returns a map of skill key → size step
 */
export function sizeSkills(skills: Skill[]): Map<string, 1 | 2 | 3 | 4 | 5> {
  const sorted = [...skills].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  )
  const n = sorted.length || 1
  const out = new Map<string, 1 | 2 | 3 | 4 | 5>()
  let prevCount: number | null = null
  let prevStep: 1 | 2 | 3 | 4 | 5 = 1
  sorted.forEach((s, i) => {
    if (s.count === prevCount) {
      out.set(s.key, prevStep)
      return
    }
    const step = (Math.min(4, Math.floor((i / n) * 5)) + 1) as 1 | 2 | 3 | 4 | 5
    out.set(s.key, step)
    prevCount = s.count
    prevStep = step
  })
  return out
}

/**
 * Deterministic display order that interleaves sizes (sorted by key-hash) so
 * the cloud reads organic — a large tag beside a small one — rather than a
 * heavy→light gradient.
 *
 * @param skills - skills to order
 * @returns a new array in hash order (input not mutated)
 */
export function displayOrder(skills: Skill[]): Skill[] {
  return [...skills].sort((a, b) => hash(a.key) - hash(b.key))
}

/**
 * Fetch every stack tag used by at least one project, most-used first.
 * Rows missing a slug or name are dropped — a skill with no filter key can't
 * be linked, and one with no display name has nothing to show.
 *
 * @returns the usable skills, ordered count desc then name asc
 */
export async function getSkills(): Promise<Skill[]> {
  const rows = await fetchSanity<SKILLS_QUERY_RESULT>(SKILLS_QUERY)
  if (!rows) return []
  return rows
    .filter((r): r is {key: string; name: string; count: number} =>
      Boolean(r.key) && Boolean(r.name),
    )
    .map((r) => ({key: r.key, name: r.name, count: r.count ?? 0}))
}
