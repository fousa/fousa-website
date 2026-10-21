/**
 * Server-side fetchers for the project log and case-study pages. Each one runs
 * a GROQ query through `fetchSanity` (server-only, token-bearing) and maps the
 * rows with the pure helpers in `work.ts`. Kept apart from `work.ts` so client
 * components can import the types and predicates without pulling the Sanity
 * client into the browser bundle.
 */
import {fetchSanity} from '@/sanity/fetch'
import {PROJECTS_QUERY} from '@/sanity/queries/projects'
import {CASE_STUDY_QUERY, CASE_STUDY_SLUGS_QUERY} from '@/sanity/queries/case-study'
import {EMPTY_STATES_QUERY} from '@/sanity/queries/empty-states'
import {urlForImage} from '@/sanity/image'
import {pickLocale} from '@/i18n/pick-locale'
import type {Locale} from '@/i18n/config'
import type {PROJECTS_QUERY_RESULT, CASE_STUDY_QUERY_RESULT, CASE_STUDY_SLUGS_QUERY_RESULT, EMPTY_STATES_QUERY_RESULT} from '@/sanity.types'
import {
  mapGalleryShot,
  mapProjectBase,
  toProject,
  type EmptyStateOverride,
  type GalleryShot,
  type Project,
} from './work'

/**
 * Fetch all projects for the log page.
 *
 * @param locale - active locale for resolving i18n fields (also drives the
 *   per-locale `searchText` haystack built in GROQ)
 */
export async function getProjects(locale: Locale = 'en'): Promise<Project[]> {
  const rows = await fetchSanity<PROJECTS_QUERY_RESULT>(PROJECTS_QUERY, {locale})
  if (!rows) return []
  return rows.map((r) => toProject(r, locale))
}

/**
 * The full case-study payload: the shared Project base plus the detail-only
 * fields the /work/<slug> page renders — portable-text body, cover image,
 * external links, and related projects. (`deck` lives on the Project base.)
 */
export type ProjectDetail = Project & {
  body: unknown[] | null
  cover: { url: string; alt: string | null } | null
  related: { slug: string; name: string; year: number | null }[]
}

/**
 * Fetch a single project by slug for the case-study page. One query, one mapped
 * object — the page reads cover, body, links and related straight off this,
 * with no second raw fetch.
 *
 * @param slug - project slug
 * @param locale - active locale for resolving i18n fields
 */
export async function getProjectDetail(
  slug: string,
  locale: Locale = 'en',
): Promise<ProjectDetail | null> {
  const row = await fetchSanity<CASE_STUDY_QUERY_RESULT>(CASE_STUDY_QUERY, {slug})
  if (!row) return null

  const hasBody = Array.isArray(row.body?.en) && row.body.en.length > 0
  const gallery: GalleryShot[] = (row.gallery ?? [])
    .map((g) => mapGalleryShot(g, locale))
    .filter((s): s is GalleryShot => s !== null)

  const body = hasBody
    ? locale === 'nl' && Array.isArray(row.body?.nl) && row.body.nl.length > 0
      ? row.body.nl
      : (row.body?.en ?? null)
    : null

  return {
    ...mapProjectBase(row, locale),
    depth: hasBody ? 'full' : gallery.length > 0 ? 'gallery' : 'none',
    gallery,
    body: body ?? null,
    cover: row.cover?.asset
      ? {
          // Fixed 3:1 hero: fit('crop') frames the (already crop-trimmed) image
          // around the editor's hotspot, so the chosen focal point stays in view.
          url: urlForImage(row.cover).width(1800).height(600).fit('crop').auto('format').url(),
          alt: row.cover.alt ?? null,
        }
      : null,
    related: (row.related ?? [])
      .filter((r) => r.slug)
      .map((r) => ({ slug: r.slug as string, name: r.name ?? '', year: r.year ?? null })),
  }
}

/**
 * Fetch the optional per-combination empty-state overrides.
 *
 * @param locale - active locale for resolving the headline/body i18n fields
 * @returns the override list (empty when none are configured)
 */
export async function getEmptyStates(locale: Locale = 'en'): Promise<EmptyStateOverride[]> {
  const data = await fetchSanity<EMPTY_STATES_QUERY_RESULT>(EMPTY_STATES_QUERY)
  const overrides = data?.overrides ?? []
  return overrides
    .map((o) => ({
      filters: (o.filters ?? []).filter((f): f is string => Boolean(f)),
      headline: pickLocale(typeof o.headline === 'object' ? o.headline : null, locale),
      body: pickLocale(typeof o.body === 'object' ? o.body : null, locale),
    }))
    .filter((o) => o.filters.length > 0)
}

/**
 * Fetch all project slugs for generateStaticParams.
 */
export async function getProjectSlugs(): Promise<string[]> {
  const rows = await fetchSanity<CASE_STUDY_SLUGS_QUERY_RESULT>(CASE_STUDY_SLUGS_QUERY)
  if (!rows) return []
  return rows.filter((r) => r.slug != null).map((r) => String(r.slug))
}
