/**
 * GROQ query for everything the about page renders.
 *
 * Three sub-queries combined:
 *   - profile: full Profile singleton (bio, portrait asset, socials, CV)
 *   - timeline: every TimelineEntry ordered most-recent-first (career timeline)
 *   - ownApps: every Project with engagement = "owner", most-recent first
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
      beyondCode[]{
        title,
        body,
        image{
          "url": asset->url,
          "lqip": asset->metadata.lqip,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height,
          alt
        }
      },
      location,
      email,
      socialLinks,
      "cvEnUrl": cvEn.asset->url,
      "cvNlUrl": cvNl.asset->url,
      vatNumber,
      copyrightYear,
      "portraitUrl": portrait.asset->url
    },
    "timeline": *[_type == "timelineEntry"] | order(startDate desc) {
      _id,
      organisation,
      title,
      group,
      startDate,
      endDate,
      description,
      location
    },
    "ownApps": *[_type == "project" && engagement == "owner"] | order(year desc) {
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
