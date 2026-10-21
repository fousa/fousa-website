/**
 * Sanity webhook → on-demand ISR.
 *
 * `POST /api/revalidate?secret=…` is called by Sanity when a document changes.
 * The shared secret (`SANITY_REVALIDATE_SECRET`) gates it, compared in
 * constant time. On a match the whole route tree is purged
 * (`revalidatePath('/', 'layout')`): the site is a few dozen static pages, so
 * one blanket purge is cheaper and safer than tracking which locale, detail,
 * gallery, sitemap and Open Graph routes a given document feeds.
 */
import {timingSafeEqual} from 'node:crypto'
import {revalidatePath} from 'next/cache'
import {type NextRequest, NextResponse} from 'next/server'

/**
 * Constant-time comparison of the presented secret against the configured one.
 * Missing values never match, and length is checked first because
 * `timingSafeEqual` throws on unequal buffers.
 */
function secretMatches(given: string | null, expected: string | undefined): boolean {
  if (!given || !expected) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!secretMatches(secret, process.env.SANITY_REVALIDATE_SECRET)) {
    return NextResponse.json(
      {ok: false, error: 'Invalid secret'},
      {status: 401}
    )
  }

  try {
    // Body is informational only (echoed for webhook logs); nothing in it
    // decides what gets purged.
    const body = await req.json().catch(() => null)
    const type = body?._type as string | undefined
    const slug = body?.slug?.current as string | undefined

    revalidatePath('/', 'layout')

    return NextResponse.json({ok: true, revalidated: true, type, slug})
  } catch (err) {
    return NextResponse.json({ok: false, error: String(err)}, {status: 500})
  }
}
