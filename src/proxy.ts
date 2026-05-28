/**
 * Edge proxy — locale routing with unprefixed default.
 *
 * English is the default locale and never appears in the URL:
 *   /           → en
 *   /about      → en
 *   /nl         → nl
 *   /nl/about   → nl
 *   /en/about   → 308 → /about   (canonical redirect)
 *
 * No browser-locale detection, no cookies, no redirect flicker —
 * the URL alone determines the language.
 */
import {NextResponse, type NextRequest} from 'next/server'
import {defaultLocale, isLocale} from '@/i18n/config'

export function proxy(req: NextRequest) {
  const {pathname} = req.nextUrl

  // Skip non-page paths
  if (
    pathname.startsWith('/studio') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/og') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const seg1 = pathname.split('/')[1]

  // /en/... → redirect to unprefixed (canonical English form)
  if (seg1 === defaultLocale) {
    const url = req.nextUrl.clone()
    const rest = pathname.slice(`/${defaultLocale}`.length) || '/'
    url.pathname = rest
    return NextResponse.redirect(url, 308)
  }

  // /nl/... → pass through, rewrite to [locale]=nl
  if (isLocale(seg1)) {
    const res = NextResponse.next()
    res.headers.set('x-pathname', pathname)
    return res
  }

  // Unprefixed path → rewrite to /en/... internally (no redirect)
  const url = req.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next|studio|api|og).*)'],
}
