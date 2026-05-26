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
      bio,
      location,
      email,
      socialLinks,
      vatNumber,
      copyrightYear,
      "portrait": portrait{
        alt,
        "asset": asset->
      },
      "cv": cv{
        "asset": asset->
      }
    },
    "employers": *[_type == "employer"] | order(startYear desc, order desc) {
      _id,
      name,
      role,
      startYear,
      endYear,
      engagement,
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
