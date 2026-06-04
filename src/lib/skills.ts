/**
 * Typed content layer for the About "Skills" section.
 *
 * One stack tag that's actually used by a project, normalized into a flat
 * `Skill` the component renders directly: a filter `key` (the tag slug), a
 * display `name`, the `count` of projects using it, and its `category` — the
 * skillCategory it references (with its own key, translatable title, and display
 * order) or null when unclassified. Backed by SKILLS_QUERY.
 */
import {fetchSanity} from '@/sanity/fetch'
import {SKILLS_QUERY} from '@/sanity/queries/skills'
import type {SKILLS_QUERY_RESULT} from '@/sanity.types'

/** Translatable label, EN always present, NL optional (falls back to EN). */
export type I18nTitle = {en: string; nl: string | null}

/**
 * The editor-managed skillCategory a skill belongs to: a stable `key` (slug),
 * its translatable `title`, and the drag-ordered `order` (a lexorank string)
 * that fixes where the group appears.
 */
export type SkillCategory = {key: string; title: I18nTitle; order: string}

/**
 * A technology used by ≥1 project, with its filter key, usage count, and the
 * category it references (null when unclassified → renders under "Other").
 */
export type Skill = {
  key: string
  name: string
  count: number
  category: SkillCategory | null
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
 * The subset of skills emphasized in ink ("core") versus dimmed. Core = global
 * frequency tier 1–2 from {@link sizeSkills} (its rank quantiles over the full
 * set), so the most-used skills across every category read as ink and the long
 * tail dims — a quiet frequency hint with no size jumps.
 *
 * @param skills - the complete skill set
 * @returns the set of core skill keys (O(1) membership lookup)
 */
export function coreKeys(skills: Skill[]): Set<string> {
  const steps = sizeSkills(skills)
  return new Set(
    skills.filter((s) => (steps.get(s.key) ?? 5) <= 2).map((s) => s.key),
  )
}

/** Key of the synthetic bucket for tags with no category reference. */
export const OTHER_KEY = 'other'

/** One rendered group: a category key, its title (null for "Other"), and skills. */
export type SkillGroup = {key: string; title: I18nTitle | null; skills: Skill[]}

/** Sorts after any lexorank value, so a category missing one lands near the end. */
const ORDER_LAST = '~'

/**
 * Group skills by their referenced category. Group order follows each category's
 * drag-ordered `order` (a lexorank string, compared lexically; ties broken by
 * English title); skills with no category collect into the synthetic `OTHER_KEY`
 * bucket, always rendered last. Within each group, skills sort by count desc then
 * name asc. Empty groups can't occur — a group exists only because a skill landed
 * in it.
 *
 * @param skills - the full skill set
 * @returns groups in display order, each with its sorted skills (input not mutated)
 */
export function groupByCategory(skills: Skill[]): SkillGroup[] {
  const buckets = new Map<
    string,
    {title: I18nTitle | null; order: string; skills: Skill[]}
  >()
  for (const s of skills) {
    const key = s.category?.key ?? OTHER_KEY
    const bucket = buckets.get(key)
    if (bucket) bucket.skills.push(s)
    else
      buckets.set(key, {
        title: s.category?.title ?? null,
        order: s.category?.order ?? ORDER_LAST,
        skills: [s],
      })
  }
  return [...buckets.entries()]
    .map(([key, b]) => ({
      key,
      title: b.title,
      order: b.order,
      skills: b.skills.sort(
        (a, c) => c.count - a.count || a.name.localeCompare(c.name),
      ),
    }))
    .sort((a, c) => {
      if (a.key === OTHER_KEY) return 1
      if (c.key === OTHER_KEY) return -1
      return a.order.localeCompare(c.order) || (a.title?.en ?? '').localeCompare(c.title?.en ?? '')
    })
    .map(({key, title, skills}) => ({key, title, skills}))
}

/**
 * Fetch every stack tag used by at least one project, most-used first.
 * Rows missing a slug or name are dropped — a skill with no filter key can't
 * be linked, and one with no display name has nothing to show. A category
 * reference is kept only when it resolves to a key; otherwise the skill is
 * treated as uncategorized.
 *
 * @returns the usable skills, ordered count desc then name asc
 */
export async function getSkills(): Promise<Skill[]> {
  const rows = await fetchSanity<SKILLS_QUERY_RESULT>(SKILLS_QUERY)
  if (!rows) return []
  return rows
    .filter((r): r is (typeof rows)[number] & {key: string; name: string} =>
      Boolean(r.key) && Boolean(r.name),
    )
    .map((r) => {
      const cat = r.category
      const category: SkillCategory | null =
        cat && cat.key
          ? {
              key: cat.key,
              title: {en: cat.title?.en ?? cat.key, nl: cat.title?.nl ?? null},
              order: cat.order ?? '',
            }
          : null
      return {key: r.key, name: r.name, count: r.count ?? 0, category}
    })
}
