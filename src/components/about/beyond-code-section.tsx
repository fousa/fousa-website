/**
 * "Beyond code" — two side-by-side cards.
 *
 * Card 1: Gliding (hardcoded). A small illustration + the persistent
 * bilingual text from messages.ts. Doesn't change often enough to live in
 * Sanity.
 *
 * Card 2: My own apps (derived). Lists every Project with engagement =
 * "owner", as name + deck rows. Sourced from the about page query so it
 * stays in sync with what's in Sanity.
 */
import Link from 'next/link'
import {pickLocale} from '@/i18n/pick-locale'
import {t} from '@/i18n/messages'
import {GliderPortrait} from './glider-portrait'
import type {Locale} from '@/i18n/config'
import type {ABOUT_QUERY_RESULT} from '@/sanity.types'

type OwnApp = NonNullable<ABOUT_QUERY_RESULT>['ownApps'][number]

export function BeyondCodeSection({
  ownApps,
  locale,
}: {
  ownApps: OwnApp[]
  locale: Locale
}) {
  return (
    <section>
      <p className="font-mono text-[9px] font-medium uppercase tracking-[2px] text-sepia mb-5">
        — {t(locale, 'beyondCode')}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlidingCard locale={locale} />
        <OwnAppsCard ownApps={ownApps} locale={locale} />
      </div>
    </section>
  )
}

function GlidingCard({locale}: {locale: Locale}) {
  return (
    <article className="bg-surface p-4 rounded-lg border border-black/5">
      <div className="aspect-video rounded overflow-hidden mb-3">
        <GliderPortrait className="size-full" />
      </div>
      <h3 className="font-sans text-[14px] font-medium text-ink mb-1">
        {t(locale, 'beyondCodeGlidingTitle')} · Keiheuvel
      </h3>
      <p className="font-sans text-[12px] text-ink-muted leading-relaxed">
        {t(locale, 'beyondCodeGlidingDescription')}
      </p>
    </article>
  )
}

function OwnAppsCard({ownApps, locale}: {ownApps: OwnApp[]; locale: Locale}) {
  return (
    <article className="bg-surface p-4 rounded-lg border border-black/5">
      <p className="font-mono text-[9px] font-medium uppercase tracking-wider text-sepia mb-3">
        {t(locale, 'beyondCodeOwnAppsTitle')}
      </p>
      <ul role="list" className="space-y-2 mb-3">
        {ownApps.slice(0, 6).map((app) => {
          const deck = pickLocale(
            typeof app.deck === 'object' ? app.deck : null,
            locale
          )
          return (
            <li key={app._id} className="flex items-baseline gap-2 flex-wrap">
              <Link
                href={`/${locale}#${app.slug}`}
                className="font-sans text-[13px] font-medium text-ink hover:text-sepia transition-colors"
              >
                {app.name}
              </Link>
              {deck && (
                <span className="font-sans text-[12px] text-ink-muted truncate">
                  — {deck}
                </span>
              )}
            </li>
          )
        })}
      </ul>
      <p className="font-sans text-[11px] text-ink-faint italic">
        {t(locale, 'beyondCodeOwnAppsCaption')}
      </p>
    </article>
  )
}
