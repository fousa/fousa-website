/**
 * Builds a JSON-LD CreativeWork object for a project case study.
 *
 * Helps search engines and social platforms surface the project with
 * structured information (creator, date, language, image, URL).
 *
 * Inject the returned object into a <script type="application/ld+json">
 * tag in the page's head via dangerouslySetInnerHTML.
 */
import type {CASE_STUDY_QUERY_RESULT} from '@/sanity.types'

export function buildProjectJsonLd({
  project,
  locale,
  siteUrl,
  authorName,
}: {
  project: NonNullable<CASE_STUDY_QUERY_RESULT>
  locale: 'en' | 'nl'
  siteUrl: string
  authorName: string
}) {
  const deck =
    (typeof project.deck === 'object' && project.deck?.[locale]) ||
    (typeof project.deck === 'object' && project.deck?.en) ||
    project.name

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.name,
    description: deck,
    image: `${siteUrl}/og/${project.slug}`,
    url: `${siteUrl}/${locale}/${project.slug}`,
    inLanguage: locale,
    creator: {
      '@type': 'Person',
      name: authorName,
      url: siteUrl,
    },
    ...(project.year && {dateCreated: String(project.year)}),
  }
}
