/**
 * Migrates the markdown source content in /content into Sanity.
 *
 * Run with: pnpm migrate:content
 * Add --dry-run to skip writes and just print what would happen.
 *
 * Order matters:
 *   1. Profile singleton
 *   2. Employers from timeline (gives us the name → _id index)
 *   3. Projects (uses the employer index; auto-creates missing employers
 *      and stack tags on the fly)
 *
 * All writes use createOrReplace with deterministic _ids, so the script
 * is idempotent — running it twice is safe.
 *
 * BEFORE RUNNING: take a dataset backup with `pnpm backup`. If anything
 * goes sideways you can restore with `pnpm sanity dataset import`.
 */
import {join} from 'node:path'
import {createClient} from '@sanity/client'
import {apiVersion, dataset, projectId} from '../src/sanity/env'
import {migrateProfile} from './migrate/migrate-profile'
import {migrateEmployers} from './migrate/migrate-employers'
import {migrateProjects} from './migrate/migrate-projects'

const DRY_RUN = process.argv.includes('--dry-run')

const token = process.env.SANITY_API_TOKEN
if (!token) {
  console.error('Missing SANITY_API_TOKEN — set it in .env.local and re-run.')
  process.exit(1)
}

const realClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

/**
 * Dry-run client wraps the real client's createOrReplace to log instead
 * of writing. Everything else (queries, etc.) still passes through.
 */
const client = DRY_RUN
  ? new Proxy(realClient, {
      get(target, prop) {
        if (prop === 'createOrReplace') {
          return (doc: {_id: string; _type: string}) => {
            console.log(`    [dry-run] would write ${doc._type} ${doc._id}`)
            return Promise.resolve(doc)
          }
        }
        return Reflect.get(target, prop)
      },
    })
  : realClient

async function main() {
  const contentDir = join(process.cwd(), 'content')
  console.log(`\nMigrating from ${contentDir} into dataset "${dataset}"`)
  if (DRY_RUN) console.log('DRY RUN — no documents will be written\n')

  console.log('1/3 Profile')
  await migrateProfile(client, contentDir)

  console.log('2/3 Employers')
  const employers = await migrateEmployers(client, contentDir)

  console.log('3/3 Projects')
  await migrateProjects(client, contentDir, employers)

  console.log('\nDone.')
}

main().catch((err) => {
  console.error('\nMigration failed:', err)
  process.exit(1)
})
