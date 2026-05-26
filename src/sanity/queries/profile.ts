/**
 * GROQ query for the Profile singleton.
 *
 * Returns all fields needed by the top bar and the contact footer:
 * name, tagline, location, email, social links, CV, VAT, copyright year.
 */
import {defineQuery} from 'next-sanity'

export const PROFILE_QUERY = defineQuery(`
  *[_id == "profile"][0]{
    name,
    tagline,
    location,
    email,
    socialLinks,
    vatNumber,
    copyrightYear,
    "cv": cv{
      "asset": asset->
    }
  }
`)
