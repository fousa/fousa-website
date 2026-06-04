/**
 * GROQ query for the About "Skills" section.
 *
 * SKILLS_QUERY — every stack tag referenced by at least one project, with its
 * filter key (slug), display name, and project usage count, ordered most-used
 * first (name A–Z breaks ties). Drives the three-column skills list, where each
 * row links to the homepage log filtered by that skill (`?skill=<key>`).
 */
import {defineQuery} from 'next-sanity'

export const SKILLS_QUERY = defineQuery(`
  *[_type == "stackTag" && count(*[_type == "project" && references(^._id)]) > 0]{
    "key": slug.current,
    "name": name,
    "count": count(*[_type == "project" && references(^._id)])
  } | order(count desc, name asc)
`)
