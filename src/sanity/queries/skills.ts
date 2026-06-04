/**
 * GROQ query for the About "Skills" section.
 *
 * SKILLS_QUERY — every stack tag referenced by at least one project, with its
 * filter key (slug), display name, grouping category, and project usage count,
 * ordered most-used first (name A–Z breaks ties). Drives the category-grouped
 * skills list, where each tag links to the homepage log filtered by that skill
 * (`?skill=<key>`).
 */
import {defineQuery} from 'next-sanity'

export const SKILLS_QUERY = defineQuery(`
  *[_type == "stackTag" && count(*[_type == "project" && references(^._id)]) > 0]{
    "key": slug.current,
    "name": name,
    "category": category,
    "count": count(*[_type == "project" && references(^._id)])
  } | order(count desc, name asc)
`)
