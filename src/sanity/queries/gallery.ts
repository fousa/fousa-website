/**
 * GROQ query for the cross-project Gallery page.
 *
 * Pulls every project that carries at least one gallery shot, newest-first
 * (year, then most recently updated), with each shot's `frame`, localized
 * `caption` and crop-aware `image` — the same projection the case study uses (`@/sanity/queries/case-study`), so both
 * pages render shots through the one image pipeline (`mapGalleryShot`).
 */
import {defineQuery} from 'next-sanity'

export const GALLERY_SHOTS_QUERY = defineQuery(`
  *[_type == "project" && visible != false && count(gallery) > 0] | order(year desc, _updatedAt desc) {
    "slug": slug.current,
    "projectName": name,
    "hasBody": count(body.en) > 0,
    "gallery": gallery[]{
      _key,
      frame,
      caption,
      "image": image{
        ...,
        "dimensions": asset->metadata.dimensions
      }
    }
  }
`)
