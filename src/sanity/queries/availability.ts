/**
 * GROQ query for the Availability singleton — drives the contact-panel badge.
 */
import {defineQuery} from 'next-sanity'

export const AVAILABILITY_QUERY = defineQuery(`
  *[_id == "availability"][0]{
    status,
    message,
    nextOpening
  }
`)
