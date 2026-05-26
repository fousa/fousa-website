/**
 * GROQ query for the sitemap — fetches every project slug and its last
 * modified date so sitemap.xml includes accurate <lastmod> values.
 */
import {defineQuery} from 'next-sanity'

export const SITEMAP_SLUGS_QUERY = defineQuery(`
  *[_type == "project" && defined(slug.current)]{
    "slug": slug.current,
    "lastModified": _updatedAt
  }
`)
