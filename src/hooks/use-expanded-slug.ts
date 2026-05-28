'use client'
// Client hook: touches window.location, document, addEventListener.

/**
 * Manages the currently-expanded project row.
 *
 * Three concerns wired together:
 *   1. URL hash sync — toggles update `#slug` via history.replaceState
 *      (no history pollution, no scroll), so the URL is always shareable.
 *   2. Initial hash read — on mount, if the URL has #<slug>, that row opens
 *      and is scrolled into view (centered, smooth).
 *   3. ESC to close — only attached while a row is open, removed when not.
 *
 * State: a single nullable slug string. Null means nothing is open.
 */
import {useCallback, useEffect, useState} from 'react'

/** Read the URL hash once at module-load time (client only). */
const INITIAL_HASH =
  typeof window !== 'undefined'
    ? window.location.hash.slice(1) || null
    : null

export function useExpandedSlug() {
  const [slug, setSlug] = useState<string | null>(INITIAL_HASH)

  // 1. Scroll to the initially-expanded row after first paint
  useEffect(() => {
    const hash = INITIAL_HASH
    if (!hash) return
    requestAnimationFrame(() => {
      document
        .getElementById(`project-${hash}`)
        ?.scrollIntoView({behavior: 'smooth', block: 'center'})
    })
  }, [])

  // 2. Sync slug → hash (replaceState — no scroll, no history entry)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const target = slug ? `#${slug}` : ''
    if (window.location.hash === target) return
    const newUrl = `${window.location.pathname}${window.location.search}${target}`
    window.history.replaceState(null, '', newUrl)
  }, [slug])

  // 3. ESC key — only mounted while a row is open
  useEffect(() => {
    if (!slug) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSlug(null)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [slug])

  /**
   * Click handler for project rows. Toggle semantics:
   *   - Clicking the active row closes it
   *   - Clicking any other row opens that row (and implicitly closes the previous)
   */
  const toggle = useCallback((target: string) => {
    setSlug((current) => (current === target ? null : target))
  }, [])

  const close = useCallback(() => setSlug(null), [])

  return {slug, toggle, close}
}
