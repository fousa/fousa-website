/**
 * Gallery Open Graph card. Montage layout (four featured screenshots) titled
 * with the gallery heading and described by the gallery blurb.
 */
import {OgCard} from '@/og/OgCard'
import {ogResponse, ogSize} from '@/og/respond'
import {getFeaturedShots} from '@/lib/og-shots'
import {isLocale, defaultLocale} from '@/i18n/config'
import {t} from '@/i18n/messages'

export const runtime = 'nodejs'
export const size = ogSize
export const contentType = 'image/png'
export const alt = 'Gallery — fousa.be'

export default async function Image({params}: {params: Promise<{locale: string}>}) {
  const {locale: raw} = await params
  const locale = isLocale(raw) ? raw : defaultLocale

  const shots = await getFeaturedShots(4)

  return ogResponse(
    <OgCard
      eyebrow={t(locale, 'galleryEyebrow')}
      title={t(locale, 'galleryTitle')}
      deck={t(locale, 'galleryDesc')}
      domain="fousa.be"
      shots={shots}
    />,
  )
}
