/**
 * GROQ queries feeding the Open Graph cards.
 *
 * FEATURED_SHOTS_QUERY — the first gallery shot (raw image + frame) of the `$n`
 * most relevant projects (active first, then newest), for the montage on the
 * home / gallery / about cards.
 *
 * CASE_SHOTS_QUERY — the first one or two gallery shots of a single project, for
 * its case-study card.
 *
 * Both project the raw `image` object (asset ref + crop/hotspot) rather than
 * `asset->url`, so `urlForImage` can bake the crop and force a Satori-safe format.
 */
import {defineQuery} from 'next-sanity'

export const FEATURED_SHOTS_QUERY = defineQuery(`
  *[_type == "project" && count(gallery) > 0]
    | order((state == "active") desc, year desc)[0...$n]{
      "frame": gallery[0].frame,
      "image": gallery[0].image
    }
`)

export const CASE_SHOTS_QUERY = defineQuery(`
  *[_type == "project" && slug.current == $slug][0]{
    "shots": gallery[0..1]{
      "frame": frame,
      "image": image
    }
  }
`)
