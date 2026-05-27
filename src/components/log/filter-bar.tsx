'use client'
// Client component: chip buttons call into the filter state hook.

/**
 * Filter chip bar at the top of the log. Two filter groups: stack category
 * and engagement type. Each chip shows its option count (precomputed once
 * from the unfiltered list, so chips never go to zero).
 *
 * "All" chip is special: highlighted when no filter is active, clicking it
 * resets everything.
 *
 * Mobile: horizontal scroll. The chips don't wrap onto multiple lines —
 * keeps the filter bar a single visual element regardless of viewport.
 */
import {clsx} from 'clsx'
import {t} from '@/i18n/messages'
import type {Locale} from '@/i18n/config'
import type {
  Filters,
  StackCategory,
  Engagement,
} from '@/lib/filter-projects'

type Counts = {
  stack: Record<StackCategory, number>
  engagement: Record<Engagement, number>
}

const STACK_LABELS: Record<StackCategory, string> = {
  ios: 'iOS',
  rails: 'Rails',
  frontend: 'Frontend',
  tooling: 'Tooling',
  other: 'Other',
}

const ENGAGEMENT_KEYS: Record<Engagement, 'freelance' | 'fullTime' | 'owner' | 'internship'> = {
  freelance: 'freelance',
  'full-time': 'fullTime',
  owner: 'owner',
  internship: 'internship',
}

export function FilterBar({
  filters,
  counts,
  onToggle,
  onReset,
  hasAnyFilter,
  locale,
}: {
  filters: Filters
  counts: Counts
  onToggle: <K extends keyof Filters>(category: K, value: Filters[K][number]) => void
  onReset: () => void
  hasAnyFilter: boolean
  locale: Locale
}) {
  return (
    <div className="overflow-x-auto pb-1 -mx-2">
      <div className="flex gap-1.5 px-2 min-w-fit">
        <Chip
          label={t(locale, 'showAll')}
          isActive={!hasAnyFilter}
          onClick={onReset}
          variant="all"
        />
        {(Object.keys(STACK_LABELS) as StackCategory[]).map((cat) =>
          counts.stack[cat] > 0 ? (
            <Chip
              key={cat}
              label={`${STACK_LABELS[cat]} · ${counts.stack[cat]}`}
              isActive={filters.stack.includes(cat)}
              onClick={() => onToggle('stack', cat)}
              variant={cat}
            />
          ) : null
        )}
        {(Object.keys(ENGAGEMENT_KEYS) as Engagement[]).map((eng) =>
          counts.engagement[eng] > 0 ? (
            <Chip
              key={eng}
              label={`${t(locale, ENGAGEMENT_KEYS[eng])} · ${counts.engagement[eng]}`}
              isActive={filters.engagement.includes(eng)}
              onClick={() => onToggle('engagement', eng)}
              variant="engagement"
            />
          ) : null
        )}
      </div>
    </div>
  )
}

const VARIANT_CLASSES: Record<string, {active: string; inactive: string}> = {
  all: {
    active: 'bg-ink text-page',
    inactive: 'bg-surface text-ink-muted border border-ink/10 hover:text-ink',
  },
  ios: {
    active: 'bg-ios text-page',
    inactive: 'bg-ios-bg text-ios hover:bg-ios/10',
  },
  rails: {
    active: 'bg-rails text-page',
    inactive: 'bg-rails-bg text-rails hover:bg-rails/10',
  },
  frontend: {
    active: 'bg-frontend text-page',
    inactive: 'bg-frontend-bg text-frontend hover:bg-frontend/10',
  },
  tooling: {
    active: 'bg-tooling text-page',
    inactive: 'bg-tooling-bg text-tooling hover:bg-tooling/10',
  },
  other: {
    active: 'bg-other text-page',
    inactive: 'bg-other-bg text-other hover:bg-other/10',
  },
  engagement: {
    active: 'bg-sepia text-page',
    inactive: 'bg-frontend-bg text-sepia hover:bg-frontend/10',
  },
}

function Chip({
  label,
  isActive,
  onClick,
  variant,
}: {
  label: string
  isActive: boolean
  onClick: () => void
  variant: string
}) {
  const v = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.all
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={clsx(
        'shrink-0 rounded-full px-3 py-1 font-sans text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer',
        isActive ? v.active : v.inactive
      )}
    >
      {label}
    </button>
  )
}
