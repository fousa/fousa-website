/**
 * Dynamic sitemap — lists every locale variant of the homepage, about page,
 * and all case study slugs fetched from Sanity. Revalidated via ISR.
 */
import type {MetadataRoute} from 'next'
import {locales} from '@/i18n/config'
import {fetchSanity} from '@/sanity/fetch'
import {SITEMAP_SLUGS_QUERY} from '@/sanity/queries/sitemap'
import type {SITEMAP_SLUGS_QUERY_RESULT} from '@/sanity.types'

const SITE_URL = 'https://fousa.be'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await fetchSanity<SITEMAP_SLUGS_QUERY_RESULT>(SITEMAP_SLUGS_QUERY)

  const staticPages = locales.flatMap((locale) => [
    {url: `${SITE_URL}/${locale}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1},
    {url: `${SITE_URL}/${locale}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8},
  ])

  const projectPages = slugs
    .filter((s) => s.slug != null)
    .flatMap((s) =>
      locales.map((locale) => ({
        url: `${SITE_URL}/${locale}/${String(s.slug)}`,
        lastModified: s.lastModified ? new Date(s.lastModified) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    )

  return [...staticPages, ...projectPages]
}
