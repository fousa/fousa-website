/**
 * One-shot seed script: creates the initial set of Stack tag documents in Sanity.
 *
 * Run with: pnpm tsx scripts/seed-stack-tags.ts
 *
 * Safe to re-run — each tag uses a deterministic _id, so subsequent runs
 * become no-ops (createOrReplace). Add new tags here and re-run to pick
 * them up.
 *
 * Requires SANITY_API_TOKEN in the environment with write permissions.
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

type Seed = {name: string; slug: string; category: 'ios' | 'rails' | 'frontend' | 'tooling' | 'other'}

const tags: Seed[] = [
  {name: 'Swift', slug: 'swift', category: 'ios'},
  {name: 'SwiftUI', slug: 'swiftui', category: 'ios'},
  {name: 'UIKit', slug: 'uikit', category: 'ios'},
  {name: 'Objective-C', slug: 'objective-c', category: 'ios'},
  {name: 'Combine', slug: 'combine', category: 'ios'},
  {name: 'CryptoKit', slug: 'cryptokit', category: 'ios'},
  {name: 'XCTest', slug: 'xctest', category: 'ios'},
  {name: 'Rails', slug: 'rails', category: 'rails'},
  {name: 'Ruby', slug: 'ruby', category: 'rails'},
  {name: 'PostgreSQL', slug: 'postgresql', category: 'rails'},
  {name: 'Sidekiq', slug: 'sidekiq', category: 'rails'},
  {name: 'React', slug: 'react', category: 'frontend'},
  {name: 'TypeScript', slug: 'typescript', category: 'frontend'},
  {name: 'Tailwind', slug: 'tailwind', category: 'frontend'},
  {name: 'Fastlane', slug: 'fastlane', category: 'tooling'},
  {name: 'GitHub Actions', slug: 'github-actions', category: 'tooling'},
]

async function seed() {
  console.log(`Seeding ${tags.length} stack tags into dataset "${dataset}"...`)

  const transactions = tags.map((tag) =>
    client.createOrReplace({
      _id: `stackTag.${tag.slug}`,
      _type: 'stackTag',
      name: tag.name,
      slug: {_type: 'slug', current: tag.slug},
      category: tag.category,
    })
  )

  const results = await Promise.all(transactions)
  console.log(`Done — wrote ${results.length} documents.`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
