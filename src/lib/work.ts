/**
 * Typed content layer for the project log and case-study pages.
 *
 * Exports the Project type (with two-axis tagging: relation + tech), filter
 * constants, filter helper, and data-fetching functions. Backed by Sanity
 * GROQ queries; the Project interface normalizes Sanity's nested shape into
 * a flat, locale-resolved structure the components can consume directly.
 */
import {fetchSanity} from '@/sanity/fetch'
import {PROJECTS_QUERY} from '@/sanity/queries/projects'
import {CASE_STUDY_QUERY, CASE_STUDY_SLUGS_QUERY} from '@/sanity/queries/case-study'
import {pickLocale} from '@/i18n/pick-locale'
import type {Locale} from '@/i18n/config'
import type {PROJECTS_QUERY_RESULT, CASE_STUDY_QUERY_RESULT, CASE_STUDY_SLUGS_QUERY_RESULT} from '@/sanity.types'

export type State = 'live' | 'cancelled' | 'deprecated'
export type Engagement = 'freelance' | 'full-time' | 'internship' | 'student'
export type Depth = 'none' | 'gallery' | 'full'
export type Frame = 'phone' | 'tablet' | 'browser' | 'none'

export type GalleryShot = {
  key: string
  imageUrl: string
  width: number
  height: number
  frame: Frame
  caption?: string | null
}

export type Project = {
  slug: string
  name: string
  employer?: { name: string } | null
  client?: string | null
  stack: string
  role: string
  year: number
  state: State
  engagement: Engagement
  tech: string[]
  summary: string
  depth: Depth
  gallery: GalleryShot[]
  tooling?: string | null
  featureTooling?: boolean | null
}

/**
 * Derive a project's depth from its content (no manual field).
 *
 * @param p - object with optional body and gallery arrays
 * @returns the depth level
 */
export function projectDepth(p: { hasBody?: boolean | null; galleryCount?: number | null }): Depth {
  if (p.hasBody) return 'full'
  if (p.galleryCount && p.galleryCount > 0) return 'gallery'
  return 'none'
}

export const FILTERS = [
  'All',
  'Freelance',
  'Full-time',
  'Internship',
  'iOS',
  'Rails',
  'Other',
] as const

export type Filter = (typeof FILTERS)[number]

/** Tech keys that have their own filter chip; everything else is "Other". */
const KNOWN_TECH = ['ios', 'rails']
const ENGAGEMENTS: string[] = ['freelance', 'full-time', 'internship']

/**
 * Test whether a project passes the given filter.
 *
 * @param p - project to test
 * @param f - active filter value
 * @returns true when the project should be visible
 */
export function matchesFilter(p: Project, f: Filter): boolean {
  if (f === 'All') return true
  const k = f.toLowerCase()
  if (ENGAGEMENTS.includes(k)) return p.engagement === (k as Engagement)
  if (k === 'other') return !p.tech.some((t) => KNOWN_TECH.includes(t))
  return p.tech.includes(k)
}

/**
 * Normalize a stack tag's category to a lowercase tech key for filtering.
 *
 * @param category - Sanity stackTag category value
 * @returns lowercase tech key
 */
function normalizeTech(category: string | null | undefined): string {
  if (!category) return 'other'
  return category.toLowerCase()
}

/**
 * Map a Sanity project row into the flat Project interface.
 */
function toProject(
  row: NonNullable<PROJECTS_QUERY_RESULT>[number],
  locale: Locale,
): Project {
  const stackTags = row.stack ?? []
  return {
    slug: row.slug ?? '',
    name: row.name ?? '',
    employer: row.employer?.name ? { name: row.employer.name } : null,
    client: row.client ?? null,
    stack: stackTags.map((s) => s?.name).filter(Boolean).join(' · ') || '—',
    role: row.role ?? '',
    year: row.year ?? 0,
    state: (row.state as State) ?? 'live',
    engagement: (row.engagement as Engagement) ?? 'freelance',
    tech: [...new Set(stackTags.map((s) => normalizeTech(s?.category)))],
    summary:
      pickLocale(typeof row.summary === 'object' ? row.summary : null, locale) ??
      pickLocale(typeof row.deck === 'object' ? row.deck : null, locale) ??
      '',
    depth: projectDepth(row),
    gallery: [],
    tooling: pickLocale(typeof row.tooling === 'object' ? row.tooling : null, locale),
    featureTooling: row.featureTooling ?? false,
  }
}

/**
 * Fetch all projects for the log page.
 *
 * @param locale - active locale for resolving i18n fields
 */
export async function getProjects(locale: Locale = 'en'): Promise<Project[]> {
  const rows = await fetchSanity<PROJECTS_QUERY_RESULT>(PROJECTS_QUERY)
  if (!rows) return []
  return rows.map((r) => toProject(r, locale))
}

/**
 * Fetch a single project by slug for the case-study page.
 *
 * @param slug - project slug
 * @param locale - active locale for resolving i18n fields
 */
export async function getProject(
  slug: string,
  locale: Locale = 'en',
): Promise<Project | undefined> {
  const row = await fetchSanity<CASE_STUDY_QUERY_RESULT>(CASE_STUDY_QUERY, {slug})
  if (!row) return undefined
  const stackTags = row.stack ?? []

  const bodyObj = typeof row.body === 'object' && row.body !== null ? row.body as Record<string, unknown> : null
  const hasBody = bodyObj && Array.isArray(bodyObj.en) && bodyObj.en.length > 0

  const rawGallery = row.gallery ?? []
  const gallery: GalleryShot[] = rawGallery
    .filter((g) => g.imageUrl)
    .map((g) => ({
      key: g._key,
      imageUrl: g.imageUrl!,
      width: g.width ?? 1200,
      height: g.height ?? 800,
      frame: (g.frame as Frame) ?? 'browser',
      caption: pickLocale(typeof g.caption === 'object' ? g.caption : null, locale),
    }))

  return {
    slug: row.slug ?? '',
    name: row.name ?? '',
    employer: row.employer?.name ? { name: row.employer.name } : null,
    client: row.client ?? null,
    stack: stackTags.map((s) => s?.name).filter(Boolean).join(' · ') || '—',
    role: row.role ?? '',
    year: row.year ?? 0,
    state: (row.state as State) ?? 'live',
    engagement: (row.engagement as Engagement) ?? 'freelance',
    tech: [...new Set(stackTags.map((s) => normalizeTech(s?.category)))],
    summary:
      pickLocale(typeof row.summary === 'object' ? row.summary : null, locale) ??
      pickLocale(typeof row.deck === 'object' ? row.deck : null, locale) ??
      '',
    depth: hasBody ? 'full' : gallery.length > 0 ? 'gallery' : 'none',
    gallery,
  }
}

/**
 * Fetch all project slugs for generateStaticParams.
 */
export async function getProjectSlugs(): Promise<string[]> {
  const rows = await fetchSanity<CASE_STUDY_SLUGS_QUERY_RESULT>(CASE_STUDY_SLUGS_QUERY)
  if (!rows) return []
  return rows.filter((r) => r.slug != null).map((r) => String(r.slug))
}
