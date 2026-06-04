/**
 * Display helper for the "For" column in the project log.
 *
 * Derives a single label from the employer reference and per-project client
 * field. Four shapes: "employer → client", a single name, "Tool" (a personal
 * utility), or "Personal". The "Personal"/"Tool" copy is localized at render
 * time (see ForCell), so this helper stays a pure data derivation.
 */
import type {Depth} from '@/lib/work'

export type ForLabel =
  | {kind: 'via'; employer: string; client: string}
  | {kind: 'single'; text: string}
  | {kind: 'tool'}
  | {kind: 'personal'}

/**
 * A personal utility: no case study (`depth === 'none'`) and at least one
 * external link. The employer/client check lives in forLabel; isTool only
 * covers the depth + link part so a client product never reads as a "Tool".
 *
 * @param p - object with optional depth and external links
 */
export function isTool(p: {
  depth?: Depth
  links?: {github?: string | null; live?: string | null}
}): boolean {
  return p.depth === 'none' && (!!p.links?.github || !!p.links?.live)
}

/**
 * Build the structured "For" column label per the display rule. Employer/client
 * are checked first, so a project with a relationship keeps it even when it's a
 * case-study-less project with a link — only a truly personal project can fall
 * through to "Tool" (then "Personal").
 *
 * @param p - object with optional employer name, client, depth, and links
 * @returns structured label for rendering
 */
export function forLabel(p: {
  employer?: {name?: string | null} | null
  client?: string | null
  depth?: Depth
  links?: {github?: string | null; live?: string | null}
}): ForLabel {
  const emp = p.employer?.name?.trim() || ''
  const cli = p.client?.trim() || ''
  if (emp && cli) return {kind: 'via', employer: emp, client: cli}
  if (emp) return {kind: 'single', text: emp}
  if (cli) return {kind: 'single', text: cli}
  if (isTool(p)) return {kind: 'tool'}
  return {kind: 'personal'}
}
