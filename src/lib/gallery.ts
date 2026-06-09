/**
 * Cross-project gallery data layer.
 *
 * Flattens every project's `gallery[]` into a single stream of shots for the
 * `/gallery` page, tagging each with the project it belongs to and a coarse
 * device group used by the page's filter. Reuses the detail page's image
 * pipeline (`mapGalleryShot`) — no second image loader.
 */
import {fetchSanity} from '@/sanity/fetch'
import {GALLERY_SHOTS_QUERY} from '@/sanity/queries/gallery'
import {mapGalleryShot, type GalleryShot} from '@/lib/work'
import type {Locale} from '@/i18n/config'
import type {GALLERY_SHOTS_QUERY_RESULT} from '@/sanity.types'

/** Coarse device buckets the cross-project gallery filters by. */
export type DeviceGroup = 'iphone' | 'ipad' | 'watch' | 'tv' | 'web' | 'other'

/**
 * One screenshot in the cross-project gallery, flattened from every project's
 * `gallery[]`. Carries the originating project (for the link + label) plus the
 * renderable {@link GalleryShot} reused verbatim by the detail-page `Frame`.
 */
export type GalleryItem = {
  projectName: string
  slug: string
  /**
   * Depth of the project this shot belongs to — `full` when it has a written
   * case study, otherwise `gallery`. Reported with the `project_open` analytics
   * event on tap, matching the project log. Never `none` (these projects all
   * have gallery shots).
   */
  depth: 'full' | 'gallery'
  /** Device bucket for the filter, derived from the shot's `frame`. */
  device: DeviceGroup
  /** The renderable shot (image URL, dimensions, frame, caption). */
  shot: GalleryShot
}

/**
 * Map a per-shot `frame` value onto its filter device group. Phones are iPhone,
 * both tablet orientations are iPad, `watch` is Apple Watch, `tv` is Apple TV,
 * `browser` is web, and anything else (`none`, unknown) falls under the
 * catch-all other bucket.
 *
 * @param frame - the shot's `frame` value
 * @returns the device group
 */
export function deviceOf(frame: string): DeviceGroup {
  if (frame === 'phone') return 'iphone'
  if (frame === 'tablet-landscape' || frame === 'tablet-portrait') return 'ipad'
  if (frame === 'watch') return 'watch'
  if (frame === 'tv') return 'tv'
  if (frame === 'browser') return 'web'
  return 'other'
}

/** Filter chips, in display order (Apple hardware first). `all` clears the device filter. */
export const GALLERY_FILTERS: ('all' | DeviceGroup)[] = ['all', 'iphone', 'ipad', 'watch', 'tv', 'web', 'other']

/**
 * Fetch every project's gallery shots, flattened into one ordered list. Project
 * order follows the log (newest first); shots keep their authored order within a
 * project. Each shot is tagged with its project + device group.
 *
 * @param locale - active locale for resolving shot captions
 * @returns the flattened cross-project shot list (empty when none exist)
 */
export async function getGalleryShots(locale: Locale): Promise<GalleryItem[]> {
  const rows = await fetchSanity<GALLERY_SHOTS_QUERY_RESULT>(GALLERY_SHOTS_QUERY)
  if (!rows) return []
  return rows.flatMap((project) => {
    const depth = project.hasBody ? 'full' : 'gallery'
    return (project.gallery ?? []).flatMap((entry) => {
      const shot = mapGalleryShot(entry, locale)
      if (!shot) return []
      return [
        {
          projectName: project.projectName ?? '',
          slug: project.slug ?? '',
          depth,
          device: deviceOf(shot.frame),
          shot,
        },
      ]
    })
  })
}
