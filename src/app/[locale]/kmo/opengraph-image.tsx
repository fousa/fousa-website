/**
 * KMO page Open Graph card: the preview a prospect sees when the unlisted
 * /nl/kmo link is pasted into a mail or chat. Montage of three featured
 * screenshots with the page's eyebrow, title and description from Sanity.
 */
import {OgCard} from '@/og/OgCard'
import {ogResponse, ogSize} from '@/og/respond'
import {getFeaturedShots} from '@/lib/og-shots'
import {fetchSanity} from '@/sanity/fetch'
import {KMO_OG_QUERY} from '@/sanity/queries/kmo'
import type {KMO_OG_QUERY_RESULT} from '@/sanity.types'

export const runtime = 'nodejs'
export const size = ogSize
export const contentType = 'image/png'
export const alt = 'Software op maat voor KMO’s — fousa.be'

export default async function Image() {
  const [shots, page] = await Promise.all([
    getFeaturedShots(3),
    fetchSanity<KMO_OG_QUERY_RESULT>(KMO_OG_QUERY),
  ])

  return ogResponse(
    <OgCard
      eyebrow={page?.eyebrow ?? 'Voor KMO’s'}
      title={page?.title ?? 'Software op maat voor KMO’s'}
      deck={page?.description ?? ''}
      domain="fousa.be"
      shots={shots}
    />,
  )
}
