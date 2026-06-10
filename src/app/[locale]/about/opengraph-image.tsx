/**
 * About Open Graph card. Montage layout (three featured screenshots) with the
 * person's name as the title and the bio one-liner as the deck.
 */
import {OgCard} from '@/og/OgCard'
import {ogResponse, ogSize} from '@/og/respond'
import {getFeaturedShots} from '@/lib/og-shots'
import {fetchSanity} from '@/sanity/fetch'
import {PROFILE_QUERY} from '@/sanity/queries/profile'
import type {PROFILE_QUERY_RESULT} from '@/sanity.types'
import {isLocale, defaultLocale} from '@/i18n/config'
import {t} from '@/i18n/messages'

export const runtime = 'nodejs'
export const size = ogSize
export const contentType = 'image/png'
export const alt = 'About — fousa.be'

export default async function Image({params}: {params: Promise<{locale: string}>}) {
  const {locale: raw} = await params
  const locale = isLocale(raw) ? raw : defaultLocale

  const [shots, profile] = await Promise.all([
    getFeaturedShots(3),
    fetchSanity<PROFILE_QUERY_RESULT>(PROFILE_QUERY),
  ])

  return ogResponse(
    <OgCard
      layout="about"
      eyebrow={t(locale, 'aboutTitle')}
      title={profile?.name ?? 'Jelle Vandebeeck'}
      deck={t(locale, 'aboutDescription')}
      domain="fousa.be"
      shots={shots}
    />,
  )
}
