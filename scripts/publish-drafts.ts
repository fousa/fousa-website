/**
 * Publish all draft documents in the Sanity dataset.
 *
 * Drafts in Sanity are stored with an `_id` prefixed by `drafts.`.
 * Publishing means copying each draft to its published counterpart
 * (without the prefix) and then deleting the draft document.
 *
 * Run with:  pnpm publish:drafts
 * Dry run:   pnpm publish:drafts:dry
 *
 * Requires SANITY_API_TOKEN in .env.local with write permissions.
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

async function publishDrafts() {
  const drafts = await client.fetch<{_id: string; _type: string}[]>(
    `*[_id in path("drafts.**")]{ _id, _type }`,
  )

  if (drafts.length === 0) {
    console.log('No drafts found — nothing to publish.')
    return
  }

  console.log(`Found ${drafts.length} draft(s)${dryRun ? ' (dry run)' : ''}:\n`)

  for (const doc of drafts) {
    const publishedId = doc._id.replace(/^drafts\./, '')
    console.log(`  ${doc._type.padEnd(20)} ${publishedId}`)
  }

  if (dryRun) {
    console.log('\nDry run — no changes made.')
    return
  }

  console.log('\nPublishing…')

  // Fetch full draft documents for the transaction
  const fullDrafts = await client.fetch<Record<string, unknown>[]>(
    `*[_id in path("drafts.**")]`,
  )

  const tx = client.transaction()

  for (const doc of fullDrafts) {
    const draftId = doc._id as string
    const publishedId = draftId.replace(/^drafts\./, '')

    // Write the published version (without the drafts. prefix)
    const {_id, ...rest} = doc
    tx.createOrReplace({_id: publishedId, ...rest} as Parameters<typeof tx.createOrReplace>[0])

    // Remove the draft
    tx.delete(draftId)
  }

  await tx.commit()
  console.log(`Done — published ${fullDrafts.length} document(s).`)
}

publishDrafts().catch((err) => {
  console.error('Publish failed:', err)
  process.exit(1)
})
