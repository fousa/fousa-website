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

export function middleware(req: NextRequest) {
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
  matcher: ['/((?!_next|api|og|studio|.*\\..*).*)'],
}
