/**
 * GROQ query for the sitemap — fetches every project slug and its last
 * modified date so sitemap.xml includes accurate <lastmod> values.
 *
 * Only projects that resolve to a real detail page are listed: a project
 * with neither a body nor a gallery has depth "none" and 404s at
 * /work/<slug> (mirrors projectDepth in lib/work.ts), so indexing it would
 * point crawlers at a dead URL.
 */
import {defineQuery} from 'next-sanity'

export const SITEMAP_SLUGS_QUERY = defineQuery(`
  *[_type == "project" && defined(slug.current) && (count(body.en) > 0 || count(gallery) > 0)]{
    "slug": slug.current,
    "lastModified": _updatedAt
  }
`)
