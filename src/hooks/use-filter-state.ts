'use client'
// Client hook: filter state lives in URL search params (shareable + refresh-safe).

/**
 * URL-backed filter state for the three filter groups.
 *
 * Filters live as comma-separated values in the query string:
 *   /en?stack=apple&status=active&affiliation=freelance,icapps
 *
 * router.replace with {scroll: false} keeps the page from jumping to top
 * on every chip click. Hash is preserved for deep-link expansion.
 */
import {useCallback, useMemo} from 'react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import type {
  Filters,
  StackFilter,
  StatusFilter,
  AffiliationFilter,
} from '@/lib/filter-projects'

const ALLOWED = {
  stack: ['apple'] as StackFilter[],
  status: ['active'] as StatusFilter[],
  affiliation: ['freelance', 'icapps', '10to1'] as AffiliationFilter[],
}
type Group = keyof Filters

function parse<T extends string>(value: string | null, allowed: T[]): T[] {
  if (!value) return []
  return value.split(',').filter((v): v is T => (allowed as string[]).includes(v))
}

export function useFilterState() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const filters = useMemo<Filters>(
    () => ({
      stack: parse(params.get('stack'), ALLOWED.stack),
      status: parse(params.get('status'), ALLOWED.status),
      affiliation: parse(params.get('affiliation'), ALLOWED.affiliation),
    }),
    [params]
  )

  const hasAnyFilter =
    filters.stack.length + filters.status.length + filters.affiliation.length > 0

  /** Write a Filters object back to the URL, preserving the current hash. */
  const write = useCallback(
    (next: Filters) => {
      const sp = new URLSearchParams(params.toString())
      ;(['stack', 'status', 'affiliation'] as Group[]).forEach((g) => {
        next[g].length ? sp.set(g, next[g].join(',')) : sp.delete(g)
      })
      const qs = sp.toString()
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      router.replace(`${pathname}${qs ? `?${qs}` : ''}${hash}`, {scroll: false})
    },
    [params, pathname, router]
  )

  const toggle = useCallback(
    (group: Group, value: string) => {
      const set = new Set<string>(filters[group])
      set.has(value) ? set.delete(value) : set.add(value)
      write({...filters, [group]: Array.from(set)} as Filters)
    },
    [filters, write]
  )

  const reset = useCallback(
    () => write({stack: [], status: [], affiliation: []}),
    [write]
  )

  return {filters, toggle, reset, hasAnyFilter}
}
