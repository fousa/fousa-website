/**
 * Migrates content/timeline/*.md → Employer documents.
 *
 * Only employment-type entries are migrated to the Employer collection
 * (full-time, freelance, internship). Birth, education, and holiday-work
 * entries are skipped — they don't belong in a career timeline. The number
 * prefix in the filename (e.g. "11-icapps.md") gives chronological order;
 * we use it for the Employer.order field.
 *
 * Returns a map from company name (lowercase) → Sanity _id so the project
 * migration can resolve "employer: icapps" → ref('employer.icapps').
 */
import {readdir} from 'node:fs/promises'
import {join} from 'node:path'
import type {SanityClient} from '@sanity/client'
import {readMarkdown, yearFromDate} from './parse-frontmatter'
import {slugify} from './slugify'
import {i18n} from './i18n'
import type {Engagement, TimelineFrontmatter} from './types'

/** Timeline types that map to Employer documents. */
const EMPLOYMENT_TYPES = new Set(['full-time', 'freelance', 'internship'])

/**
 * Map source timeline 'type' to our Employer.engagement enum.
 * Timeline doesn't have an 'owner' concept; everything else maps directly.
 */
function mapEngagement(type: string): Engagement {
  if (type === 'full-time') return 'full-time'
  if (type === 'freelance') return 'freelance'
  if (type === 'internship') return 'internship'
  // Should be unreachable thanks to the EMPLOYMENT_TYPES filter
  throw new Error(`Unexpected timeline type for employer: ${type}`)
}

export type EmployerIndex = Map<string, string>

/**
 * @param client - Authenticated Sanity client with write permissions
 * @param contentDir - Absolute path to the content/ root
 * @returns A map from lowercase company name to Sanity _id
 */
export async function migrateEmployers(
  client: SanityClient,
  contentDir: string
): Promise<EmployerIndex> {
  const timelineDir = join(contentDir, 'timeline')
  const files = (await readdir(timelineDir))
    .filter((f) => f.endsWith('.md'))
    .sort() // numeric prefix guarantees chronological order

  const index: EmployerIndex = new Map()
  const skipped: string[] = []

  for (const file of files) {
    const {data, body} = await readMarkdown<TimelineFrontmatter>(join(timelineDir, file))

    if (!EMPLOYMENT_TYPES.has(data.type)) {
      skipped.push(`${file} (type: ${data.type})`)
      continue
    }

    // "11-icapps.md" → order = 11
    const orderMatch = /^(\d+)-/.exec(file)
    const order = orderMatch ? parseInt(orderMatch[1], 10) : undefined

    const id = `employer.${slugify(data.company)}`
    await client.createOrReplace({
      _id: id,
      _type: 'employer',
      name: data.company,
      role: data.title,
      startYear: yearFromDate(data.startDate),
      endYear: yearFromDate(data.endDate),
      engagement: mapEngagement(data.type),
      description: body.trim() ? i18n(body.trim()) : undefined,
      order,
    })

    index.set(data.company.toLowerCase(), id)
  }

  console.log(`  Migrated ${index.size} employers`)
  if (skipped.length > 0) {
    console.log(`  Skipped ${skipped.length} non-employment entries:`)
    skipped.forEach((s) => console.log(`    - ${s}`))
  }

  return index
}
