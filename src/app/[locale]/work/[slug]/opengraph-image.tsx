/**
 * Case-study Open Graph card (per slug). The montage fills with the project's
 * own gallery shots; title/deck/meta come from the project. An unknown slug
 * falls back to a generic featured-shot card rather than erroring.
 */
import {OgCard} from '@/og/OgCard'
import {ogResponse, ogSize} from '@/og/respond'
import {getCaseShots, getFeaturedShots} from '@/lib/og-shots'
import {getProjectDetail} from '@/lib/work'
import {isLocale, defaultLocale} from '@/i18n/config'
import {t} from '@/i18n/messages'

export const runtime = 'nodejs'
export const size = ogSize
export const contentType = 'image/png'
export const alt = 'Case study — fousa.be'

export default async function Image({
  params,
}: {
  params: Promise<{locale: string; slug: string}>
}) {
  const {locale: raw, slug} = await params
  const locale = isLocale(raw) ? raw : defaultLocale

  const [project, shots] = await Promise.all([
    getProjectDetail(slug, locale),
    getCaseShots(slug),
  ])

  // Unknown / detail-less slug: keep the route renderable with a generic card.
  if (!project || project.depth === 'none') {
    return ogResponse(
      <OgCard
        eyebrow={t(locale, 'galleryEyebrow')}
        title="fousa.be"
        deck={t(locale, 'siteDescription')}
        domain="fousa.be"
        shots={await getFeaturedShots(4)}
      />,
    )
  }

  return ogResponse(
    <OgCard
      eyebrow={`${t(locale, 'ogCaseStudy')} · ${project.year}`}
      title={project.name}
      deck={project.deck ?? undefined}
      domain="fousa.be"
      meta={project.platforms || undefined}
      shots={shots}
    />,
  )
}
