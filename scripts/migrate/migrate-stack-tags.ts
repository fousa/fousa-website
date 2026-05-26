/**
 * Ensures every tech mentioned in project frontmatter has a corresponding
 * Stack tag document in Sanity.
 *
 * Called by the project migration before any project is written. Uses a
 * deterministic _id based on the tech name's slug, so existing tags
 * (from seed-stack-tags.ts) aren't duplicated. Auto-assigns a category
 * based on a hand-tuned mapping; anything unknown defaults to 'other'.
 *
 * Returns a map from tech name → Sanity _id so the project migration can
 * resolve "techStack: [Swift, iOS]" → array of references.
 */
import type {SanityClient} from '@sanity/client'
import {slugify} from './slugify'

/**
 * Hand-tuned category assignment for techs seen in the source content.
 * Anything not listed falls through to 'other' — review the migration log
 * and re-categorize in the Studio if anything important lands in Other.
 */
const CATEGORY: Record<string, 'ios' | 'rails' | 'frontend' | 'tooling' | 'other'> = {
  // iOS / Apple
  'ios': 'ios',
  'ipados': 'ios',
  'macos': 'ios',
  'watchos': 'ios',
  'tvos': 'ios',
  'iphone': 'ios',
  'ipad': 'ios',
  'swift': 'ios',
  'swiftui': 'ios',
  'objective-c': 'ios',
  'rubymotion': 'ios',
  // Backend / Rails
  'ruby-on-rails': 'rails',
  'ruby': 'rails',
  'api': 'rails',
  'php': 'rails',
  'java': 'rails',
  'node': 'rails',
  // Frontend
  'website': 'frontend',
  'javascript': 'frontend',
  'html': 'frontend',
  // Tooling
  'jenkins': 'tooling',
}

export type StackTagIndex = Map<string, string>

/**
 * @param client - Authenticated Sanity client with write permissions
 * @param techNames - All distinct tech names seen across projects
 * @returns A map from original tech name → Sanity _id
 */
export async function ensureStackTags(
  client: SanityClient,
  techNames: Set<string>
): Promise<StackTagIndex> {
  const index: StackTagIndex = new Map()

  for (const name of techNames) {
    const slug = slugify(name)
    const id = `stackTag.${slug}`
    const category = CATEGORY[slug] ?? 'other'

    await client.createOrReplace({
      _id: id,
      _type: 'stackTag',
      name,
      slug: {_type: 'slug', current: slug},
      category,
    })

    index.set(name, id)
  }

  console.log(`  Ensured ${index.size} stack tags`)
  return index
}
