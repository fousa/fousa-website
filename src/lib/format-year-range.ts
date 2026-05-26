/**
 * Format a (year, endYear) pair into a human-friendly range.
 *
 * Cases:
 *   - both set, different → "2019–24"
 *   - both set, same → "2019"
 *   - start only → "2022 — now"
 *   - neither set → ""
 *
 * @param year - Start year (may be null/undefined)
 * @param endYear - End year (null/undefined means ongoing)
 * @param ongoingLabel - Suffix when the project is ongoing (default "now")
 */
export function formatYearRange(
  year: number | null | undefined,
  endYear: number | null | undefined,
  ongoingLabel = 'now'
): string {
  if (!year) return ''
  if (!endYear) return `${year} — ${ongoingLabel}`
  if (endYear === year) return String(year)
  return `${year}–${String(endYear).slice(2)}`
}
