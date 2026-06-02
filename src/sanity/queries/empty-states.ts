/**
 * GROQ query for the Empty-states singleton.
 *
 * Returns the raw override list — each entry's filter keys plus the localized
 * headline/body objects. Locale resolution happens in `getEmptyStates`.
 */
import {defineQuery} from 'next-sanity'

export const EMPTY_STATES_QUERY = defineQuery(`
  *[_id == "emptyStates"][0]{
    overrides[]{
      filters,
      headline,
      body
    }
  }
`)
