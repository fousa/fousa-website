/**
 * One-shot seed: fill the KMO page singleton with the content from
 * `kmo-page-content.ts` (what the page showed before it moved to Sanity).
 *
 * Run with:  pnpm kmo:seed
 * Dry run:   pnpm kmo:seed:dry
 *
 * Only fills fields that are still empty (`setIfMissing`), so it never
 * overwrites Studio edits, and keeps the existing email and phone. Patches
 * the draft too when one exists, so publishing it later doesn't drop the
 * seeded content. Runs through `sanity exec --with-user-token` (CLI login).
 */
import {randomUUID} from 'node:crypto'
import {getCliClient} from 'sanity/cli'
import {KMO_PAGE_CONTENT} from './kmo-page-content'

const client = getCliClient({apiVersion: '2024-12-01', useCdn: false})
const dryRun = process.argv.includes('--dry-run')

const key = () => randomUUID().slice(0, 12)

/** Array items need a `_key` (and `_type` for named object members). */
function seedDocument() {
  const c = KMO_PAGE_CONTENT
  return {
    eyebrow: c.eyebrow,
    title: c.title,
    description: c.description,
    intro: c.intro,
    overviewNote: c.overviewNote,
    packages: c.packages.map((p) => ({
      _key: key(),
      _type: 'kmoPackage',
      ...p,
      features: p.features.map((f) => ({_key: key(), _type: 'feature', sheetOnly: false, ...f})),
    })),
    steps: c.steps.map((s) => ({_key: key(), _type: 'step', ...s})),
    reasons: c.reasons.map((r) => ({_key: key(), _type: 'reason', ...r})),
    faq: c.faq.map((f) => ({_key: key(), _type: 'faqItem', ...f})),
    contactTitle: c.contactTitle,
    contactBadge: c.contactBadge,
    contactBody: c.contactBody,
  }
}

async function seed() {
  const existing = await client.fetch<{_id: string; filled: string[]}[]>(
    `*[_id in ["kmoPage", "drafts.kmoPage"]]{
      _id,
      "filled": [
        select(defined(title) => "title"),
        select(count(packages) > 0 => "packages"),
        select(count(steps) > 0 => "steps"),
        select(count(faq) > 0 => "faq")
      ][@ != null]
    }`,
  )
  const values = seedDocument()

  console.log(`KMO page${dryRun ? ' (dry run)' : ''}:`)
  if (existing.length === 0) console.log('  no document yet; it will be created')
  for (const doc of existing) {
    console.log(`  ${doc._id.padEnd(16)} already filled: ${doc.filled.join(', ') || '—'}`)
  }
  console.log(
    `  seed: ${values.packages.length} packages, ${values.steps.length} steps, ` +
      `${values.reasons.length} reasons, ${values.faq.length} questions`,
  )
  if (dryRun) {
    console.log('\nDry run — nothing written. Fields that already have a value are kept.')
    return
  }

  const tx = client.transaction().createIfNotExists({_id: 'kmoPage', _type: 'kmoPage'})
  for (const id of new Set(['kmoPage', ...existing.map((d) => d._id)])) {
    tx.patch(id, (patch) => patch.setIfMissing(values))
  }
  await tx.commit()
  console.log('\nSeeded. Next: `pnpm kmo:pdf` to render and attach the sales sheets.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
