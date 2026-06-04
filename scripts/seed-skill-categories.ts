/**
 * One-shot: seed the skillCategory documents and migrate stack tags to them.
 *
 * The skill category used to be a hardcoded string on each stack tag. It is now
 * a reference to a skillCategory document. This script:
 *   1. Creates the six original categories (idempotent — `createIfNotExists`, so
 *      a re-run never clobbers labels/order you've since edited in Studio).
 *   2. Re-points any stack tag whose `category` is still a legacy string at the
 *      matching seeded document; an unrecognised string is unset so it falls
 *      back to "Other" instead of lingering as an invalid value.
 *
 * Run with:  pnpm seed:skill-categories
 * Dry run:   pnpm seed:skill-categories:dry
 *
 * Requires SANITY_API_TOKEN in .env.local with write permissions.
 * BEFORE RUNNING: take a dataset backup with `pnpm backup`.
 */
import {createClient} from '@sanity/client'
import {apiVersion, dataset, projectId} from '../src/sanity/env'

const token = process.env.SANITY_API_TOKEN
if (!token) {
  console.error('Missing SANITY_API_TOKEN — set it in .env.local and re-run.')
  process.exit(1)
}

const client = createClient({projectId, dataset, apiVersion, token, useCdn: false})

const dryRun = process.argv.includes('--dry-run')

type CategorySeed = {slug: string; en: string; nl: string; order: number}

// Mirrors the original hardcoded labels and display order.
const CATEGORIES: CategorySeed[] = [
  {slug: 'language', en: 'Languages', nl: 'Talen', order: 1},
  {slug: 'framework', en: 'Frameworks', nl: 'Frameworks', order: 2},
  {slug: 'platform', en: 'Platforms', nl: 'Platformen', order: 3},
  {slug: 'apple', en: 'Apple capabilities', nl: 'Apple-mogelijkheden', order: 4},
  {slug: 'service', en: 'Services & integrations', nl: 'Services & integraties', order: 5},
  {slug: 'infra', en: 'Infrastructure', nl: 'Infrastructuur', order: 6},
]

const docId = (slug: string) => `skillCategory.${slug}`
const validSlugs = new Set(CATEGORIES.map((c) => c.slug))

async function run() {
  console.log(
    `Seeding ${CATEGORIES.length} skill categories into "${dataset}"${dryRun ? ' (dry run)' : ''}…`,
  )
  if (!dryRun) {
    const tx = client.transaction()
    for (const c of CATEGORIES) {
      tx.createIfNotExists({
        _id: docId(c.slug),
        _type: 'skillCategory',
        title: {_type: 'object', en: c.en, nl: c.nl},
        slug: {_type: 'slug', current: c.slug},
        order: c.order,
      })
    }
    await tx.commit()
  }

  // Stack tags whose category is still a legacy string (references carry _ref).
  const tags = await client.fetch<{_id: string; category: unknown}[]>(
    `*[_type == "stackTag" && defined(category) && !defined(category._ref)]{ _id, category }`,
  )

  const toLink = tags.filter((t) => typeof t.category === 'string' && validSlugs.has(t.category))
  const toUnset = tags.filter((t) => !(typeof t.category === 'string' && validSlugs.has(t.category)))

  console.log(`\nLegacy string categories: ${tags.length} tag(s).`)
  for (const t of toLink) console.log(`  link   ${t._id.padEnd(40)} -> ${t.category}`)
  for (const t of toUnset) console.log(`  unset  ${t._id.padEnd(40)} (was ${JSON.stringify(t.category)})`)

  if (dryRun) {
    console.log('\nDry run — no changes made.')
    return
  }

  if (tags.length > 0) {
    const tx = client.transaction()
    for (const t of toLink) {
      tx.patch(t._id, (p) =>
        p.set({category: {_type: 'reference', _ref: docId(t.category as string)}}),
      )
    }
    for (const t of toUnset) tx.patch(t._id, (p) => p.unset(['category']))
    await tx.commit()
  }

  console.log('\nDone.')
}

run().catch((err) => {
  console.error('Seed/migration failed:', err)
  process.exit(1)
})
