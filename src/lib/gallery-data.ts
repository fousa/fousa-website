/**
 * Server-side fetcher for the cross-project `/gallery` page. Runs the gallery
 * GROQ query (server-only, token-bearing) and maps shots with the pure helpers
 * in `gallery.ts` / `work.ts`, which stay importable from client components.
 */
import {fetchSanity} from '@/sanity/fetch'
import {GALLERY_SHOTS_QUERY} from '@/sanity/queries/gallery'
import {mapGalleryShot} from '@/lib/work'
import type {Locale} from '@/i18n/config'
import type {GALLERY_SHOTS_QUERY_RESULT} from '@/sanity.types'
import {deviceOf, type GalleryItem} from './gallery'

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
