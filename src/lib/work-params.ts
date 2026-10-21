/**
 * URL ↔ state helpers for the project log: parsing the filter groups, the
 * open-ended `skill` axis, and the `?s=<key>-<dir>` sort out of
 * `URLSearchParams`, and writing them back. Pure and framework-free so the
 * log component stays about rendering; `ProjectLog` is the only consumer.
 */
import {
  DEFAULT_SORT,
  type Filters,
  type StackFilter,
  type StatusFilter,
  type AffiliationFilter,
  type ToolFilter,
  type CaseStudyFilter,
  type Sort,
  type SortKey,
  type SortDir,
  type EmptyStateOverride,
} from "@/lib/work";

/** Curated chip values per group; anything else in the URL is dropped. */
const ALLOWED_STACK: StackFilter[] = ["apple", "web"];
const ALLOWED_STATUS: StatusFilter[] = ["active"];
const ALLOWED_TOOL: ToolFilter[] = ["tools"];
const ALLOWED_CASESTUDY: CaseStudyFilter[] = ["casestudy"];
const ALLOWED_AFFILIATION: AffiliationFilter[] = ["freelance", "icapps", "10to1"];

/** Keep only the comma-separated values that are in `allowed`, in URL order. */
export function parseList<T extends string>(raw: string | null, allowed: T[]): T[] {
  if (!raw) return [];
  return raw.split(",").filter((v): v is T => (allowed as string[]).includes(v));
}

/**
 * Parse the open-ended `skill` param: any non-empty, de-duplicated tag slugs.
 * No allowlist (skills are data-driven) — an unknown key just matches nothing.
 */
export function parseSkills(raw: string | null): string[] {
  if (!raw) return [];
  return [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))];
}

/** Read every filter group from the URL; unknown or empty groups are `[]`. */
export function filtersFromParams(params: URLSearchParams): Filters {
  return {
    stack: parseList(params.get("stack"), ALLOWED_STACK),
    status: parseList(params.get("status"), ALLOWED_STATUS),
    tool: parseList(params.get("tool"), ALLOWED_TOOL),
    caseStudy: parseList(params.get("caseStudy"), ALLOWED_CASESTUDY),
    affiliation: parseList(params.get("affiliation"), ALLOWED_AFFILIATION),
    skill: parseSkills(params.get("skill")),
  };
}

/**
 * Write a filter set back onto a copy of `base`: non-empty groups become a
 * comma-joined param, empty ones are removed (so the URL stays clean).
 */
export function filtersToParams(f: Filters, base: URLSearchParams): URLSearchParams {
  const sp = new URLSearchParams(base);
  (["stack", "status", "tool", "caseStudy", "affiliation", "skill"] as (keyof Filters)[]).forEach((g) => {
    if (f[g].length) sp.set(g, f[g].join(","));
    else sp.delete(g);
  });
  return sp;
}

/** Total number of active values across every group. */
export function filterCount(f: Filters): number {
  return f.stack.length + f.status.length + f.tool.length + f.caseStudy.length + f.affiliation.length + f.skill.length;
}

// ---------------------------------------------------------------------------
// URL ↔ Sort helpers
// ---------------------------------------------------------------------------

export const SORT_KEYS: SortKey[] = ["project", "year", "state"];

/** Parse the `?s=<key>-<dir>` param; anything invalid falls back to default. */
export function parseSort(raw: string | null): Sort {
  if (!raw) return DEFAULT_SORT;
  const [key, dir] = raw.split("-");
  const validKey = (SORT_KEYS as string[]).includes(key);
  const validDir = dir === "asc" || dir === "desc";
  return validKey && validDir
    ? { key: key as SortKey, dir: dir as SortDir }
    : DEFAULT_SORT;
}

/** Flatten the active filter values across all groups into one list. */
export function activeValues(f: Filters): string[] {
  return [...f.stack, ...f.status, ...f.tool, ...f.caseStudy, ...f.affiliation, ...f.skill];
}

/**
 * Find the override whose filter set exactly matches the active one
 * (order-independent). First match wins; null when none match.
 */
export function matchOverride(
  active: string[],
  list: EmptyStateOverride[],
): EmptyStateOverride | null {
  if (active.length === 0) return null;
  const key = [...active].sort().join(",");
  return list.find((o) => [...o.filters].sort().join(",") === key) ?? null;
}
