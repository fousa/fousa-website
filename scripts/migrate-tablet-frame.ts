/**
 * One-off migration: rewrite every gallery image frame "tablet" →
 * "tablet-landscape" across all `project` documents.
 *
 * The `frame` field was split into `tablet-landscape` and `tablet-portrait`;
 * existing tablet shots are all landscape, so we rewrite the stored value.
 * Sanity keeps unknown values around, so the old "tablet" string lingers until
 * an explicit `set` replaces it — this script does exactly that.
 *
 * Run with:  pnpm tsx -r dotenv/config scripts/migrate-tablet-frame.ts dotenv_config_path=.env.local
 * Dry run:   …append --dry-run
 *
 * Requires SANITY_API_TOKEN in .env.local with write permissions.
 * BEFORE RUNNING: take a dataset backup with `pnpm backup`.
 *
 * This is a one-off — delete it once the straggler query reports zero.
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

type ProjectRow = {_id: string; gallery?: {_key: string; frame?: string}[]}

async function migrate() {
  const projects = await client.fetch<ProjectRow[]>(
    `*[_type == "project" && defined(gallery)]{ _id, gallery[]{ _key, frame } }`,
  )

  let patched = 0
  for (const p of projects) {
    const hits = (p.gallery ?? []).filter((g) => g.frame === 'tablet')
    if (hits.length === 0) continue

    console.log(`  ${p._id.padEnd(40)} ${hits.length} image(s)${dryRun ? ' (dry run)' : ''}`)
    if (dryRun) {
      patched += hits.length
      continue
    }

    let tx = client.patch(p._id)
    for (const g of hits) {
      tx = tx.set({[`gallery[_key=="${g._key}"].frame`]: 'tablet-landscape'})
    }
    await tx.commit()
    patched += hits.length
  }

  if (patched === 0) {
    console.log('No gallery images carry the legacy "tablet" frame — nothing to do.')
    return
  }
  console.log(`\n${dryRun ? 'Would migrate' : 'Done — migrated'} ${patched} image(s).`)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
