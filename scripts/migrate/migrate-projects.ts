/**
 * Migrates content/projects/*.md → Project documents.
 *
 * Pre-pass: collects all distinct tech names so stack tags can be ensured
 * before any Project is written (avoids missing-reference errors).
 *
 * Per project: resolves the employer reference, builds a Stack tag array
 * of references, packages translatable fields as i18n objects, and writes
 * with a deterministic _id based on the slug.
 *
 * Employer resolution:
 *   - explicit employer field set → look up by name
 *   - explicit client field set, no employer → look up client by name as
 *     Employer; if missing, create a stub Employer for it
 *   - both empty → "personal" project, reference the Fousa employer
 */
import {readdir} from 'node:fs/promises'
import {join} from 'node:path'
import type {SanityClient} from '@sanity/client'
import {readMarkdown, yearFromDate} from './parse-frontmatter'
import {toPortableTextI18n} from './portable-text'
import {i18n} from './i18n'
import {slugify} from './slugify'
import {ensureStackTags} from './migrate-stack-tags'
import type {EmployerIndex} from './migrate-employers'
import type {Engagement, ProjectFrontmatter} from './types'

/**
 * Map project type+context to engagement enum.
 * - personal → 'owner' (you're the owner of personal work)
 * - client-work via agency employer → 'full-time' (employed by the agency)
 * - client-work direct (no employer) → 'freelance' (via Fousa)
 */
function deriveEngagement(
  projectType: 'client-work' | 'personal',
  hasEmployerField: boolean
): Engagement {
  if (projectType === 'personal') return 'owner'
  return hasEmployerField ? 'full-time' : 'freelance'
}

/**
 * Ensures a timelineEntry doc exists for `name`. If not already in the index,
 * creates a stub. Mutates the index in place.
 */
async function ensureEmployer(
  client: SanityClient,
  index: EmployerIndex,
  name: string,
  engagement: Engagement
): Promise<string> {
  const key = name.toLowerCase()
  const existing = index.get(key)
  if (existing) return existing

  const id = `timelineEntry.${slugify(name)}`
  await client.createOrReplace({
    _id: id,
    _type: 'timelineEntry',
    organisation: name,
    title: 'Client',
    group: 'freelance',
    startDate: `${new Date().getFullYear()}-01-01`,
  })
  index.set(key, id)
  console.log(`    Auto-created timeline entry: ${name}`)
  return id
}

/**
 * @param client - Authenticated Sanity client with write permissions
 * @param contentDir - Absolute path to the content/ root
 * @param employers - Map of company name → employer _id (mutated as needed)
 * @returns Number of project documents written
 */
export async function migrateProjects(
  client: SanityClient,
  contentDir: string,
  employers: EmployerIndex
): Promise<number> {
  const projectsDir = join(contentDir, 'projects')
  const files = (await readdir(projectsDir)).filter((f) => f.endsWith('.md'))

  // Pre-pass: collect all tech names so we can ensure tags exist first.
  const allTechs = new Set<string>()
  const parsed: Array<{data: ProjectFrontmatter; body: string; file: string}> = []
  for (const file of files) {
    const {data, body} = await readMarkdown<ProjectFrontmatter>(join(projectsDir, file))
    parsed.push({data, body, file})
    for (const t of data.techStack ?? []) allTechs.add(t)
  }
  console.log(`  Found ${allTechs.size} distinct stack tags across ${parsed.length} projects`)
  const stackTags = await ensureStackTags(client, allTechs)

  // Ensure Fousa exists as the personal-project employer.
  await ensureEmployer(client, employers, 'Fousa', 'freelance')

  let written = 0
  for (const {data, body, file} of parsed) {
    if (!data.slug) {
      console.warn(`  Skipping ${file}: missing slug`)
      continue
    }

    // Resolve employer reference.
    const hasEmployer = Boolean(data.employer && data.employer.trim())
    const hasClient = Boolean(data.client && data.client.trim())
    let employerName: string
    if (hasEmployer) {
      employerName = data.employer!.trim()
    } else if (hasClient) {
      employerName = data.client!.trim()
    } else {
      employerName = 'Fousa'
    }
    const employerId = await ensureEmployer(
      client,
      employers,
      employerName,
      deriveEngagement(data.type, hasEmployer)
    )

    // Stack tag references.
    const stack = (data.techStack ?? []).map((name, i) => ({
      _key: `stack-${i}`,
      _type: 'reference',
      _ref: stackTags.get(name) ?? `stackTag.${slugify(name)}`,
    }))

    // Build the doc.
    const doc: Record<string, unknown> = {
      _id: `project.${data.slug}`,
      _type: 'project',
      name: data.title,
      slug: {_type: 'slug', current: data.slug},
      employer: {_type: 'reference', _ref: employerId},
      role: data.type === 'personal' ? 'Owner' : (hasEmployer ? 'Developer' : 'Freelance developer'),
      year: yearFromDate(data.startDate),
      endYear: yearFromDate(data.endDate),
      engagement: deriveEngagement(data.type, hasEmployer),
      state: data.endDate === 'Present' || !data.endDate ? 'live' : 'done',
      stack,
    }

    // Optional fields — only set if non-empty (URL validation rejects '').
    if (data.subtitle?.trim()) doc.deck = i18n(data.subtitle.trim())
    if (body.trim()) doc.description = toPortableTextI18n(body.trim())
    if (data.liveUrl?.trim()) doc.liveUrl = data.liveUrl.trim()
    // Capture the end client when distinct from the employer.
    if (hasClient && hasEmployer) doc.client = data.client!.trim()

    await client.createOrReplace(doc)
    written++
  }

  console.log(`  Migrated ${written} projects`)
  return written
}
