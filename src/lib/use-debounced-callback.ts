import {useCallback, useEffect, useRef} from 'react'

/**
 * A stable callback that defers invoking `fn` until `delay` ms have passed
 * without another call. The most recent `fn` is always used, and any pending
 * timer is cleared on unmount. Purpose-built so the search input can write to
 * the URL without spamming history on every keystroke — no external dependency.
 *
 * @param fn - the function to debounce
 * @param delay - quiet period in milliseconds before `fn` runs
 * @returns a debounced version of `fn` with a stable identity
 */
export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number,
): (...args: A) => void {
  // Keep the latest fn in a ref (synced via effect, never during render) so the
  // returned callback stays stable while always calling the freshest closure.
  const fnRef = useRef(fn)
  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  return useCallback(
    (...args: A) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => fnRef.current(...args), delay)
    },
    [delay],
  )
}
