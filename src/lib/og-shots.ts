/**
 * Screenshot helpers for the Open Graph cards.
 *
 * Both return absolute cdn.sanity.io URLs forced to **jpg** — Satori (next/og)
 * can decode png/jpg/gif but not the webp that `auto('format')` would serve — at
 * a size comfortably above the card's device boxes so they stay crisp. The crop
 * is baked in via `urlForImage`, matching the rest of the site.
 *
 * `getFeaturedShots` feeds the home / gallery / about cards with one shot from
 * each top project; `getCaseShots` feeds a case-study card with several shots
 * from the one project. Both fill the same four-slot montage.
 */
import type {SanityImageSource} from '@sanity/image-url'
import {fetchSanity} from '@/sanity/fetch'
import {urlForImage} from '@/sanity/image'
import {FEATURED_SHOTS_QUERY, CASE_SHOTS_QUERY} from '@/sanity/queries/og-shots'
import type {
  FEATURED_SHOTS_QUERY_RESULT,
  CASE_SHOTS_QUERY_RESULT,
} from '@/sanity.types'
import type {Shot} from '@/og/OgCard'

/** Build one Satori-safe (jpg) card URL from a raw Sanity image + frame. */
function toShot(
  image: SanityImageSource,
  frame: string | null,
  width: number,
): Shot {
  return {
    url: urlForImage(image).width(width).fit('max').format('jpg').quality(82).url(),
    frame: frame ?? 'browser',
  }
}

/**
 * The first gallery shot of the `n` most relevant projects (active first, then
 * newest), for the montage cards. Projects without a usable image are skipped.
 */
export async function getFeaturedShots(n = 4): Promise<Shot[]> {
  const rows = await fetchSanity<FEATURED_SHOTS_QUERY_RESULT>(
    FEATURED_SHOTS_QUERY,
    {n},
  )
  return (rows ?? []).flatMap((r) =>
    r.image ? [toShot(r.image, r.frame, 800)] : [],
  )
}

/** Up to the first four gallery shots of a single project, for its case card. */
export async function getCaseShots(slug: string): Promise<Shot[]> {
  const row = await fetchSanity<CASE_SHOTS_QUERY_RESULT>(CASE_SHOTS_QUERY, {slug})
  return (row?.shots ?? []).flatMap((s) =>
    s.image ? [toShot(s.image, s.frame, 900)] : [],
  )
}
