'use client'
// Client component: presentational chip row. State lives in useFilterState.

/**
 * Filter chip bar at the top of the log. Five chips in three groups:
 * stack (Apple), status (Active), affiliation (Freelance / icapps / 10to1).
 * Each chip shows its count. "Show all" appears only when something is active.
 */
import {clsx} from 'clsx'
import {t} from '@/i18n/messages'
import type {Locale} from '@/i18n/config'
import type {Filters, FilterCounts} from '@/lib/filter-projects'

type Group = keyof Filters
type Chip = {group: Group; value: string; labelKey: Parameters<typeof t>[1]}

const CHIPS: Chip[] = [
  {group: 'stack', value: 'apple', labelKey: 'apple'},
  {group: 'status', value: 'active', labelKey: 'active'},
  {group: 'affiliation', value: 'freelance', labelKey: 'freelance'},
  {group: 'affiliation', value: 'icapps', labelKey: 'icapps'},
  {group: 'affiliation', value: '10to1', labelKey: 'tenToOne'},
]

export function FilterBar({
  filters,
  counts,
  onToggle,
  onReset,
  hasAnyFilter,
  locale,
}: {
  filters: Filters
  counts: FilterCounts
  onToggle: (group: Group, value: string) => void
  onReset: () => void
  hasAnyFilter: boolean
  locale: Locale
}) {
  return (
    <div className="overflow-x-auto pb-1 -mx-2">
      <div className="flex gap-1.5 px-2 min-w-fit">
        {CHIPS.map(({group, value, labelKey}) => {
          const active = (filters[group] as string[]).includes(value)
          const count = (counts[group] as Record<string, number>)[value] ?? 0
          return (
            <button
              key={`${group}:${value}`}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(group, value)}
              className={clsx(
                'shrink-0 rounded-full px-3 py-1 font-sans text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer',
                active
                  ? 'bg-ink text-page'
                  : 'bg-surface text-ink-muted border border-ink/10 hover:text-ink'
              )}
            >
              {t(locale, labelKey)}
              <span className="ml-1.5 opacity-50">{count}</span>
            </button>
          )
        })}
        {hasAnyFilter && (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 rounded-full px-3 py-1 font-sans text-[11px] font-medium text-ink-muted hover:text-ink transition-colors whitespace-nowrap cursor-pointer"
          >
            {t(locale, 'showAll')}
          </button>
        )}
      </div>
    </div>
  )
}
