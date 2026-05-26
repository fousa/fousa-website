/**
 * Programmatic robots.txt — allows all crawlers, points to the sitemap,
 * and blocks the embedded Sanity Studio from indexing.
 */
import type {MetadataRoute} from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {userAgent: '*', allow: '/', disallow: '/studio/'},
    sitemap: 'https://fousa.be/sitemap.xml',
  }
}
