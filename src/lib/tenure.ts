/**
 * Formats an employer tenure for the career timeline.
 * Displays years only (calm), even though dates carry month precision for sorting.
 * Open-ended tenures (no endDate) render as "YYYY – now".
 */
export function formatTenure(
  startDate: string,
  endDate: string | null | undefined,
  presentLabel: string,
): string {
  const startYear = new Date(startDate).getFullYear()
  if (!endDate) return `${startYear} – ${presentLabel}`
  const endYear = new Date(endDate).getFullYear()
  return startYear === endYear ? `${startYear}` : `${startYear} – ${endYear}`
}
