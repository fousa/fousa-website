/**
 * Display helper for the "For" column in the project log.
 *
 * Derives a single label from the employer reference and per-project client
 * field. Four shapes: "employer → client", a single name, "Tool" (a personal
 * utility), or "Personal". The "Personal"/"Tool" copy is localized at render
 * time (see ForCell), so this helper stays a pure data derivation.
 */

export type ForLabel =
  | {kind: 'via'; employer: string; client: string}
  | {kind: 'single'; text: string}
  | {kind: 'tool'}
  | {kind: 'personal'}

/**
 * Build the structured "For" column label per the display rule. Employer/client
 * are checked first, so a project with a relationship keeps that label even when
 * `isTool` is set — only a truly personal project falls through to "Tool" (when
 * the manual flag is on) or "Personal".
 *
 * `isTool` is a manual Studio flag, not derived: too many case-study-less
 * personal projects carry a link without being a "tool", so the call is the
 * editor's.
 *
 * @param p - object with optional employer name, client, and the isTool flag
 * @returns structured label for rendering
 */
export function forLabel(p: {
  employer?: {name?: string | null} | null
  client?: string | null
  isTool?: boolean | null
}): ForLabel {
  const emp = p.employer?.name?.trim() || ''
  const cli = p.client?.trim() || ''
  if (emp && cli) return {kind: 'via', employer: emp, client: cli}
  if (emp) return {kind: 'single', text: emp}
  if (cli) return {kind: 'single', text: cli}
  if (p.isTool) return {kind: 'tool'}
  return {kind: 'personal'}
}

/**
 * A project that reads as "Tool" in the For column: a personal utility with no
 * employer or client. Defined via `forLabel` so the filter and the label can
 * never drift — both answer the same single question.
 *
 * @param p - same shape forLabel takes (employer name, client, isTool flag)
 * @returns true when the project's For label is the "Tool" kind
 */
export function isToolProject(p: Parameters<typeof forLabel>[0]): boolean {
  return forLabel(p).kind === 'tool'
}
