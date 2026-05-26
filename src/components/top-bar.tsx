/**
 * Top bar shown on every page. Server component — fetches the Profile and
 * Availability singletons once and passes them down. The LocaleSwitcher and
 * (later) the row-expand hooks are the only client islands.
 *
 * Layout: name + role on the left, locale switcher + about link + availability
 * pill on the right. Stays sticky to top on scroll — Phase 3a doesn't enable
 * sticky yet (no scroll context to test against), but the styles are ready.
 */
import Link from 'next/link'
import {fetchSanity} from '@/sanity/fetch'
import {PROFILE_QUERY} from '@/sanity/queries/profile'
import {AVAILABILITY_QUERY} from '@/sanity/queries/availability'
import {pickLocale} from '@/i18n/pick-locale'
import {t} from '@/i18n/messages'
import type {Locale} from '@/i18n/config'
import type {PROFILE_QUERY_RESULT, AVAILABILITY_QUERY_RESULT} from '@/sanity.types'
import {AvailabilityPill} from './availability-pill'
import {LocaleSwitcher} from './locale-switcher'

export async function TopBar({locale}: {locale: Locale}) {
  const [profile, availability] = await Promise.all([
    fetchSanity<PROFILE_QUERY_RESULT>(PROFILE_QUERY),
    fetchSanity<AVAILABILITY_QUERY_RESULT>(AVAILABILITY_QUERY),
  ])

  return (
    <header data-topbar className="sticky top-0 z-40 border-b border-black/5 bg-page transition-shadow duration-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <Link href={`/${locale}`} className="flex flex-col leading-tight">
          <span className="font-sans text-[16px] font-medium text-ink">
            {profile?.name ?? 'Jelle Vandebeeck'}
          </span>
          <span className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            {pickLocale(profile?.tagline, locale) ?? ''}
            {profile?.location && <span> · {profile.location}</span>}
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <LocaleSwitcher currentLocale={locale} />
          <Link
            href={`/${locale}/about`}
            className="font-mono text-[11px] uppercase tracking-wider text-ink-muted hover:text-ink transition-colors"
          >
            {t(locale, 'about')}
          </Link>
          <AvailabilityPill
            availability={availability}
            locale={locale}
            email={profile?.email ?? null}
          />
        </div>
      </div>
    </header>
  )
}
