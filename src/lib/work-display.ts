/**
 * Display helper for the "For" column in the project log.
 *
 * Derives a single label from the employer reference and per-project client
 * field. Three shapes: "employer → client", a single name, or "Personal".
 */

export type ForLabel =
  | { kind: 'via'; employer: string; client: string }
  | { kind: 'single'; text: string }
  | { kind: 'personal'; text: string }

/**
 * Build the "For" column string from employer + client per the display rule.
 *
 * @param p - object with optional employer name and client string
 * @param personalLabel - localized fallback for projects with neither field
 * @returns structured label for rendering
 */
export function forLabel(
  p: { employer?: { name?: string | null } | null; client?: string | null },
  personalLabel = 'Personal',
): ForLabel {
  const emp = p.employer?.name?.trim() || ''
  const cli = p.client?.trim() || ''
  if (emp && cli) return { kind: 'via', employer: emp, client: cli }
  if (emp) return { kind: 'single', text: emp }
  if (cli) return { kind: 'single', text: cli }
  return { kind: 'personal', text: personalLabel }
}
