"use client";
/**
 * The homepage log: active filter pills + chip bar + project table (desktop)
 * / cards (mobile), with rows that expand in place to a summary + case-study
 * link.
 *
 * Filter state is multi-select with three groups (stack / status / affiliation),
 * OR within a group and AND across groups. Synced to URL search params so
 * selections survive reloads and are shareable.
 */
import Link from "next/link";
import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  matchesFilters,
  sortProjects,
  yearRange,
  DEFAULT_SORT,
  type Filters,
  type StackFilter,
  type StatusFilter,
  type AffiliationFilter,
  type ToolFilter,
  type Sort,
  type SortKey,
  type SortDir,
  type Project,
  type Depth,
  type EmptyStateOverride,
} from "@/lib/work";
import { ForCell } from "./ForCell";
import { t, type MessageKey } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import { track } from "@/lib/analytics";
import { localizedHref } from "@/lib/href";
import { OutboundLink } from "@/components/layout/OutboundLink";
import { StatusDot } from "./StatusDot";
import { ToolingChip } from "./ToolingChip";
import { EmptyState } from "./EmptyState";

// ---------------------------------------------------------------------------
// Chip definitions
// ---------------------------------------------------------------------------

type Group = keyof Filters;
type ChipDef = { group: Group; value: string; labelKey: MessageKey };

const CHIPS: ChipDef[] = [
  { group: "stack", value: "apple", labelKey: "apple" },
  { group: "stack", value: "web", labelKey: "web" },
  { group: "status", value: "active", labelKey: "active" },
  { group: "tool", value: "tools", labelKey: "filterTools" },
  { group: "affiliation", value: "freelance", labelKey: "freelance" },
  { group: "affiliation", value: "icapps", labelKey: "icapps" },
  { group: "affiliation", value: "10to1", labelKey: "tenToOne" },
];

/** Map table column headers to i18n keys. */
const COLUMNS = ["project", "for", "platform", "year", "state"] as const;

// ---------------------------------------------------------------------------
// URL ↔ Filters helpers
// ---------------------------------------------------------------------------

const ALLOWED_STACK: StackFilter[] = ["apple", "web"];
const ALLOWED_STATUS: StatusFilter[] = ["active"];
const ALLOWED_TOOL: ToolFilter[] = ["tools"];
const ALLOWED_AFFILIATION: AffiliationFilter[] = ["freelance", "icapps", "10to1"];

function parseList<T extends string>(raw: string | null, allowed: T[]): T[] {
  if (!raw) return [];
  return raw.split(",").filter((v): v is T => (allowed as string[]).includes(v));
}

/**
 * Parse the open-ended `skill` param: any non-empty, de-duplicated tag slugs.
 * No allowlist (skills are data-driven) — an unknown key just matches nothing.
 */
function parseSkills(raw: string | null): string[] {
  if (!raw) return [];
  return [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))];
}

function filtersFromParams(params: URLSearchParams): Filters {
  return {
    stack: parseList(params.get("stack"), ALLOWED_STACK),
    status: parseList(params.get("status"), ALLOWED_STATUS),
    tool: parseList(params.get("tool"), ALLOWED_TOOL),
    affiliation: parseList(params.get("affiliation"), ALLOWED_AFFILIATION),
    skill: parseSkills(params.get("skill")),
  };
}

function filtersToParams(f: Filters, base: URLSearchParams): URLSearchParams {
  const sp = new URLSearchParams(base);
  (["stack", "status", "tool", "affiliation", "skill"] as Group[]).forEach((g) => {
    f[g].length ? sp.set(g, f[g].join(",")) : sp.delete(g);
  });
  return sp;
}

function filterCount(f: Filters): number {
  return f.stack.length + f.status.length + f.tool.length + f.affiliation.length + f.skill.length;
}

// ---------------------------------------------------------------------------
// URL ↔ Sort helpers
// ---------------------------------------------------------------------------

const SORT_KEYS: SortKey[] = ["project", "year", "state"];

/** Parse the `?s=<key>-<dir>` param; anything invalid falls back to default. */
function parseSort(raw: string | null): Sort {
  if (!raw) return DEFAULT_SORT;
  const [key, dir] = raw.split("-");
  const validKey = (SORT_KEYS as string[]).includes(key);
  const validDir = dir === "asc" || dir === "desc";
  return validKey && validDir
    ? { key: key as SortKey, dir: dir as SortDir }
    : DEFAULT_SORT;
}

/** Flatten the active filter values across all groups into one list. */
function activeValues(f: Filters): string[] {
  return [...f.stack, ...f.status, ...f.tool, ...f.affiliation, ...f.skill];
}

/**
 * Find the override whose filter set exactly matches the active one
 * (order-independent). First match wins; null when none match.
 */
function matchOverride(
  active: string[],
  list: EmptyStateOverride[],
): EmptyStateOverride | null {
  if (active.length === 0) return null;
  const key = [...active].sort().join(",");
  return list.find((o) => [...o.filters].sort().join(",") === key) ?? null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProjectLog({
  projects,
  locale,
  overrides = [],
  skillLabels = {},
}: {
  projects: Project[];
  locale: Locale;
  overrides?: EmptyStateOverride[];
  /**
   * Display name for each arbitrary skill key (tag slug → label), so the
   * "Filtering by …" pills show "PostgreSQL", not "postgresql". A key with no
   * entry falls back to the raw slug.
   */
  skillLabels?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters = useMemo(() => filtersFromParams(params), [params]);
  const hasAnyFilter = filterCount(filters) > 0;
  const sort = useMemo(() => parseSort(params.get("s")), [params]);

  const [open, setOpen] = useState<string | null>(null);

  // Filter first, then sort the smaller list — order is identical either way.
  const rows = useMemo(
    () => sortProjects(projects.filter((p) => matchesFilters(p, filters)), sort),
    [projects, filters, sort],
  );

  // Only an empty state when filters are active — an empty list with no
  // filters means the dataset itself is empty, a different problem.
  const isEmpty = hasAnyFilter && rows.length === 0;

  // Stable identity for the current filter combo. Used as the list wrapper's
  // `key` so any filter change remounts it and replays the fade-up entrance.
  const filterKey = activeValues(filters).sort().join(",") || "all";

  // Optional hand-written copy for this exact filter combo; falls back to the
  // universal dictionary copy when no override matches.
  const override = useMemo(
    () => matchOverride(activeValues(filters), overrides),
    [filters, overrides],
  );
  const emptyHeadline = override?.headline ?? t(locale, "empty.headline");
  const emptyBody = override?.body ?? t(locale, "empty.body");

  // A zero-match combo is a meaningful signal — track it once per transition.
  useEffect(() => {
    if (!isEmpty) return;
    track("empty_state_shown", {
      filters: activeValues(filters).sort().join(","),
      locale,
    });
  }, [isEmpty]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Write a Filters object to the URL, preserving hash. */
  const writeUrl = useCallback(
    (next: Filters) => {
      const sp = filtersToParams(next, params);
      const qs = sp.toString();
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      router.replace(`${pathname}${qs ? `?${qs}` : ""}${hash}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const toggle = useCallback(
    (group: Group, value: string) => {
      const list = filters[group] as string[];
      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];
      writeUrl({ ...filters, [group]: next } as Filters);
      track("filter_select", { filter: `${group}:${value}`, locale });
    },
    [filters, writeUrl, locale],
  );

  const clearAll = useCallback(() => {
    track("clear_filters", { count: filterCount(filters), locale });
    writeUrl({ stack: [], status: [], tool: [], affiliation: [], skill: [] });
  }, [filters, writeUrl, locale]);

  /**
   * Sort a column: toggle asc⇄desc on the active column, else apply that
   * column's natural default (year → newest-first, others → ascending). The
   * `?s=` param is omitted entirely when it equals the page default.
   */
  const setSort = useCallback(
    (key: SortKey) => {
      const nextDir: SortDir =
        sort.key === key
          ? sort.dir === "asc"
            ? "desc"
            : "asc"
          : key === "year"
            ? "desc"
            : "asc";
      const sp = new URLSearchParams(params);
      if (key === DEFAULT_SORT.key && nextDir === DEFAULT_SORT.dir) sp.delete("s");
      else sp.set("s", `${key}-${nextDir}`);
      const qs = sp.toString();
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      router.replace(`${pathname}${qs ? `?${qs}` : ""}${hash}`, { scroll: false });
      track("sort_change", { key, dir: nextDir, locale });
    },
    [sort, params, pathname, router, locale],
  );

  const toggleRow = (slug: string) => {
    setOpen((c) => (c === slug ? null : slug));
    if (open !== slug) {
      const p = projects.find((pr) => pr.slug === slug);
      if (p) track("project_expand", { slug, depth: p.depth, locale });
    }
  };

  return (
    <section id="work" className="scroll-mt-20">
      {/* Chip bar */}
      <div className="flex flex-wrap gap-x-2 gap-y-2 border-b border-line px-5 pb-3 pt-3 md:flex-nowrap md:px-11">
        {CHIPS.map(({ group, value, labelKey }) => {
          const isOn = (filters[group] as string[]).includes(value);
          return (
            <button
              key={`${group}:${value}`}
              onClick={() => toggle(group, value)}
              aria-pressed={isOn}
              className={`relative inline-flex shrink-0 items-center rounded-full border px-3 py-[5px] text-[12.5px] font-medium transition-colors cursor-pointer after:absolute after:-inset-y-[9px] after:inset-x-0 after:content-[''] ${
                isOn
                  ? "border-transparent bg-accent-soft text-accent-deep font-semibold"
                  : "border-line text-muted hover:text-ink"
              }`}
            >
              {t(locale, labelKey)}
            </button>
          );
        })}
        {/* Active skill filters ride alongside the curated chips. They have no
            off-state chip of their own, so each is always "on"; clicking one
            removes it (toggles the key out of the `skill` axis). */}
        {filters.skill.map((key) => (
          <button
            key={`skill:${key}`}
            onClick={() => toggle("skill", key)}
            aria-pressed
            className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full border border-transparent bg-accent-soft px-3 py-[5px] text-[12.5px] font-semibold text-accent-deep transition-colors cursor-pointer after:absolute after:-inset-y-[9px] after:inset-x-0 after:content-['']"
          >
            {skillLabels[key] ?? key}
            <span aria-hidden>×</span>
          </button>
        ))}
        {hasAnyFilter && (
          <button
            onClick={clearAll}
            className="shrink-0 text-[12.5px] text-accent transition-colors hover:text-accent-deep cursor-pointer"
          >
            {t(locale, "clearAll")}
          </button>
        )}
      </div>

      <div key={filterKey} className="fade-up">
        {isEmpty ? (
          <div role="status" aria-live="polite" aria-atomic="true">
            <EmptyState
              headline={emptyHeadline}
              body={emptyBody}
              clearLabel={t(locale, "empty.clear")}
              showAllLabel={t(locale, "empty.showAll")}
              onClear={clearAll}
            />
          </div>
        ) : (
          <>
          {/* Desktop table */}
          <table className="hidden w-full border-collapse md:table">
            <thead>
              <tr className="text-left font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
                {COLUMNS.map((h) =>
                  (SORT_KEYS as string[]).includes(h) ? (
                    <SortHeader
                      key={h}
                      label={t(locale, h)}
                      columnKey={h as SortKey}
                      sort={sort}
                      onSort={setSort}
                    />
                  ) : (
                    <th
                      key={h}
                      scope="col"
                      className="px-11 py-[18px] align-top font-semibold"
                    >
                      {t(locale, h)}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <Row
                  key={p.slug}
                  p={p}
                  locale={locale}
                  open={open === p.slug}
                  onToggle={() => toggleRow(p.slug)}
                />
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <ul className="md:hidden">
            {rows.map((p) => (
              <li
                key={p.slug}
                className={`border-t border-line first:border-t-0 ${open === p.slug ? "bg-hover" : ""}`}
              >
                <button
                  onClick={() => toggleRow(p.slug)}
                  aria-expanded={open === p.slug}
                  className="w-full px-5 py-[17px] text-left cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`font-display text-base font-semibold ${open === p.slug ? "text-accent" : "text-ink"}`}
                    >
                      {p.name}
                    </span>
                    <StatusDot state={p.state} locale={locale} />
                  </div>
                  <div className="mt-[5px] text-[12.5px] text-muted">
                    <ForCell p={p} locale={locale} /> ·{" "}
                    {p.platforms} · <YearRangeInline p={p} />
                  </div>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-[220ms] ease-out ${open === p.slug ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <div
                      inert={open !== p.slug || undefined}
                      className={`px-5 pb-5 transition-opacity delay-[80ms] duration-150 ${open === p.slug ? "opacity-100" : "opacity-0"}`}
                    >
                      <div className="border-l-2 border-accent pl-4">
                        {p.featureTooling && (
                          <div className="mb-[10px] -ml-2">
                            <ToolingChip label={t(locale, "toolingChip")} />
                          </div>
                        )}
                        {p.role && (
                          <p className="mb-2 text-[13px] font-semibold text-ink">
                            {p.role}
                          </p>
                        )}
                        <p className="mb-[10px] text-[13px] leading-[1.6] text-muted">
                          {p.summary}
                        </p>
                        <RowActions p={p} locale={locale} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
        )}
      </div>

      {/* Filtered count */}
      {hasAnyFilter && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="px-5 py-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted md:px-11"
        >
          {t(locale, "showingOf")
            .replace("{shown}", String(rows.length))
            .replace("{total}", String(projects.length))}
        </div>
      )}
    </section>
  );
}

/**
 * Clickable desktop column header. `aria-sort` on the `<th>` carries the
 * meaning for assistive tech; the caret is decorative (active column shows
 * ↑/↓, others reveal a faint ↕ on hover to hint they're sortable).
 */
function SortHeader({
  label,
  columnKey,
  sort,
  onSort,
}: {
  label: string;
  columnKey: SortKey;
  sort: Sort;
  onSort: (key: SortKey) => void;
}) {
  const active = sort.key === columnKey;
  return (
    <th
      scope="col"
      aria-sort={
        active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
      }
      className="px-11 py-[18px] align-top font-semibold"
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className="group inline-flex cursor-pointer items-center gap-1 font-mono text-[11px] uppercase tracking-[0.09em] text-faint transition-colors hover:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
      >
        {label}
        <span
          aria-hidden
          className={`text-[10px] transition-opacity ${
            active ? "text-ink opacity-100" : "opacity-0 group-hover:opacity-40"
          }`}
        >
          {active ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

/** Single row in the desktop project table. */
function Row({
  p,
  locale,
  open,
  onToggle,
}: {
  p: Project;
  locale: Locale;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault(); // Space must not scroll the page
            onToggle();
          }
        }}
        className={`group cursor-pointer text-[14.5px] text-text [&>td]:border-t [&>td]:border-line focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${open ? "[&>td]:bg-hover" : "hover:[&>td]:bg-hover"}`}
      >
        <td className="px-11 py-5 align-top">
          <span
            className={`font-display text-base font-semibold tracking-[-0.01em] ${open ? "text-accent" : "text-ink group-hover:text-accent"}`}
          >
            {p.name}
          </span>
          {p.depth !== "none" && (
            // Coral arrow hint for navigable rows: hidden until row hover,
            // then fades + slides in 4px.
            <span
              aria-hidden
              className="ml-1.5 inline-block -translate-x-1 text-accent opacity-0 transition duration-[180ms] ease-out group-hover:translate-x-0 group-hover:opacity-100"
            >
              →
            </span>
          )}
        </td>
        <td className="px-11 py-5 align-top">
          <ForCell p={p} locale={locale} />
        </td>
        <td className="px-11 py-5 align-top">{p.platforms}</td>
        <td className="px-11 py-5 align-top font-mono text-[13px] text-muted">
          <YearRangeInline p={p} />
        </td>
        <td className="px-11 py-5 align-top">
          <StatusDot state={p.state} locale={locale} />
        </td>
      </tr>
      {/* Expansion stays mounted so the 0fr→1fr grid track can animate height;
          `inert` keeps the collapsed body out of the tab order. */}
      <tr className={open ? "[&>td]:bg-hover" : ""}>
        <td colSpan={5} className="p-0">
          <div
            className={`grid transition-[grid-template-rows] duration-[220ms] ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          >
            <div className="overflow-hidden">
              <div
                inert={!open || undefined}
                className={`px-11 pb-7 transition-opacity delay-[80ms] duration-150 ${open ? "opacity-100" : "opacity-0"}`}
              >
                <div className="max-w-[580px] border-l-2 border-accent pl-5">
                  {p.featureTooling && (
                    <div className="mb-[14px] -ml-2">
                      <ToolingChip label={t(locale, "toolingChip")} />
                    </div>
                  )}
                  {p.role && (
                    <p className="mb-3 text-[14.5px] font-semibold text-ink">
                      {p.role}
                    </p>
                  )}
                  <p className="mb-[14px] text-[14.5px] leading-[1.65] text-muted">
                    {p.summary}
                  </p>
                  <RowActions p={p} locale={locale} size="base" />
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}

/** Link that adapts label + visibility based on project depth. */
function DepthLink({
  depth,
  slug,
  locale,
  size,
}: {
  depth: Depth;
  slug: string;
  locale: Locale;
  size: "sm" | "base";
}) {
  if (depth === "none") return null;
  const label =
    depth === "full"
      ? t(locale, "readCaseStudy")
      : t(locale, "viewScreenshots");
  const target = depth === "full" ? "case_study" : "gallery";
  return (
    <Link
      href={localizedHref(locale, `/work/${slug}`)}
      onClick={() =>
        track("project_open", {
          slug,
          depth: depth as "full" | "gallery",
          target,
          locale,
        })
      }
      className={`font-display font-semibold text-ink ${size === "sm" ? "text-[13px]" : "text-sm"}`}
    >
      {label}
      <span aria-hidden className="text-accent"> →</span>
    </Link>
  );
}

/**
 * External links to surface in the log row when a project has no case study
 * (a "tool"), in priority order — source repo first, then the live URL. Empty
 * when the project carries neither.
 */
function externalActions(p: Project): { kind: "github" | "live"; href: string }[] {
  const out: { kind: "github" | "live"; href: string }[] = [];
  if (p.links?.github) out.push({ kind: "github", href: p.links.github });
  if (p.links?.live) out.push({ kind: "live", href: p.links.live });
  return out;
}

/**
 * Action label per external link kind. The label names the action, not the
 * host: a repo opens as "Source", a live URL as "Open".
 */
const LINK_LABEL: Record<"github" | "live", MessageKey> = {
  github: "linkSource",
  live: "linkOpen",
};

/**
 * The expanded row's call-to-action. Projects with their own detail page get
 * the internal case-study / gallery link; case-study-less "tool" rows instead
 * surface the external Source/Open link(s) they carry (↗ signals leaving the
 * site). A tool with no links renders nothing — the row still shows its summary.
 */
function RowActions({
  p,
  locale,
  size,
}: {
  p: Project;
  locale: Locale;
  size: "sm" | "base";
}) {
  if (p.depth !== "none") {
    return <DepthLink depth={p.depth} slug={p.slug} locale={locale} size={size} />;
  }
  const actions = externalActions(p);
  if (actions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1">
      {actions.map(({ kind, href }) => (
        <OutboundLink
          key={kind}
          kind={kind}
          href={href}
          locale={locale}
          className={`font-display font-semibold text-ink ${size === "sm" ? "text-[13px]" : "text-sm"}`}
        >
          {t(locale, LINK_LABEL[kind])}
          <span className="text-accent" aria-hidden>
            {" ↗"}
          </span>
        </OutboundLink>
      ))}
    </div>
  );
}

/**
 * The year cell: a single year, or "start → end" for a closed range, with the
 * same faint arrow the "For" column uses. Ongoing projects show just the start.
 */
function YearRangeInline({ p }: { p: Project }) {
  const { start, end } = yearRange(p);
  if (end == null) return <>{start}</>;
  return (
    <>
      {start}
      <span className="mx-1 text-faint" aria-hidden>
        →
      </span>
      {end}
    </>
  );
}

