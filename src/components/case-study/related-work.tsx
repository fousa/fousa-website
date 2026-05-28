/**
 * Related work strip — up to three other projects from the same employer.
 *
 * Sits between the body and the contact footer. Each card is name + deck +
 * year, linking to that project's standalone page. Falls back to silent
 * non-render when there are no siblings (personal projects without other
 * Fousa projects, or one-off employers).
 *
 * Also includes a "← Back to all projects" link below the cards regardless
 * of whether there's related work, so the visitor always has a clear path
 * back to the log.
 */
import Link from 'next/link'
import {pickLocale} from '@/i18n/pick-locale'
import {t} from '@/i18n/messages'
import type {Locale} from '@/i18n/config'
import {localizedHref} from '@/lib/href'
import type {CASE_STUDY_QUERY_RESULT} from '@/sanity.types'

type Related = NonNullable<CASE_STUDY_QUERY_RESULT>['related'][number]

export function RelatedWork({
  related,
  locale,
}: {
  related: Related[]
  locale: Locale
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-10 md:py-14 border-t border-ink/10">
      {related.length > 0 && (
        <>
          <h2 className="font-mono text-[10px] font-medium uppercase tracking-[1.5px] text-sepia mb-5">
            {t(locale, 'relatedWork')}
          </h2>
          <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {related.map((r) => {
              const deck = pickLocale(
                typeof r.deck === 'object' ? r.deck : null,
                locale
              )
              return (
                <li key={r._id}>
                  <Link
                    href={localizedHref(locale, `/${r.slug}`)}
                    className="block bg-surface p-4 rounded-lg border border-ink/10 hover:border-ink/20 transition-colors h-full"
                  >
                    <p className="font-sans text-[14px] font-medium text-ink mb-1">
                      {r.name}
                    </p>
                    {deck && (
                      <p className="font-sans text-[12px] text-ink-muted leading-relaxed mb-2 line-clamp-2">
                        {deck}
                      </p>
                    )}
                    <p className="font-mono text-[10px] text-ink-faint">{r.year}</p>
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
      <Link
        href={localizedHref(locale, '/')}
        className="font-mono text-[11px] font-medium uppercase tracking-wider text-ios hover:underline"
      >
        ← {t(locale, 'backToLog')}
      </Link>
    </section>
  )
}
