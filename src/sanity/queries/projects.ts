/**
 * GROQ query for all projects in the log.
 *
 * Dereferences employer (so we can show the name in the row) and stack tags
 * (so we can render chips by category). Ordered featured-first, then by year
 * descending — matches what the homepage table needs out of the box.
 *
 * Includes the lightweight case-study fields the expanded log row needs (deck,
 * summary, links). ~65 documents, so the payload stays small.
 */
import {defineQuery} from 'next-sanity'

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project"] | order(featured desc, year desc, name asc) {
    _id,
    name,
    "slug": slug.current,
    year,
    endYear,
    state,
    engagement,
    featured,
    isTool,
    role,
    client,
    deck,
    summary,
    liveUrl,
    githubUrl,
    "employer": employer->{
      _id,
      "name": organisation,
      "slug": lower(organisation)
    },
    "stack": stack[]->{
      _id,
      name,
      "slug": slug.current
    },
    featureTooling,
    "hasBody": count(body.en) > 0,
    "galleryCount": count(gallery)
  }
`)
