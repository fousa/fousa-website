/**
 * One-off: assign the `web` platform stack tag to the genuine web projects that
 * predate the tag. The Web filter is now strict — it matches only the explicit
 * `web` tag, not any web-ish tech — so these projects need the tag to keep
 * showing under the filter.
 *
 * The list is the audited set of Rails/Next web apps; mobile-first projects that
 * merely have a Rails backend (Car Sharing, FleetExpert, Soaring Book) are
 * deliberately omitted — they're not web projects.
 *
 * Run with:  pnpm tsx -r dotenv/config scripts/assign-web-tag.ts dotenv_config_path=.env.local
 * Dry run:   …append --dry-run
 *
 * Requires SANITY_API_TOKEN in .env.local with write permissions.
 * BEFORE RUNNING: take a dataset backup with `pnpm backup`.
 *
 * One-off — delete it once every target project carries the tag.
 */

import {randomUUID} from 'node:crypto'
import {createClient} from '@sanity/client'
import {apiVersion, dataset, projectId} from '../src/sanity/env'

/** Document _id of the `web` stackTag. */
const WEB_TAG_ID = '66cbb7d8-2852-402c-99f0-8ad89d3589ec'

/** Genuine web projects to tag (by document name). */
const TARGETS = [
  'Briefing',
  'Het Spiegelpaleis',
  'M-HKA',
  'Menerga',
  'Project Generator',
  'RenteRadar',
  'Roxanne',
  'Translations',
  'Valipat',
] as const

const token = process.env.SANITY_API_TOKEN
if (!token) {
  console.error('Missing SANITY_API_TOKEN — set it in .env.local and re-run.')
  process.exit(1)
}

const client = createClient({projectId, dataset, apiVersion, token, useCdn: false})

const dryRun = process.argv.includes('--dry-run')

type ProjectRow = {_id: string; name: string; hasWeb: boolean}

async function assign() {
  // Matches both published and draft documents carrying one of the names.
  const rows = await client.fetch<ProjectRow[]>(
    `*[_type == "project" && name in $names]{
      _id, name, "hasWeb": count(stack[@->slug.current == "web"]) > 0
    }`,
    {names: TARGETS as unknown as string[]},
  )

  const found = new Set(rows.map((r) => r.name))
  const missing = TARGETS.filter((n) => !found.has(n))
  if (missing.length) console.warn(`Not found in dataset: ${missing.join(', ')}`)

  let patched = 0
  for (const row of rows) {
    if (row.hasWeb) {
      console.log(`  ${row.name.padEnd(24)} already tagged — skipping`)
      continue
    }
    console.log(`  ${row.name.padEnd(24)} + web${dryRun ? ' (dry run)' : ''}`)
    if (dryRun) {
      patched += 1
      continue
    }
    await client
      .patch(row._id)
      .setIfMissing({stack: []})
      .append('stack', [{_type: 'reference', _ref: WEB_TAG_ID, _key: randomUUID()}])
      .commit()
    patched += 1
  }

  console.log(`\n${dryRun ? 'Would tag' : 'Done — tagged'} ${patched} project(s).`)
}

assign().catch((err) => {
  console.error('Assign failed:', err)
  process.exit(1)
})
