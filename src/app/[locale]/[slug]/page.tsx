/**
 * Standalone case study page at /<locale>/<slug>.
 *
 * Statically prerendered for every project at build time (via
 * generateStaticParams). Fetches by slug, renders the full hero + body +
 * related cards, then the dark contact footer.
 *
 * Meta: generateMetadata builds title, description, og:image (from
 * /og/<slug>), and Twitter card so social shares look intentional.
 *
 * JSON-LD: inline <script type="application/ld+json"> with a CreativeWork
 * object — improves search engine surfaces and platform-side previews.
 */
import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {isLocale} from '@/i18n/config'
import {fetchSanity} from '@/sanity/fetch'
import {client} from '@/sanity/client'
import {CASE_STUDY_QUERY, CASE_STUDY_SLUGS_QUERY} from '@/sanity/queries/case-study'
import {PROFILE_QUERY} from '@/sanity/queries/profile'
import {AVAILABILITY_QUERY} from '@/sanity/queries/availability'
import {t} from '@/i18n/messages'
import {pickLocale} from '@/i18n/pick-locale'
import {buildProjectJsonLd} from '@/lib/json-ld'
import {altMetadata} from '@/lib/seo'
import {CaseStudyHero} from '@/components/case-study/case-study-hero'
import {CaseStudyBody} from '@/components/case-study/case-study-body'
import {RelatedWork} from '@/components/case-study/related-work'
import {ContactFooter} from '@/components/about/contact-footer'
import type {
  CASE_STUDY_QUERY_RESULT,
  CASE_STUDY_SLUGS_QUERY_RESULT,
  PROFILE_QUERY_RESULT,
  AVAILABILITY_QUERY_RESULT,
} from '@/sanity.types'

const SITE_URL = 'https://fousa.be' // kept for OG image URL

/**
 * Statically build a page for every (locale, slug) pair at build time.
 * Re-runs on each deploy; ISR + revalidation keeps existing pages fresh.
 */
export async function generateStaticParams() {
  const slugs = await client.fetch<CASE_STUDY_SLUGS_QUERY_RESULT>(
    CASE_STUDY_SLUGS_QUERY
  )
  return slugs
    .filter((s) => s.slug != null)
    .map((s) => ({slug: String(s.slug)}))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string; slug: string}>
}): Promise<Metadata> {
  const {locale, slug} = await params
  if (!isLocale(locale)) return {}

  const project = await fetchSanity<CASE_STUDY_QUERY_RESULT>(CASE_STUDY_QUERY, {slug})
  if (!project) return {title: t(locale, 'notFoundTitle')}

  const deck = pickLocale(
    typeof project.deck === 'object' ? project.deck : null,
    locale
  )
  const title = `${project.name} ${t(locale, 'caseStudyMetaSuffix')}`
  const description = deck ?? `${project.name} — case study`
  const ogImage = `${SITE_URL}/og/${slug}`

  return {
    title,
    description,
    ...altMetadata(locale, `/${slug}`),
    openGraph: {
      title,
      description,
      url: altMetadata(locale, `/${slug}`).alternates?.canonical as string,
      siteName: 'fousa.be',
      images: [{url: ogImage, width: 1200, height: 630}],
      locale: locale === 'nl' ? 'nl_BE' : 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{locale: string; slug: string}>
}) {
  const {locale, slug} = await params
  if (!isLocale(locale)) notFound()

  const [project, profile, availability] = await Promise.all([
    fetchSanity<CASE_STUDY_QUERY_RESULT>(CASE_STUDY_QUERY, {slug}),
    fetchSanity<PROFILE_QUERY_RESULT>(PROFILE_QUERY),
    fetchSanity<AVAILABILITY_QUERY_RESULT>(AVAILABILITY_QUERY),
  ])

  if (!project) notFound()

  const jsonLd = buildProjectJsonLd({
    project,
    locale,
    siteUrl: SITE_URL,
    authorName: profile?.name ?? 'Jelle Vandebeeck',
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
      />
      <article id="main">
        <CaseStudyHero project={project} locale={locale} />
        <CaseStudyBody project={project} locale={locale} />
        <RelatedWork related={project.related ?? []} locale={locale} />
      </article>
      <ContactFooter
        profile={profile}
        availability={availability}
        locale={locale}
      />
    </>
  )
}
