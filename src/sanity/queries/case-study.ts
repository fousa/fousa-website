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
    role,
    client,
    deck,
    summary,
    body,
    liveUrl,
    githubUrl,
    featured,
    featureTooling,
    "employer": employer->{
      _id,
      "name": organisation,
      "slug": "employer-" + lower(organisation)
    },
    "stack": stack[]->{
      _id,
      name,
      "slug": slug.current
    },
    "coverUrl": cover.asset->url,
    "coverAlt": cover.alt,
    "gallery": gallery[]{
      _key,
      frame,
      caption,
      "imageUrl": image.asset->url,
      "width": image.asset->metadata.dimensions.width,
      "height": image.asset->metadata.dimensions.height
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
