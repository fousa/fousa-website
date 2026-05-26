/**
 * Invisible sentinel element placed right after the TopBar. When it scrolls
 * out of view, a CSS class is toggled on the TopBar via IntersectionObserver,
 * adding a subtle bottom shadow. No state, no re-renders — pure DOM.
 */
'use client'

import {useEffect, useRef} from 'react'

export function ScrollShadowSentinel() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = ref.current
    if (!sentinel) return

    const header = document.querySelector('[data-topbar]')
    if (!header) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        header.classList.toggle('shadow-md', !entry.isIntersecting)
      },
      {threshold: 0}
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return <div ref={ref} className="h-0 w-full" aria-hidden="true" />
}
