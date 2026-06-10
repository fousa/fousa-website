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
import {isToolProject} from '@/lib/work-display'
import {urlForImage} from '@/sanity/image'
import type {SanityImageSource} from '@sanity/image-url'
import {pickLocale} from '@/i18n/pick-locale'
import type {Locale} from '@/i18n/config'
import type {MessageKey} from '@/i18n/messages'
import type {PROJECTS_QUERY_RESULT, CASE_STUDY_QUERY_RESULT, CASE_STUDY_SLUGS_QUERY_RESULT, EMPTY_STATES_QUERY_RESULT, SanityImageCrop, SanityImageDimensions} from '@/sanity.types'

/**
 * Dimensions of an image *after* the editor's crop is applied. Sanity stores
 * the crop as edge fractions, so the visible region is the asset shrunk by
 * those margins — the ratio the frontend must use so the framed/lightbox image
 * isn't stretched.
 */
function croppedDimensions(img: {
  crop?: SanityImageCrop
  dimensions: SanityImageDimensions | null
}): {width: number; height: number} {
  const w = img.dimensions?.width ?? 1200
  const h = img.dimensions?.height ?? 800
  const c = img.crop
  if (!c) return {width: w, height: h}
  const cw = Math.round(w * (1 - (c.left ?? 0) - (c.right ?? 0)))
  const ch = Math.round(h * (1 - (c.top ?? 0) - (c.bottom ?? 0)))
  return {width: cw || w, height: ch || h}
}

export type State = 'active' | 'maintained' | 'archived' | 'cancelled'
export type Engagement = 'freelance' | 'full-time' | 'student'
export type Depth = 'none' | 'gallery' | 'full'
export type Frame = 'phone' | 'tablet-landscape' | 'tablet-portrait' | 'tv' | 'watch' | 'mac' | 'browser' | 'other' | 'none'

export type GalleryShot = {
  key: string
  imageUrl: string
  width: number
  height: number
  frame: Frame
  caption?: string | null
}

/**
 * The i18n key naming the device a `frame` depicts (iPhone, iPad, macOS …),
 * used to label a framed shot for assistive tech. Both tablet orientations are
 * an iPad; `none` (a bare image) falls back to the generic "Screens" label.
 *
 * @param frame - the shot's `frame`
 * @returns the message key for that device's display name
 */
export function frameLabelKey(frame: Frame): MessageKey {
  switch (frame) {
    case 'phone':
      return 'galleryDeviceIphone'
    case 'tablet-landscape':
    case 'tablet-portrait':
      return 'galleryDeviceIpad'
    case 'watch':
      return 'galleryDeviceWatch'
    case 'tv':
      return 'galleryDeviceTv'
    case 'mac':
      return 'galleryDeviceMac'
    case 'browser':
      return 'galleryDeviceBrowser'
    default:
      return 'galleryDeviceOther'
  }
}

/**
 * A single Sanity `gallery[]` entry as projected by both the case-study and the
 * cross-project gallery queries: the per-shot `frame`, localized `caption`, and
 * the cropped image (asset ref + crop + dimensions).
 */
type GalleryImageRow = {
  _key: string
  frame?: string | null
  caption?: {en?: string; nl?: string} | null
  image: (SanityImageSource & {crop?: SanityImageCrop; dimensions: SanityImageDimensions | null}) | null
}

/**
 * Build a renderable {@link GalleryShot} from a raw Sanity gallery entry. The
 * single image pipeline shared by the detail-page gallery and the cross-project
 * gallery, so both resolve the builder URL, cropped dimensions, frame and
 * localized caption identically.
 *
 * @param entry - one `gallery[]` element (with the crop-aware `image` projection)
 * @param locale - active locale for the caption
 * @returns the flattened shot, or null when the entry has no image asset
 */
export function mapGalleryShot(entry: GalleryImageRow, locale: Locale): GalleryShot | null {
  const img = entry.image
  if (!img) return null
  // Builder URL bakes in the crop; dimensions follow the cropped region so the
  // frame/lightbox keeps the right aspect ratio.
  const {width, height} = croppedDimensions(img)
  return {
    key: entry._key,
    imageUrl: urlForImage(img).width(1600).auto('format').url(),
    width,
    height,
    frame: (entry.frame as Frame) ?? 'browser',
    caption: pickLocale(entry.caption ?? null, locale),
  }
}

export type Project = {
  slug: string
  name: string
  employer?: { name: string } | null
  client?: string | null
  stack: string
  /**
   * The stack tags grouped under the "platform" skill category, joined for
   * display. The home log surfaces only these (the platforms a project runs
   * on) rather than the full stack; the detail page still uses `stack`.
   */
  platforms: string
  role: string
  year: number
  endYear?: number | null
  state: State
  engagement: Engagement
  tagSlugs: string[]
  employerSlug?: string | null
  /**
   * One-line elevator pitch — the single short summary, shown under the
   * case-study title, in the expanded log row, and as the SEO/OG description.
   * Optional: a project with no deck simply expands to a panel without the lead
   * paragraph (and SEO falls back to the site description).
   */
  deck?: string | null
  depth: Depth
  gallery: GalleryShot[]
  /**
   * The gallery shots the editor flagged "Show in project list" (capped at two
   * in Studio), rendered as a small preview pair in the expanded log row (the
   * full `gallery` is reserved for the detail page). Empty when none are flagged
   * — the row then shows no preview; the log query is the only mapper that
   * populates it.
   */
  previewShots?: GalleryShot[]
  featureTooling?: boolean | null
  /** Manually flagged in Studio: a utility, so the "For" column reads "Tool" (an employer/client becomes an "icapps → Tool" prefix). */
  isTool?: boolean | null
  /**
   * External links carried on every project (not just the detail page) so the
   * log row can surface them on case-study-less "tool" rows. Absent only on
   * hand-built fixtures; mapped rows always set both to a value or null.
   */
  links?: { live: string | null; github: string | null }
  /**
   * Precomputed lowercase search haystack (name + deck + flattened body),
   * built server-side in the log query. The client substring-matches against
   * this. Optional: only the log mapper sets it — the detail page and
   * hand-built fixtures omit it (search runs on the log only).
   */
  searchText?: string
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

/**
 * True when the project has a full written case study (depth "full"), as opposed
 * to a screenshots-only gallery or no detail page. Drives the "Case study"
 * filter; the log row's own depth marker reads `depth` directly.
 */
export function hasCaseStudy(p: Pick<Project, 'depth'>): boolean {
  return p.depth === 'full'
}

// ---------------------------------------------------------------------------
// Three-group filter model
// ---------------------------------------------------------------------------

export type StackFilter = 'apple' | 'web'
export type StatusFilter = 'active'
export type AffiliationFilter = 'freelance' | 'icapps' | '10to1'
export type ToolFilter = 'tools'
export type CaseStudyFilter = 'casestudy'

export type Filters = {
  stack: StackFilter[]
  status: StatusFilter[]
  affiliation: AffiliationFilter[]
  /**
   * Tools — projects that read as "Tool" in the For column (flagged via
   * `isTool`, employer/client or not). A single-value axis (the only key is
   * `tools`); it carries the same definition as the label via `isToolProject`,
   * so the chip and the label can't disagree.
   */
  tool: ToolFilter[]
  /**
   * Case study — projects with a full written case study (`depth === "full"`).
   * A single-value axis (the only key is `casestudy`); it shares the
   * `hasCaseStudy` definition with the row's depth marker, so the chip and the
   * marked rows can't disagree.
   */
  caseStudy: CaseStudyFilter[]
  /**
   * Arbitrary stack-tag keys (slugs) from the About "Skills" deep-links, e.g.
   * `swift` or `ruby-on-rails`. Unlike the curated groups this has no fixed
   * allowlist — any tag slug is valid; an unknown key simply matches nothing.
   */
  skill: string[]
}

/** Stack-tag slugs that count as Apple-platform work (lowercase, no spaces). */
const APPLE_TAGS = new Set(['ios', 'ipados', 'macos', 'watchos', 'swift', 'swiftui'])

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

/** Project carries the given stack-tag key (normalized slug comparison). */
function hasSkill(p: Project, key: string): boolean {
  const k = normTag(key)
  return p.tagSlugs.some((t) => normTag(t) === k)
}

/**
 * Whether a project matches a curated stack chip. The two axes are deliberately
 * asymmetric: `apple` stays broad — it groups several Apple-platform tags (iOS,
 * macOS, Swift…) — while `web` is strict, matching only the explicit `web`
 * platform tag, exactly like a skill key. So "web" means tagged-as-web, not
 * "uses some web tech".
 */
function matchesStack(p: Project, key: StackFilter): boolean {
  return key === 'apple' ? hasTag(p, APPLE_TAGS) : hasSkill(p, 'web')
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
  if (f.stack.length && !f.stack.some((s) => matchesStack(p, s))) return false
  if (f.status.includes('active') && !isActive(p)) return false
  if (f.tool.includes('tools') && !isToolProject(p)) return false
  if (f.caseStudy.includes('casestudy') && !hasCaseStudy(p)) return false
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

/**
 * Case-insensitive substring match over the project's precomputed `searchText`
 * (name + deck + flattened body). An empty/whitespace query matches everything.
 * Search is its own dimension — callers AND it with the active filters.
 */
export function matchesQuery(p: Project, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (p.searchText ?? '').includes(q)
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
  stack: Array<{ name: string | null; slug: string | null; category?: string | null }> | null
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
export function mapProjectBase(row: ProjectBaseRow, locale: Locale): Omit<Project, 'depth' | 'gallery'> {
  const stackTags = row.stack ?? []
  return {
    slug: row.slug ?? '',
    name: row.name ?? '',
    employer: row.employer?.name ? { name: row.employer.name } : null,
    employerSlug: row.employer?.slug ?? null,
    client: row.client ?? null,
    stack: stackTags.map((s) => s?.name).filter(Boolean).join(' · ') || '—',
    platforms:
      stackTags
        .filter((s) => s?.category === 'platform')
        .map((s) => s?.name)
        .filter(Boolean)
        .join(' · ') || '—',
    role: row.role ?? '',
    year: row.year ?? 0,
    endYear: row.endYear ?? null,
    state: (row.state as State) ?? 'active',
    engagement: (row.engagement as Engagement) ?? 'freelance',
    tagSlugs: stackTags.map((s) => s?.slug).filter((s): s is string => Boolean(s)),
    deck: pickLocale(row.deck, locale),
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
    previewShots: (row.previewShots ?? [])
      .map((g) => mapGalleryShot(g, locale))
      .filter((s): s is GalleryShot => s !== null),
    searchText: row.searchText ?? '',
  }
}

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
