/**
 * Home Open Graph card. Montage layout with the four most relevant screenshots;
 * the lead (name + role) comes from the Profile singleton, falling back to the
 * site defaults. Node runtime so the font loader's fetch is unrestricted.
 */
import {OgCard} from '@/og/OgCard'
import {ogResponse, ogSize} from '@/og/respond'
import {getFeaturedShots} from '@/lib/og-shots'
import {fetchSanity} from '@/sanity/fetch'
import {PROFILE_QUERY} from '@/sanity/queries/profile'
import type {PROFILE_QUERY_RESULT} from '@/sanity.types'
import {isLocale, defaultLocale} from '@/i18n/config'
import {t} from '@/i18n/messages'
import {pickLocale} from '@/i18n/pick-locale'

export const runtime = 'nodejs'
export const size = ogSize
export const contentType = 'image/png'
export const alt = 'fousa.be — freelance iOS & web developer'

export default async function Image({params}: {params: Promise<{locale: string}>}) {
  const {locale: raw} = await params
  const locale = isLocale(raw) ? raw : defaultLocale

  const [shots, profile] = await Promise.all([
    getFeaturedShots(4),
    fetchSanity<PROFILE_QUERY_RESULT>(PROFILE_QUERY),
  ])

  const name = profile?.name ?? 'Jelle Vandebeeck'
  const role =
    pickLocale(typeof profile?.roleLine === 'object' ? profile.roleLine : null, locale) ??
    t(locale, 'homeHeadline')

  return ogResponse(
    <OgCard
      eyebrow={role}
      title={name}
      deck={t(locale, 'siteDescription')}
      domain="fousa.be"
      shots={shots}
    />,
  )
}
