/**
 * Custom 404 for case study slugs that don't resolve.
 *
 * Triggered by `notFound()` in the case study page. Reads the locale from
 * the URL path manually since Next doesn't pass params to not-found.tsx.
 * Falls back to English if the path is malformed.
 */
import Link from 'next/link'
import {headers} from 'next/headers'
import {t} from '@/i18n/messages'
import type {Locale} from '@/i18n/config'

async function detectLocaleFromPath(): Promise<Locale> {
  const h = await headers()
  const pathname = h.get('x-pathname') || h.get('referer') || ''
  return pathname.includes('/nl/') ? 'nl' : 'en'
}

export default async function NotFound() {
  const locale = await detectLocaleFromPath()
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-center">
      <p className="font-mono text-[9px] font-medium uppercase tracking-[2px] text-sepia mb-4">
        404
      </p>
      <h1 className="font-serif text-[32px] font-medium text-ink mb-3">
        {t(locale, 'notFoundTitle')}
      </h1>
      <p className="font-sans text-[14px] text-ink-muted leading-relaxed mb-8 max-w-md mx-auto">
        {t(locale, 'notFoundDescription')}
      </p>
      <Link
        href={`/${locale}`}
        className="font-mono text-[11px] font-medium uppercase tracking-wider text-ios hover:underline"
      >
        ← {t(locale, 'backToLog')}
      </Link>
    </main>
  )
}
