/**
 * Locale layout — validates the locale param and wraps every page with
 * the TopBar. The TopBar fetches Profile and Availability once per request;
 * Next.js dedupes the call when the same query is used across this layout
 * and any child page.
 */
import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {locales, isLocale} from '@/i18n/config'
import {t} from '@/i18n/messages'
import {TopBar} from '@/components/top-bar'
import {ScrollShadowSentinel} from '@/components/scroll-shadow-sentinel'

const SITE_URL = 'https://fousa.be'

export function generateStaticParams() {
  return locales.map((locale) => ({locale}))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}): Promise<Metadata> {
  const {locale} = await params
  if (!isLocale(locale)) return {}

  return {
    title: {
      default: 'Jelle Vandebeeck',
      template: '%s · Jelle Vandebeeck',
    },
    description: t(locale, 'siteDescription'),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        nl: `${SITE_URL}/nl`,
      },
    },
    openGraph: {
      siteName: 'fousa.be',
      locale: locale === 'nl' ? 'nl_BE' : 'en_US',
      alternateLocale: locale === 'nl' ? ['en_US'] : ['nl_BE'],
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  if (!isLocale(locale)) notFound()
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-page focus:text-ink focus:px-3 focus:py-2 focus:rounded focus:outline focus:outline-2 focus:outline-accent"
      >
        {t(locale, 'skipToContent')}
      </a>
      <TopBar locale={locale} />
      <ScrollShadowSentinel />
      {children}
    </>
  )
}
