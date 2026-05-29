/**
 * GROQ query for the Profile singleton.
 *
 * Returns all fields needed by the homepage lead, about page, contact
 * footer, and CV download: name, tagline, localized copy, beyond-code
 * list, per-locale CV asset URLs, social links, and footer metadata.
 */
import {defineQuery} from 'next-sanity'

export const PROFILE_QUERY = defineQuery(`
  *[_id == "profile"][0]{
    name,
    tagline,
    roleLine,
    filterIntro,
    aboutHeadline,
    bio,
    "portraitUrl": portrait.asset->url,
    beyondCode[]{
      title,
      body
    },
    location,
    email,
    socialLinks,
    "cvEnUrl": cvEn.asset->url,
    "cvNlUrl": cvNl.asset->url,
    vatNumber,
    copyrightYear
  }
`)
