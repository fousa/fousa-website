/**
 * Dynamic sitemap — lists every locale variant of the homepage, about page,
 * and all case study slugs fetched from Sanity. English is unprefixed (default);
 * Dutch is under /nl. Revalidated via ISR.
 */
import type {MetadataRoute} from 'next'
import {fetchSanity} from '@/sanity/fetch'
import {SITEMAP_SLUGS_QUERY} from '@/sanity/queries/sitemap'
import type {SITEMAP_SLUGS_QUERY_RESULT} from '@/sanity.types'

const SITE_URL = 'https://fousa.be'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await fetchSanity<SITEMAP_SLUGS_QUERY_RESULT>(SITEMAP_SLUGS_QUERY)

  const staticPages = [
    {url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1},
    {url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8},
    {url: `${SITE_URL}/gallery`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8},
    {url: `${SITE_URL}/nl`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9},
    {url: `${SITE_URL}/nl/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7},
    {url: `${SITE_URL}/nl/gallery`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7},
  ]

  const projectPages = slugs
    .filter((s) => s.slug != null)
    .flatMap((s) => [
      {
        url: `${SITE_URL}/work/${String(s.slug)}`,
        lastModified: s.lastModified ? new Date(s.lastModified) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/nl/work/${String(s.slug)}`,
        lastModified: s.lastModified ? new Date(s.lastModified) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
    ])

  return [...staticPages, ...projectPages]
}
