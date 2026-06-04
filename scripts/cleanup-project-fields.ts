/**
 * One-off cleanup: unset orphaned fields on every `project` document.
 *
 * The schema no longer declares `tooling`, `description`, `outcome`,
 * `screenshots`, or `writeupUrl`, but Sanity keeps the stored values around —
 * the Studio shows them as "unknown fields". Removing a field from the schema
 * does NOT delete its data; only an explicit `unset` does. This script patches
 * every project (published and draft) to drop those fields for good.
 *
 * Run with:  pnpm cleanup:project-fields
 * Dry run:   pnpm cleanup:project-fields:dry
 *
 * Requires SANITY_API_TOKEN in .env.local with write permissions.
 * BEFORE RUNNING: take a dataset backup with `pnpm backup`.
 */

import {createClient} from '@sanity/client'
import {apiVersion, dataset, projectId} from '../src/sanity/env'

const FIELDS = ['tooling', 'description', 'outcome', 'screenshots', 'writeupUrl'] as const

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

type Hit = {_id: string; present: string[]}

async function cleanup() {
  // Only documents that actually still carry one of the fields.
  const filter = FIELDS.map((f) => `defined(${f})`).join(' || ')
  const docs = await client.fetch<Record<string, unknown>[]>(
    `*[_type == "project" && (${filter})]{ _id, ${FIELDS.join(', ')} }`,
  )

  if (docs.length === 0) {
    console.log('No project documents carry any of the orphaned fields — nothing to do.')
    return
  }

  const hits: Hit[] = docs.map((doc) => ({
    _id: doc._id as string,
    present: FIELDS.filter((f) => doc[f] !== undefined && doc[f] !== null),
  }))

  console.log(`Found ${hits.length} project(s) with orphaned fields${dryRun ? ' (dry run)' : ''}:\n`)
  for (const hit of hits) {
    console.log(`  ${hit._id.padEnd(40)} ${hit.present.join(', ')}`)
  }

  if (dryRun) {
    console.log('\nDry run — no changes made.')
    return
  }

  console.log('\nUnsetting…')

  const tx = client.transaction()
  for (const hit of hits) {
    tx.patch(hit._id, (p) => p.unset([...FIELDS]))
  }
  await tx.commit()

  console.log(`Done — cleaned ${hits.length} document(s).`)
}

cleanup().catch((err) => {
  console.error('Cleanup failed:', err)
  process.exit(1)
})
