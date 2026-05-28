/**
 * GROQ queries for the standalone case study page.
 *
 * CASE_STUDY_QUERY — full project document by slug, with dereferenced
 * employer and stack tags. Also pulls up to three related projects from
 * the same employer (excluding the current project) for the "related work"
 * footer of the page.
 *
 * CASE_STUDY_SLUGS_QUERY — every project slug, used by generateStaticParams
 * so each case study page is statically prerendered at build time.
 */
import {defineQuery} from 'next-sanity'

export const CASE_STUDY_QUERY = defineQuery(`
  *[_type == "project" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    year,
    endYear,
    state,
    engagement,
    relation,
    role,
    client,
    deck,
    summary,
    description,
    outcome,
    body,
    liveUrl,
    githubUrl,
    writeupUrl,
    featured,
    "employer": employer->{
      _id,
      name,
      "slug": "employer-" + lower(name)
    },
    "stack": stack[]->{
      _id,
      name,
      "slug": slug.current,
      category
    },
    "coverUrl": cover.asset->url,
    "coverAlt": cover.alt,
    "screenshots": screenshots[]{
      _key,
      alt,
      "asset": asset->
    },
    "related": *[
      _type == "project"
      && slug.current != $slug
      && references(^.employer._ref)
    ] | order(featured desc, year desc) [0...3] {
      _id,
      name,
      "slug": slug.current,
      year,
      deck
    }
  }
`)

export const CASE_STUDY_SLUGS_QUERY = defineQuery(`
  *[_type == "project" && defined(slug.current)]{
    "slug": slug.current
  }
`)
