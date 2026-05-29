'use client'
// Client hook: reads/writes URL search params with router.replace.

/**
 * URL-backed filter state.
 *
 * Filters live as comma-separated values in the query string:
 *   /en?stack=mobile,web&engagement=freelance
 *
 * Toggling a value:
 *   - If the value is already in the list, it's removed
 *   - Otherwise it's appended
 *   - Empty lists are removed entirely from the URL (cleaner share links)
 *
 * router.replace with {scroll: false} keeps the page from jumping to top
 * on every chip click — critical for the UX to feel snappy.
 */
import {useCallback, useMemo} from 'react'
import {useRouter, usePathname, useSearchParams} from 'next/navigation'
import type {Filters, StackCategory, Engagement} from '@/lib/filter-projects'

const VALID_STACK: readonly StackCategory[] = ['mobile', 'web', 'frontend', 'tooling', 'other']
const VALID_ENGAGEMENT: readonly Engagement[] = ['freelance', 'full-time', 'owner']

function parseList<T extends string>(value: string | null, allowed: readonly T[]): T[] {
  if (!value) return []
  return value
    .split(',')
    .map((v) => v.trim())
    .filter((v): v is T => (allowed as readonly string[]).includes(v))
}

export function useFilterState() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters: Filters = useMemo(
    () => ({
      stack: parseList(searchParams.get('stack'), VALID_STACK),
      engagement: parseList(searchParams.get('engagement'), VALID_ENGAGEMENT),
    }),
    [searchParams]
  )

  const writeUrl = useCallback(
    (next: Filters) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next.stack.length > 0) {
        params.set('stack', next.stack.join(','))
      } else {
        params.delete('stack')
      }
      if (next.engagement.length > 0) {
        params.set('engagement', next.engagement.join(','))
      } else {
        params.delete('engagement')
      }
      const qs = params.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, {scroll: false})
    },
    [pathname, router, searchParams]
  )

  /**
   * Toggle one filter value within a category.
   *
   * @param category - 'stack' | 'engagement'
   * @param value - The category-specific value (e.g. 'mobile', 'freelance')
   */
  const toggle = useCallback(
    <K extends keyof Filters>(category: K, value: Filters[K][number]) => {
      const list = filters[category] as string[]
      const exists = list.includes(value as string)
      const nextList = exists
        ? (list.filter((v) => v !== value) as Filters[K])
        : ([...list, value] as Filters[K])
      writeUrl({...filters, [category]: nextList})
    },
    [filters, writeUrl]
  )

  const reset = useCallback(() => {
    writeUrl({stack: [], engagement: []})
  }, [writeUrl])

  const hasAnyFilter = filters.stack.length > 0 || filters.engagement.length > 0

  return {filters, toggle, reset, hasAnyFilter}
}
