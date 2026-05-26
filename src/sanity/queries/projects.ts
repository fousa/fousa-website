/**
 * GROQ query for all projects in the log.
 *
 * Dereferences employer (so we can show the name in the row) and stack tags
 * (so we can render chips by category). Ordered featured-first, then by year
 * descending — matches what the homepage table needs out of the box.
 *
 * Includes case study fields (deck, description, screenshots) because they're
 * cheap to ship and Phase 3b will need them for row expansion. ~65 documents,
 * the payload is small even with full case study content.
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
    role,
    client,
    deck,
    description,
    outcome,
    liveUrl,
    githubUrl,
    writeupUrl,
    "employer": employer->{
      _id,
      name
    },
    "stack": stack[]->{
      _id,
      name,
      "slug": slug.current,
      category
    },
    "screenshots": screenshots[]{
      _key,
      alt,
      "asset": asset->
    }
  }
`)
