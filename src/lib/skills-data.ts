/**
 * Server-side fetcher for the About "Skills" section. Runs the skills GROQ
 * query (server-only, token-bearing) and shapes rows into `Skill`s; the
 * grouping/sizing helpers stay in `skills.ts` so the client `Skills` component
 * can import them without the Sanity client.
 */
import {fetchSanity} from '@/sanity/fetch'
import {SKILLS_QUERY} from '@/sanity/queries/skills'
import type {SKILLS_QUERY_RESULT} from '@/sanity.types'
import type {Skill, SkillCategory} from './skills'

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
