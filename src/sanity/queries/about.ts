/**
 * GROQ query for everything the about page renders.
 *
 * Three sub-queries combined:
 *   - profile: full Profile singleton (bio, portrait asset, socials, CV)
 *   - employers: every Employer ordered most-recent-first (career timeline)
 *   - ownApps: every Project with engagement = "owner", featured first
 *
 * Single round-trip — Sanity handles the multi-query in one request.
 */
import {defineQuery} from 'next-sanity'

export const ABOUT_QUERY = defineQuery(`
  {
    "profile": *[_id == "profile"][0]{
      name,
      tagline,
      aboutHeadline,
      bio,
      beyondCode[]{ title, body },
      location,
      email,
      socialLinks,
      "cvEnUrl": cvEn.asset->url,
      "cvNlUrl": cvNl.asset->url,
      vatNumber,
      copyrightYear,
      "portraitUrl": portrait.asset->url
    },
    "employers": *[_type == "employer"] | order(pinned desc, startDate desc) {
      _id,
      name,
      role,
      startDate,
      endDate,
      pinned,
      engagement,
      description,
      "slug": "employer-" + lower(name)
    },
    "ownApps": *[_type == "project" && engagement == "owner"] | order(featured desc, year desc) {
      _id,
      name,
      "slug": slug.current,
      deck,
      year,
      state,
      liveUrl
    }
  }
`)
