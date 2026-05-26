/**
 * GROQ query for the Availability singleton — drives the top-bar pill.
 */
import {defineQuery} from 'next-sanity'

export const AVAILABILITY_QUERY = defineQuery(`
  *[_id == "availability"][0]{
    status,
    label,
    nextOpening
  }
`)
