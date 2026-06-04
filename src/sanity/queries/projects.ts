/**
 * GROQ query for all projects in the log.
 *
 * Dereferences employer (so we can show the name in the row) and stack tags
 * (so we can render chips by category). Ordered most-recent-first (year
 * descending, name ascending) — matches what the homepage table needs out of the box.
 *
 * Includes the lightweight case-study fields the expanded log row needs (deck,
 * summary, links). ~65 documents, so the payload stays small.
 */
import {defineQuery} from 'next-sanity'

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project"] | order(year desc, name asc) {
    _id,
    name,
    "slug": slug.current,
    year,
    endYear,
    state,
    engagement,
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
      "slug": slug.current,
      "category": category->slug.current
    },
    featureTooling,
    "hasBody": count(body.en) > 0,
    "galleryCount": count(gallery)
  }
`)
