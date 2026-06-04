/**
 * Grouped career timeline — Freelance → Employed → Education.
 *
 * Wide hairline-ruled list, newest-first within each group. Ongoing entries
 * (no endDate) get the coral live dot. Organisation in Space Grotesk,
 * title in Inter, years in Space Mono.
 */
import {t, type MessageKey} from '@/i18n/messages'
import {pickLocale} from '@/i18n/pick-locale'
import {formatTenure} from '@/lib/tenure'
import type {Locale} from '@/i18n/config'
import type {ABOUT_QUERY_RESULT} from '@/sanity.types'

type TimelineEntry = NonNullable<ABOUT_QUERY_RESULT>['timeline'][number]

const GROUPS: {key: string; label: MessageKey}[] = [
  {key: 'freelance', label: 'timelineFreelance'},
  {key: 'employed', label: 'timelineEmployed'},
  {key: 'education', label: 'timelineEducation'},
]

export function CareerTimeline({
  timeline,
  locale,
}: {
  timeline: TimelineEntry[]
  locale: Locale
}) {
  return (
    <div className="space-y-8">
      {GROUPS.map(({key, label}) => {
        const entries = timeline.filter((e) => e.group === key)
        if (entries.length === 0) return null
        return (
          <div key={key}>
            <p className="border-t border-line pt-4 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-faint mb-4">
              {t(locale, label)}
            </p>
            <ul role="list">
              {entries.map((entry, i) => (
                <TimelineRow key={entry._id} entry={entry} locale={locale} first={i === 0} />
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

/** Single timeline row: year column + organisation / title. */
function TimelineRow({
  entry,
  locale,
  first,
}: {
  entry: TimelineEntry
  locale: Locale
  first: boolean
}) {
  const tenure = entry.startDate
    ? formatTenure(entry.startDate, entry.endDate, t(locale, 'careerPresent'))
    : {label: '', ongoing: false}

  const description = pickLocale(
    typeof entry.description === 'object' ? entry.description : null,
    locale,
  )

  return (
    <li className={`flex gap-6 py-4 ${first ? '' : 'border-t border-line'}`}>
      <span className="flex w-[96px] shrink-0 items-center font-mono text-[13px] text-muted md:w-[150px]">
        {tenure.ongoing && (
          <span className="mr-1.5 inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-accent" />
        )}
        {tenure.label}
      </span>
      <div className="min-w-0 flex-1">
        <p>
          <span className="font-display font-semibold text-ink">{entry.organisation}</span>
        </p>
        <p className="font-sans text-[14px] text-text">
          {description ?? entry.title}
        </p>
      </div>
    </li>
  )
}
