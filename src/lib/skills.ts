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
