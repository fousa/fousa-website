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
import {EMPTY_STATES_QUERY} from '@/sanity/queries/empty-states'
import {pickLocale} from '@/i18n/pick-locale'
import type {Locale} from '@/i18n/config'
import type {PROJECTS_QUERY_RESULT, CASE_STUDY_QUERY_RESULT, CASE_STUDY_SLUGS_QUERY_RESULT, EMPTY_STATES_QUERY_RESULT} from '@/sanity.types'

export type State = 'active' | 'maintained' | 'archived' | 'cancelled'
export type Engagement = 'freelance' | 'full-time' | 'student'
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
  endYear?: number | null
  state: State
  engagement: Engagement
  tagSlugs: string[]
  employerSlug?: string | null
  summary: string
  depth: Depth
  gallery: GalleryShot[]
  featureTooling?: boolean | null
  /** Manually flagged in Studio: a personal utility, so the "For" column reads "Tool". */
  isTool?: boolean | null
  /**
   * External links carried on every project (not just the detail page) so the
   * log row can surface them on case-study-less "tool" rows. Absent only on
   * hand-built fixtures; mapped rows always set both to a value or null.
   */
  links?: { live: string | null; github: string | null }
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

// ---------------------------------------------------------------------------
// Three-group filter model
// ---------------------------------------------------------------------------

export type StackFilter = 'apple' | 'web'
export type StatusFilter = 'active'
export type AffiliationFilter = 'freelance' | 'icapps' | '10to1'

export type Filters = {
  stack: StackFilter[]
  status: StatusFilter[]
  affiliation: AffiliationFilter[]
  /**
   * Arbitrary stack-tag keys (slugs) from the About "Skills" deep-links, e.g.
   * `swift` or `ruby-on-rails`. Unlike the curated groups this has no fixed
   * allowlist — any tag slug is valid; an unknown key simply matches nothing.
   */
  skill: string[]
}

/** Stack-tag slugs that count as Apple-platform work (lowercase, no spaces). */
const APPLE_TAGS = new Set(['ios', 'ipados', 'macos', 'watchos', 'swift', 'swiftui'])

/** Stack-tag slugs that count as web work (lowercase, no spaces). */
const WEB_TAGS = new Set(['website', 'ruby-on-rails', 'node', 'api', 'next-js'])

/** Normalize a tag slug for matching (lowercase, strip spaces). */
function normTag(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '')
}

/** Project carries at least one tag in the given set. */
function hasTag(p: Project, tags: Set<string>): boolean {
  return p.tagSlugs.some((t) => tags.has(normTag(t)))
}

/** Project is ongoing (no end year). */
function isActive(p: Project): boolean {
  return !p.endYear
}

const STACK_TAG_SETS: Record<StackFilter, Set<string>> = {
  apple: APPLE_TAGS,
  web: WEB_TAGS,
}

/** Project carries the given stack-tag key (normalized slug comparison). */
function hasSkill(p: Project, key: string): boolean {
  const k = normTag(key)
  return p.tagSlugs.some((t) => normTag(t) === k)
}

/**
 * Test whether a project passes the combined multi-select filters.
 * OR within a group, AND across groups. Empty group = not applied.
 *
 * The `skill` group is the open-ended axis: a project matches when its stack
 * tags include any of the selected skill keys, ANDed with the curated groups
 * just like the others.
 */
export function matchesFilters(p: Project, f: Filters): boolean {
  if (f.stack.length && !f.stack.some((s) => hasTag(p, STACK_TAG_SETS[s]))) return false
  if (f.status.includes('active') && !isActive(p)) return false
  if (f.affiliation.length) {
    const match = f.affiliation.some((a) =>
      a === 'freelance'
        ? p.engagement === 'freelance'
        : (p.employerSlug ?? '') === a
    )
    if (!match) return false
  }
  if (f.skill.length && !f.skill.some((k) => hasSkill(p, k))) return false
  return true
}

// ---------------------------------------------------------------------------
// Year range (start / end / ongoing)
// ---------------------------------------------------------------------------

/** A project is ongoing when it's actively developed/maintained with no recorded end. */
export function isOngoing(p: {state: State; endYear?: number | null}): boolean {
  return (p.state === 'active' || p.state === 'maintained') && p.endYear == null
}

/**
 * The year used for sorting: explicit endYear if present; +Infinity for ongoing
 * (so they sort newest); otherwise the start year.
 */
export function effectiveEndYear(p: {year: number; endYear?: number | null; state: State}): number {
  if (p.endYear != null) return p.endYear
  if (isOngoing(p)) return Number.POSITIVE_INFINITY
  return p.year
}

/**
 * The two ends of a project's displayed year span. `end` is null for a single
 * year and for ongoing work (both shown as just the start year — the status dot
 * already signals an ongoing project is still live); a number marks a closed range.
 * Callers render the arrow between the two ends themselves.
 */
export function yearRange(p: {year: number; endYear?: number | null}): {
  start: number
  end: number | null
} {
  return {start: p.year, end: p.endYear != null && p.endYear !== p.year ? p.endYear : null}
}

// ---------------------------------------------------------------------------
// Sort model
// ---------------------------------------------------------------------------

export type SortKey = 'project' | 'year' | 'state'
export type SortDir = 'asc' | 'desc'
export type Sort = {key: SortKey; dir: SortDir}

/** Page default: newest projects first (year ties break on state, then name). */
export const DEFAULT_SORT: Sort = {key: 'year', dir: 'desc'}

/** State ordering for sort purposes: active first, then maintained, archived, cancelled. */
const STATE_RANK: Record<State, number> = {
  active: 0,
  maintained: 1,
  archived: 2,
  cancelled: 3,
}

/**
 * Compare two projects for a given sort. Ties always fall back to the default
 * priority chain (year desc → state rank → name asc) so ordering is
 * deterministic regardless of the chosen key/direction.
 */
export function compareProjects(a: Project, b: Project, sort: Sort): number {
  const dir = sort.dir === 'asc' ? 1 : -1

  // Primary key chosen by the user.
  let primary = 0
  if (sort.key === 'project') primary = a.name.localeCompare(b.name) * dir
  else if (sort.key === 'year') {
    // Compare on the effective end year so ongoing projects (+Infinity) lead.
    // Subtraction would yield Infinity − Infinity = NaN, so compare by sign.
    const ay = effectiveEndYear(a)
    const by = effectiveEndYear(b)
    primary = (ay === by ? 0 : ay < by ? -1 : 1) * dir
  } else if (sort.key === 'state') primary = (STATE_RANK[a.state] - STATE_RANK[b.state]) * dir
  if (primary !== 0) return primary

  // Deterministic tie-break: the default chain, independent of `dir`.
  const ay = effectiveEndYear(a)
  const by = effectiveEndYear(b)
  if (ay !== by) return ay < by ? 1 : -1 // newer (larger effective end) first
  if (a.state !== b.state) return STATE_RANK[a.state] - STATE_RANK[b.state]
  return a.name.localeCompare(b.name)
}

/** Sort a copy of the list; never mutate the input. */
export function sortProjects(list: Project[], sort: Sort): Project[] {
  return [...list].sort((a, b) => compareProjects(a, b, sort))
}

/**
 * The fields the log row and the case-study detail share. A structural subset
 * both query results satisfy, so a single mapper can serve both.
 */
type ProjectBaseRow = {
  slug: string | null
  name: string | null
  employer: { name: string | null; slug: string | null } | null
  client: string | null
  role: string | null
  year: number | null
  endYear: number | null
  state: string | null
  engagement: string | null
  stack: Array<{ name: string | null; slug: string | null }> | null
  summary: { en?: string; nl?: string } | null
  deck: { en?: string; nl?: string } | null
  featureTooling: boolean | null
  isTool: boolean | null
  liveUrl: string | null
  githubUrl: string | null
}

/**
 * Map the fields shared by the log row and the detail page into the flat
 * Project base (everything except depth and gallery, which each caller derives
 * from its own query shape). Single source of truth so the log and detail never
 * drift on naming or locale resolution.
 */
function mapProjectBase(row: ProjectBaseRow, locale: Locale): Omit<Project, 'depth' | 'gallery'> {
  const stackTags = row.stack ?? []
  return {
    slug: row.slug ?? '',
    name: row.name ?? '',
    employer: row.employer?.name ? { name: row.employer.name } : null,
    employerSlug: row.employer?.slug ?? null,
    client: row.client ?? null,
    stack: stackTags.map((s) => s?.name).filter(Boolean).join(' · ') || '—',
    role: row.role ?? '',
    year: row.year ?? 0,
    endYear: row.endYear ?? null,
    state: (row.state as State) ?? 'active',
    engagement: (row.engagement as Engagement) ?? 'freelance',
    tagSlugs: stackTags.map((s) => s?.slug).filter((s): s is string => Boolean(s)),
    summary: pickLocale(row.summary, locale) ?? pickLocale(row.deck, locale) ?? '',
    featureTooling: row.featureTooling ?? false,
    isTool: row.isTool ?? false,
    links: {
      live: row.liveUrl ?? null,
      github: row.githubUrl ?? null,
    },
  }
}

/**
 * Map a Sanity log row into the flat Project interface. The log never shows
 * galleries, so depth is derived from cheap counts and gallery stays empty.
 */
function toProject(
  row: NonNullable<PROJECTS_QUERY_RESULT>[number],
  locale: Locale,
): Project {
  return {
    ...mapProjectBase(row, locale),
    depth: projectDepth(row),
    gallery: [],
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
 * The full case-study payload: the shared Project base plus the detail-only
 * fields the /work/<slug> page renders — portable-text body, cover image,
 * deck, external links, and related projects.
 */
export type ProjectDetail = Project & {
  body: unknown[] | null
  cover: { url: string; alt: string | null } | null
  deck: string | null
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
    .filter((g) => g.imageUrl)
    .map((g) => ({
      key: g._key,
      imageUrl: g.imageUrl!,
      width: g.width ?? 1200,
      height: g.height ?? 800,
      frame: (g.frame as Frame) ?? 'browser',
      caption: pickLocale(typeof g.caption === 'object' ? g.caption : null, locale),
    }))

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
    cover: row.coverUrl ? { url: row.coverUrl, alt: row.coverAlt ?? null } : null,
    deck: pickLocale(row.deck, locale),
    related: (row.related ?? [])
      .filter((r) => r.slug)
      .map((r) => ({ slug: r.slug as string, name: r.name ?? '', year: r.year ?? null })),
  }
}

// ---------------------------------------------------------------------------
// Empty-state overrides
// ---------------------------------------------------------------------------

/**
 * One hand-written empty-state message, resolved for the active locale.
 * `filters` is the (order-independent) set of active filter keys the entry
 * applies to; `headline`/`body` are null when the editor left them blank.
 */
export type EmptyStateOverride = {
  filters: string[]
  headline: string | null
  body: string | null
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
