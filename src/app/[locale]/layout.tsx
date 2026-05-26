/**
 * Locale layout — validates the locale param and wraps every page with
 * the TopBar. The TopBar fetches Profile and Availability once per request;
 * Next.js dedupes the call when the same query is used across this layout
 * and any child page.
 */
import {notFound} from 'next/navigation'
import {locales, isLocale} from '@/i18n/config'
import {TopBar} from '@/components/top-bar'

export function generateStaticParams() {
  return locales.map((locale) => ({locale}))
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
      <TopBar locale={locale} />
      {children}
    </>
  )
}
