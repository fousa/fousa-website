/**
 * Formats a timeline tenure for the career list. Years only (the dates carry
 * month precision for sorting, but the UI stays calm). Open-ended tenures
 * (no endDate) render "YYYY → {present}" and signal ongoing to the caller.
 */
export function formatTenure(
  startDate: string,
  endDate: string | null | undefined,
  present: string,
): {label: string; ongoing: boolean} {
  const s = new Date(startDate).getFullYear()
  if (!endDate) return {label: `${s} → ${present}`, ongoing: true}
  const e = new Date(endDate).getFullYear()
  return {label: s === e ? `${s}` : `${s} → ${e}`, ongoing: false}
}
