/**
 * `/kmo/<file>.pdf` — the KMO sales sheets, served from fousa.be instead of
 * the Sanity CDN so they keep a stable URL and carry `X-Robots-Tag: noindex`
 * like the page that links them.
 *
 * Only filenames the PDF script produces are accepted, and only files
 * attached to the KMO page singleton resolve (see KMO_PDF_QUERY), so this is
 * not an open proxy onto the Sanity asset store. Responses are cached like
 * the pages (1 h, purged by the Sanity webhook).
 */
import {fetchSanity} from '@/sanity/fetch'
import {KMO_PDF_QUERY} from '@/sanity/queries/kmo'
import type {KMO_PDF_QUERY_RESULT} from '@/sanity.types'
import {isSheetFilename} from '@/lib/kmo'

const NOINDEX = 'noindex, nofollow'

export async function GET(_req: Request, {params}: {params: Promise<{file: string}>}) {
  const {file} = await params
  const notFound = () =>
    new Response('Not found', {status: 404, headers: {'X-Robots-Tag': NOINDEX}})

  if (!isSheetFilename(file)) return notFound()

  const url = (await fetchSanity<KMO_PDF_QUERY_RESULT>(KMO_PDF_QUERY, {file}))?.url
  if (!url) return notFound()

  const upstream = await fetch(url, {next: {revalidate: 3600}})
  if (!upstream.ok || !upstream.body) return notFound()

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${file}"`,
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      'X-Robots-Tag': NOINDEX,
    },
  })
}
