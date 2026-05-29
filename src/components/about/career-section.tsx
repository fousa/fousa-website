/**
 * Career timeline section — sepia label, each employer as a clickable row.
 *
 * Each row links to the homepage filtered by that employer's dominant stack
 * category (e.g. icapps → /en?stack=ios). Employers with no projects get
 * a plain non-link row.
 *
 * Engagement type renders as a small monospace badge on the right (FREELANCE,
 * FULL-TIME, OWNER, INTERNSHIP). Sepia for freelance/owner; muted for the rest.
 *
 * "All projects in the log →" header link sits on the right of the section title,
 * giving the visitor a back-to-the-homepage shortcut.
 */
import Link from 'next/link'
import {clsx} from 'clsx'
import {t} from '@/i18n/messages'
import {pickLocale} from '@/i18n/pick-locale'
import {formatTenure} from '@/lib/tenure'
import type {Locale} from '@/i18n/config'
import type {ABOUT_QUERY_RESULT} from '@/sanity.types'
import type {StackCategory} from '@/lib/filter-projects'

type Employer = NonNullable<ABOUT_QUERY_RESULT>['employers'][number]

const ENGAGEMENT_LABEL: Record<string, {label: string; tone: 'sepia' | 'muted'}> = {
  freelance: {label: 'FREELANCE', tone: 'sepia'},
  'full-time': {label: 'FULL-TIME', tone: 'muted'},
  owner: {label: 'OWNER', tone: 'sepia'},
  internship: {label: 'INTERNSHIP', tone: 'muted'},
  holiday: {label: 'HOLIDAY', tone: 'muted'},
  education: {label: 'EDUCATION', tone: 'muted'},
}

export function CareerSection({
  employers,
  employerStackCategories,
  locale,
}: {
  employers: Employer[]
  employerStackCategories: Map<string, StackCategory | null>
  locale: Locale
}) {
  const pinnedEmployers = employers.filter((e) => e.pinned)
  const chronologicalEmployers = employers.filter((e) => !e.pinned)

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4 mb-5">
        <p className="font-mono text-[9px] font-medium uppercase tracking-[2px] text-sepia">
          — {t(locale, 'career')}
        </p>
        <Link
          href={`/${locale}`}
          className="font-mono text-[10px] font-medium uppercase tracking-wider text-ios hover:underline"
        >
          ↗ {t(locale, 'allProjectsInLog')}
        </Link>
      </div>
      <ul role="list" className="divide-y divide-black/5">
        {pinnedEmployers.map((employer) => (
          <li key={employer._id}>
            <p className="font-mono text-[9px] font-medium uppercase tracking-[2px] text-sepia mb-2 pt-3">
              {t(locale, 'careerOngoing')}
            </p>
            <CareerRow
              employer={employer}
              stackCategory={employerStackCategories.get(employer._id) ?? null}
              locale={locale}
            />
          </li>
        ))}
        {pinnedEmployers.length > 0 && (
          <li className="border-t border-line" aria-hidden />
        )}
        {chronologicalEmployers.map((employer) => (
          <CareerRow
            key={employer._id}
            employer={employer}
            stackCategory={employerStackCategories.get(employer._id) ?? null}
            locale={locale}
          />
        ))}
      </ul>
    </section>
  )
}

function CareerRow({
  employer,
  stackCategory,
  locale,
}: {
  employer: Employer
  stackCategory: StackCategory | null
  locale: Locale
}) {
  const tenure = employer.startDate
    ? formatTenure(employer.startDate, employer.endDate, t(locale, 'careerPresent'))
    : ''

  const engagement = employer.engagement ? ENGAGEMENT_LABEL[employer.engagement] : null
  const description = pickLocale(
    typeof employer.description === 'object' ? employer.description : null,
    locale,
  )

  const rowContent = (
    <>
      <span className="font-mono text-[12px] font-medium text-ink-muted shrink-0 w-[80px]">
        {tenure}
      </span>
      <span className="font-sans text-[13px] text-ink flex-1 truncate">
        <span className="font-medium">{employer.name}</span>
        {employer.role && <span className="text-ink-muted"> · {employer.role}</span>}
        {description && (
          <span className="block text-[12px] text-ink-muted mt-0.5">{description}</span>
        )}
      </span>
      {engagement && (
        <span
          className={clsx(
            'font-mono text-[9px] font-medium uppercase tracking-wider shrink-0',
            engagement.tone === 'sepia' ? 'text-sepia' : 'text-ink-muted'
          )}
        >
          {engagement.label}
        </span>
      )}
    </>
  )

  if (!stackCategory) {
    return (
      <li className="flex items-center gap-4 py-3">{rowContent}</li>
    )
  }

  return (
    <li>
      <Link
        href={`/${locale}?stack=${stackCategory}`}
        className="flex items-center gap-4 py-3 -mx-2 px-2 rounded transition-colors hover:bg-surface-warm/40 group"
        aria-label={`${t(locale, 'seeProjectsFor')} ${employer.name}`}
      >
        {rowContent}
        <span
          className="font-mono text-[12px] text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          aria-hidden
        >
          →
        </span>
      </Link>
    </li>
  )
}
