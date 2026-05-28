/**
 * Edge proxy — locale detection and redirect.
 *
 * Reads the preferred locale from a cookie or Accept-Language header,
 * then redirects bare paths (e.g. `/`) to the locale-prefixed version.
 * Paths that already have a locale segment pass through with an
 * `x-pathname` header so the root layout can read the current locale.
 */
import {NextResponse, type NextRequest} from 'next/server'
import {defaultLocale, isLocale} from '@/i18n/config'

const LOCALE_COOKIE = 'NEXT_LOCALE'

function detectLocale(req: NextRequest): string {
  const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale

  const acceptLanguage = req.headers.get('accept-language') || ''
  const preferred = acceptLanguage
    .split(',')
    .map((l) => l.split(';')[0].trim().toLowerCase().slice(0, 2))
  for (const lang of preferred) {
    if (isLocale(lang)) return lang
  }
  return defaultLocale
}

export function proxy(req: NextRequest) {
  const {pathname} = req.nextUrl

  if (
    pathname.startsWith('/studio') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/og') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const localeInPath = pathname.split('/')[1]

  if (isLocale(localeInPath)) {
    const res = NextResponse.next()
    res.headers.set('x-pathname', pathname)
    res.cookies.set(LOCALE_COOKIE, localeInPath, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
    return res
  }

  const locale = detectLocale(req)
  const url = req.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/', '/en/:path*', '/nl/:path*'],
}
