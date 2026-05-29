/**
 * Migrates content/timeline/*.md → timelineEntry documents.
 *
 * All timeline types are now migrated (freelance, full-time, internship,
 * education). Birth and holiday-work entries are skipped per the spec.
 * The `group` field is derived from the source `type`.
 *
 * Returns a map from company name (lowercase) → Sanity _id so the project
 * migration can resolve "employer: icapps" → ref('timelineEntry.icapps').
 */
import {readdir} from 'node:fs/promises'
import {join} from 'node:path'
import type {SanityClient} from '@sanity/client'
import {readMarkdown} from './parse-frontmatter'
import {slugify} from './slugify'
import {i18n} from './i18n'
import type {TimelineFrontmatter} from './types'

type Group = 'freelance' | 'employed' | 'education'

/** Skip these source types entirely. */
const SKIP_TYPES = new Set(['birth', 'holiday-work'])

/** Map source timeline `type` to the timelineEntry `group`. */
function mapGroup(type: string): Group {
  if (type === 'freelance') return 'freelance'
  if (type === 'full-time') return 'employed'
  if (type === 'internship') return 'education'
  if (type === 'education') return 'education'
  throw new Error(`Unexpected timeline type: ${type}`)
}

/**
 * Converts a "YYYY-MM" string to a full ISO date ("YYYY-MM-01") that
 * Sanity's date type expects. Returns undefined for empty/ongoing.
 */
function toSanityDate(date: string | undefined): string | undefined {
  if (!date || date === 'Present') return undefined
  const match = /^(\d{4}-\d{2})/.exec(date.trim())
  return match ? `${match[1]}-01` : undefined
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
    .sort()

  const index: EmployerIndex = new Map()
  const skipped: string[] = []

  for (const file of files) {
    const {data, body} = await readMarkdown<TimelineFrontmatter>(join(timelineDir, file))

    if (SKIP_TYPES.has(data.type)) {
      skipped.push(`${file} (type: ${data.type})`)
      continue
    }

    const id = `timelineEntry.${slugify(data.company)}`
    await client.createOrReplace({
      _id: id,
      _type: 'timelineEntry',
      organisation: data.company,
      title: data.title,
      group: mapGroup(data.type),
      startDate: toSanityDate(data.startDate),
      endDate: toSanityDate(data.endDate),
      description: body.trim() ? i18n(body.trim()) : undefined,
      location: data.location,
    })

    index.set(data.company.toLowerCase(), id)
  }

  console.log(`  Migrated ${index.size} timeline entries`)
  if (skipped.length > 0) {
    console.log(`  Skipped ${skipped.length} entries:`)
    skipped.forEach((s) => console.log(`    - ${s}`))
  }

  return index
}
