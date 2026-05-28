/**
 * GROQ query for the Site Settings singleton — email, socials, SEO.
 */
import {defineQuery} from 'next-sanity'

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_id == "siteSettings"][0]{
    email,
    socials[]{
      platform,
      url,
      label
    },
    metaDescription,
    "ogImageUrl": ogImage.asset->url
  }
`)
