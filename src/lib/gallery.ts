/**
 * Cross-project gallery data layer.
 *
 * Flattens every project's `gallery[]` into a single stream of shots for the
 * `/gallery` page, tagging each with the project it belongs to and a coarse
 * device group used by the page's filter. Reuses the detail page's image
 * pipeline (`mapGalleryShot`) — no second image loader.
 */
import type {GalleryShot} from '@/lib/work'

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
