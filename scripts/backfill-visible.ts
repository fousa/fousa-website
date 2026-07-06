/**
 * One-off backfill: set `visible: true` on every `project` document that
 * predates the field.
 *
 * The schema's `initialValue: true` only applies to documents created after
 * the field was added — existing projects carry `visible: undefined`, which
 * the site treats as visible (queries filter on `visible != false`) but the
 * Studio renders as an unchecked toggle. This script patches every project
 * (published and draft) without the field so the toggle reads "on".
 *
 * Run with:  pnpm backfill:visible
 * Dry run:   pnpm backfill:visible:dry
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

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

const dryRun = process.argv.includes('--dry-run')

async function backfill() {
  // Only documents that don't carry the field yet — an explicit `false`
  // means an editor hid the project on purpose, so leave those alone.
  const docs = await client.fetch<{_id: string; name: string | null}[]>(
    `*[_type == "project" && !defined(visible)]{ _id, name }`,
  )

  if (docs.length === 0) {
    console.log('Every project document already has `visible` set — nothing to do.')
    return
  }

  console.log(`Found ${docs.length} project(s) without \`visible\`${dryRun ? ' (dry run)' : ''}:\n`)
  for (const doc of docs) {
    console.log(`  ${doc._id.padEnd(40)} ${doc.name ?? '(unnamed)'}`)
  }

  if (dryRun) {
    console.log('\nDry run — no changes made.')
    return
  }

  console.log('\nPatching…')

  const tx = client.transaction()
  for (const doc of docs) {
    tx.patch(doc._id, (p) => p.set({visible: true}))
  }
  await tx.commit()

  console.log(`Done — backfilled ${docs.length} document(s).`)
}

backfill().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
