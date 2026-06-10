/**
 * Builds a JSON-LD CreativeWork object for a project case study.
 *
 * Helps search engines and social platforms surface the project with
 * structured information (creator, date, language, image, URL).
 *
 * Inject the returned object into a <script type="application/ld+json">
 * tag in the page's head via dangerouslySetInnerHTML.
 */
export function buildProjectJsonLd({
  project,
  locale,
  siteUrl,
  url,
  authorName,
}: {
  project: {name: string; slug: string; year: number; deck?: string | null}
  locale: 'en' | 'nl'
  siteUrl: string
  /** Canonical URL of the page this script is embedded in. */
  url: string
  authorName: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.name,
    description: project.deck ?? project.name,
    image: `${url}/opengraph-image`,
    url,
    inLanguage: locale,
    creator: {
      '@type': 'Person',
      name: authorName,
      url: siteUrl,
    },
    ...(project.year && {dateCreated: String(project.year)}),
  }
}
