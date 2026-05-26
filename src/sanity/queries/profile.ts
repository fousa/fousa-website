/**
 * GROQ query for the Profile singleton.
 *
 * Returns only what the top bar needs in Phase 3a — name, tagline, location,
 * email. The full bio + portrait + CV come into play on the about page,
 * which we'll fetch with a separate query then.
 */
import {defineQuery} from 'next-sanity'

export const PROFILE_QUERY = defineQuery(`
  *[_id == "profile"][0]{
    name,
    tagline,
    location,
    email
  }
`)
