"use client";
/**
 * The homepage log: active filter pills + chip bar + project table (desktop)
 * / cards (mobile), with rows that expand in place to a deck + case-study
 * link.
 *
 * Filter state is multi-select with three groups (stack / status / affiliation),
 * OR within a group and AND across groups. Synced to URL search params so
 * selections survive reloads and are shareable.
 */
import Link from "next/link";
import { useMemo, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  matchesFilters,
  matchesQuery,
  sortProjects,
  yearRange,
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
  type Project,
  type Depth,
  type Frame as FrameKind,
  type GalleryShot,
  type EmptyStateOverride,
  frameLabelKey,
} from "@/lib/work";
import { Frame } from "./Frame";
import { ForCell } from "./ForCell";
import { DepthIcon } from "./DepthIcon";
import { SearchChip, type SearchChipHandle } from "./SearchChip";
import { t, type MessageKey } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import { track } from "@/lib/analytics";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
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
  { group: "caseStudy", value: "casestudy", labelKey: "filterCaseStudy" },
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
const ALLOWED_CASESTUDY: CaseStudyFilter[] = ["casestudy"];
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
    caseStudy: parseList(params.get("caseStudy"), ALLOWED_CASESTUDY),
    affiliation: parseList(params.get("affiliation"), ALLOWED_AFFILIATION),
    skill: parseSkills(params.get("skill")),
  };
}

function filtersToParams(f: Filters, base: URLSearchParams): URLSearchParams {
  const sp = new URLSearchParams(base);
  (["stack", "status", "tool", "caseStudy", "affiliation", "skill"] as Group[]).forEach((g) => {
    f[g].length ? sp.set(g, f[g].join(",")) : sp.delete(g);
  });
  return sp;
}

function filterCount(f: Filters): number {
  return f.stack.length + f.status.length + f.tool.length + f.caseStudy.length + f.affiliation.length + f.skill.length;
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
  return [...f.stack, ...f.status, ...f.tool, ...f.caseStudy, ...f.affiliation, ...f.skill];
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

/**
 * Wrap case-insensitive occurrences of `q` within `text` in `<mark>`, returning
 * the text unchanged when `q` is empty. Pass plain text only — React escapes the
 * children, so this introduces no markup injection.
 */
function highlight(text: string, q: string): ReactNode {
  const query = q.trim();
  if (!query) return text;
  const parts: ReactNode[] = [];
  const lower = text.toLowerCase();
  const ql = query.toLowerCase();
  let i = 0;
  let n = 0;
  for (let idx = lower.indexOf(ql); idx !== -1; idx = lower.indexOf(ql, i)) {
    if (idx > i) parts.push(text.slice(i, idx));
    parts.push(
      <mark
        key={n++}
        className="rounded-[2px] bg-accent-soft px-[1px] text-ink"
      >
        {text.slice(idx, idx + query.length)}
      </mark>,
    );
    i = idx + query.length;
  }
  if (i < text.length) parts.push(text.slice(i));
  return parts;
}

// Session key for the expanded row. Persisted so it survives a round trip into
// a project's detail and back (incl. the browser back button), but scoped to
// the tab session and cleared on a hard reload, so a refresh resets the log.
const OPEN_KEY = "projectlog:open";

// Module-scoped, so it resets only when the bundle is re-evaluated on a fresh
// document load (typed URL or refresh) and persists across soft client
// navigations. Lets us tell "first view of this page load" (reset the log) from
// "returned via a client navigation" like back from a detail page (restore it).
let documentLoaded = false;

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
  // The committed query lives in the URL; it composes (ANDs) with the filters.
  const query = params.get("q") ?? "";
  const hasQuery = query.trim().length > 0;

  const [open, setOpen] = useState<string | null>(null);

  // Set the expanded row and mirror it into sessionStorage so it can be restored
  // after navigating into a project's detail and back. Pass null to collapse.
  const expandRow = useCallback((slug: string | null) => {
    setOpen(slug);
    try {
      if (slug) sessionStorage.setItem(OPEN_KEY, slug);
      else sessionStorage.removeItem(OPEN_KEY);
    } catch {}
  }, []);

  // On mount, either reset (first view of this document load — a refresh starts
  // fresh) or restore the previously expanded row (returned via a client
  // navigation, e.g. back from a project's detail). Runs once; `projects` is a
  // stable prop, only read to validate the stored slug.
  useEffect(() => {
    try {
      if (!documentLoaded) {
        documentLoaded = true;
        sessionStorage.removeItem(OPEN_KEY);
        return;
      }
      const saved = sessionStorage.getItem(OPEN_KEY);
      // Restoring from an external store (sessionStorage) is only possible after
      // mount — doing it in a lazy initializer would mismatch the SSR'd markup.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved && projects.some((p) => p.slug === saved)) setOpen(saved);
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Local input value for instant typing feedback; the URL (and thus the derived
  // rows) is written debounced so history isn't flooded on every keystroke. Seeded
  // once from the URL (so a shared/reloaded ?q= shows in the field); thereafter the
  // input owns its text and the explicit clear paths reset it.
  const [liveQuery, setLiveQuery] = useState(query);

  const setQuery = useDebouncedCallback((next: string) => {
    const sp = new URLSearchParams(params);
    if (next.trim()) sp.set("q", next);
    else sp.delete("q");
    const qs = sp.toString();
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    router.replace(`${pathname}${qs ? `?${qs}` : ""}${hash}`, { scroll: false });
    // Report only real searches (not the clear), logging the length — never the
    // text — and how many rows the query + current filters matched.
    const trimmed = next.trim();
    if (trimmed) {
      const results = projects.filter(
        (p) => matchesQuery(p, trimmed) && matchesFilters(p, filters),
      ).length;
      track("search_query", { length: trimmed.length, results });
    }
  }, 250);

  // Search AND filters, then sort the smaller list — order is identical either way.
  const rows = useMemo(
    () =>
      sortProjects(
        projects.filter((p) => matchesQuery(p, query) && matchesFilters(p, filters)),
        sort,
      ),
    [projects, filters, sort, query],
  );

  // Only an empty state when a search or filters are active — an empty list with
  // neither means the dataset itself is empty, a different problem.
  const isEmpty = (hasAnyFilter || hasQuery) && rows.length === 0;

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
  // A live search gets a query-specific line ("No projects match “…”."); pure
  // filter combos keep the override/dictionary copy.
  const emptyBody = hasQuery
    ? t(locale, "search.noResults").replace("{q}", query.trim())
    : (override?.body ?? t(locale, "empty.body"));
  // Label the clear action for whichever dimension is active: "Clear search" when
  // only a query narrows the list, otherwise the filter-clear copy.
  const emptyClearLabel =
    hasQuery && !hasAnyFilter
      ? t(locale, "search.clear")
      : t(locale, "empty.clear");

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

  // Clear everything that narrows the log — filters *and* the search query — and
  // reset the input. Used by the chip-bar "Clear all" and the empty-state action.
  const clearAll = useCallback(() => {
    track("clear_filters", { count: filterCount(filters), locale });
    setLiveQuery("");
    const sp = filtersToParams(
      { stack: [], status: [], tool: [], caseStudy: [], affiliation: [], skill: [] },
      params,
    );
    sp.delete("q");
    const qs = sp.toString();
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    router.replace(`${pathname}${qs ? `?${qs}` : ""}${hash}`, { scroll: false });
  }, [filters, params, pathname, router, locale]);

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
    const next = open === slug ? null : slug;
    expandRow(next);
    if (next === slug) {
      const p = projects.find((pr) => pr.slug === slug);
      if (p) track("project_expand", { slug, depth: p.depth, locale });
    }
  };

  const searchRef = useRef<SearchChipHandle>(null);

  // Walk the expanded row one step through the visible list. With no visible row
  // open (none open, or the open slug filtered out → findIndex returns -1), it
  // opens the first row; otherwise it steps one row, clamping at the ends. Shared
  // by the page-level ↑/↓ handler and the search field's ↓ (which jumps from the
  // input into the list). Keeps the selected row on screen as it walks the fold.
  const stepRow = useCallback(
    (key: "ArrowDown" | "ArrowUp") => {
      if (rows.length === 0) return;
      const i = open === null ? -1 : rows.findIndex((p) => p.slug === open);
      const next =
        i === -1
          ? rows[0]
          : key === "ArrowDown"
            ? rows[Math.min(i + 1, rows.length - 1)]
            : rows[Math.max(i - 1, 0)];

      if (next.slug !== open) {
        expandRow(next.slug);
        track("project_expand", { slug: next.slug, depth: next.depth, locale });
      }

      requestAnimationFrame(() => {
        document
          .querySelector(`[data-row-slug="${next.slug}"]`)
          ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
    },
    [rows, open, expandRow, locale],
  );

  // Page-level keyboard shortcuts (desktop): ↑/↓ walk the expanded row through
  // the visible list (opening the first when none is open), and `f` opens and
  // focuses the search field. Ignored while typing in a field or with a modifier
  // held, so it never hijacks real input or browser/OS chords.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        (el &&
          (el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            el.isContentEditable))
      )
        return;

      if (e.key === "f") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      // Escape collapses the open row. (Escape inside the search field is handled
      // there — it blurs and is excluded by the input guard above.)
      if (e.key === "Escape") {
        if (open !== null) {
          e.preventDefault();
          expandRow(null);
        }
        return;
      }

      // Enter opens the expanded project's detail (case study or screenshots),
      // but only from a non-interactive focus, so it never hijacks Enter on a
      // focused row / button / link that has its own activation.
      if (e.key === "Enter") {
        const interactive =
          el &&
          (el.tagName === "BUTTON" ||
            el.tagName === "A" ||
            el.tagName === "SELECT" ||
            el.getAttribute("role") === "button");
        if (interactive || open === null) return;
        const p = projects.find((pr) => pr.slug === open);
        if (!p || p.depth === "none") return;
        e.preventDefault();
        track("project_open", {
          slug: p.slug,
          depth: p.depth,
          target: p.depth === "full" ? "case_study" : "gallery",
          locale,
        });
        router.push(localizedHref(locale, `/work/${p.slug}`));
        return;
      }

      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (rows.length === 0) return;
      e.preventDefault();
      stepRow(e.key);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [rows, open, locale, projects, router, expandRow, stepRow]);

  // Suppress the stray focus ring that Safari/Chrome restore when the window
  // returns from the background: they re-focus whatever control held focus and
  // re-apply `:focus-visible`, so a clicked row/sort-header/chip flashes its
  // orange ring on every app switch. We clear that focus both on the way out and
  // on the way back (Safari re-focuses on return), but only when the control was
  // focused by *pointer* — keyboard focus must stay visible — and never for text
  // fields, so an in-progress search isn't dropped by an app switch.
  //
  // `focusedViaKeyboard` records how the *currently focused* element got focus
  // (set on focusin from the last input kind), so later arrow-key navigation —
  // which doesn't move DOM focus — can't mislabel a pointer-focused control.
  useEffect(() => {
    let lastInputKeyboard = false;
    let focusedViaKeyboard = false;
    const onPointerDown = () => {
      lastInputKeyboard = false;
    };
    const onKeyDown = () => {
      lastInputKeyboard = true;
    };
    const onFocusIn = () => {
      focusedViaKeyboard = lastInputKeyboard;
    };
    const clearPointerFocus = () => {
      if (focusedViaKeyboard) return;
      const el = document.activeElement;
      if (
        el instanceof HTMLElement &&
        el !== document.body &&
        el.tagName !== "INPUT" &&
        el.tagName !== "TEXTAREA" &&
        !el.isContentEditable
      ) {
        el.blur();
      }
    };
    const onWindowFocus = () => {
      // Run now and next frame: some browsers restore element focus a tick after
      // firing the window `focus` event.
      clearPointerFocus();
      requestAnimationFrame(clearPointerFocus);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("focusin", onFocusIn, true);
    window.addEventListener("blur", clearPointerFocus);
    window.addEventListener("focus", onWindowFocus);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("focusin", onFocusIn, true);
      window.removeEventListener("blur", clearPointerFocus);
      window.removeEventListener("focus", onWindowFocus);
    };
  }, []);

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
        {/* Desktop-only: the mobile cards have no inline search affordance. */}
        <span className="hidden md:contents">
          <SearchChip
            ref={searchRef}
            value={liveQuery}
            onChange={(v) => {
              setLiveQuery(v);
              setQuery(v);
            }}
            onClear={() => {
              setLiveQuery("");
              setQuery("");
            }}
            label={(k) => t(locale, k as MessageKey)}
            onArrow={(dir) => stepRow(dir)}
          />
        </span>
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
              clearLabel={emptyClearLabel}
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
                  query={query}
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
                      className={`depth-name font-display text-base font-semibold ${open === p.slug ? "text-accent" : "text-ink"}`}
                    >
                      <DepthIcon depth={p.depth} label={(k) => t(locale, k as MessageKey)} />
                      {highlight(p.name, query)}
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
                        {p.deck && (
                          <p className="mb-[10px] text-[13px] leading-[1.6] text-muted">
                            {highlight(p.deck, query)}
                          </p>
                        )}
                        <RowActions p={p} locale={locale} size="sm" />
                      </div>
                      <PreviewShots
                        shots={p.previewShots ?? []}
                        locale={locale}
                        className="mt-4 flex-wrap"
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
        )}
      </div>

      {/* Filtered / searched count */}
      {(hasAnyFilter || hasQuery) && (
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
        className="group inline-flex cursor-pointer items-center gap-1 font-mono text-[11px] uppercase tracking-[0.09em] text-faint transition-colors hover:text-muted focus-visible:outline-none"
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

// Per-frame width for the expanded-row preview thumbnails. Chosen so every
// device lands in a comparable ~110–150px height band when top-aligned, so an
// iPhone doesn't tower over an iPad sitting beside it.
const PREVIEW_WIDTH: Record<FrameKind, string> = {
  phone: "w-[76px]",
  "tablet-landscape": "w-[150px]",
  "tablet-portrait": "w-[116px]",
  tv: "w-[150px]",
  watch: "w-[92px]",
  mac: "w-[150px]",
  browser: "w-[150px]",
  other: "w-[140px]",
  none: "w-[132px]",
};

/**
 * The rendered px width of each preview thumbnail, mirroring {@link PREVIEW_WIDTH}.
 * Passed to next/image as `sizes` so the optimizer serves an appropriately small,
 * crisp candidate (at higher quality) rather than downscaling a large, re-encoded
 * source — the previews stay sharp without shipping oversized images.
 */
const PREVIEW_SIZES: Record<FrameKind, string> = {
  phone: "76px",
  "tablet-landscape": "150px",
  "tablet-portrait": "116px",
  tv: "150px",
  watch: "92px",
  mac: "150px",
  browser: "150px",
  other: "140px",
  none: "132px",
};

// Larger ("lg") preview widths for the desktop expanded row, where the pair sits
// vertically centred beside the text. Each width is the frame's `aspect-ratio`
// (see globals.css) scaled to a uniform ~158px height, so mixed devices line up
// on a common height instead of a common top edge. `none` keeps its natural
// ratio, so its width is just a sensible cap.
const PREVIEW_WIDTH_LG: Record<FrameKind, string> = {
  phone: "w-[74px]",
  "tablet-landscape": "w-[210px]",
  "tablet-portrait": "w-[118px]",
  tv: "w-[281px]",
  watch: "w-[132px]",
  mac: "w-[253px]",
  browser: "w-[253px]",
  other: "w-[237px]",
  none: "w-[180px]",
};

/** Rendered px widths for the `lg` previews, mirroring {@link PREVIEW_WIDTH_LG}. */
const PREVIEW_SIZES_LG: Record<FrameKind, string> = {
  phone: "74px",
  "tablet-landscape": "210px",
  "tablet-portrait": "118px",
  tv: "281px",
  watch: "132px",
  mac: "253px",
  browser: "253px",
  other: "237px",
  none: "180px",
};

/**
 * The expanded row's screenshot preview: the project's first two gallery shots,
 * each in its device frame. Renders nothing when the project carries no gallery.
 * Decorative beside the deck + CTA — each shot is labelled by its device for
 * assistive tech.
 *
 * `size` picks the layout: `base` (mobile) keeps the shots small and top-aligned
 * below the deck; `lg` (desktop) makes them bigger and vertically centred so they
 * read as paired with the text column to their left.
 */
function PreviewShots({
  shots,
  locale,
  className = "",
  size = "base",
}: {
  shots: GalleryShot[];
  locale: Locale;
  className?: string;
  size?: "base" | "lg";
}) {
  if (shots.length === 0) return null;
  const widths = size === "lg" ? PREVIEW_WIDTH_LG : PREVIEW_WIDTH;
  const sizes = size === "lg" ? PREVIEW_SIZES_LG : PREVIEW_SIZES;
  const layout = size === "lg" ? "items-center gap-3.5" : "items-start gap-4";
  return (
    <div className={`flex shrink-0 ${layout} ${className}`}>
      {shots.slice(0, 2).map((shot) => (
        <div
          key={shot.key}
          role="img"
          aria-label={t(locale, frameLabelKey(shot.frame))}
          className={widths[shot.frame]}
        >
          <Frame shot={shot} sizes={sizes[shot.frame]} quality={90} />
        </div>
      ))}
    </div>
  );
}

/** Single row in the desktop project table. */
function Row({
  p,
  locale,
  query,
  open,
  onToggle,
}: {
  p: Project;
  locale: Locale;
  query: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        data-row-slug={p.slug}
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
        // scroll-my keeps one extra row visible past the selection when arrow
        // navigation scrolls this row into view (block: "nearest" stops at the
        // scroll-margin edge, ~one row short of the viewport edge).
        className={`group cursor-pointer scroll-my-[80px] text-[14.5px] text-text [&>td]:border-t [&>td]:border-line focus:outline-none focus-visible:outline-none ${open ? "[&>td]:bg-hover" : "hover:[&>td]:bg-hover"}`}
      >
        <td className="px-11 py-5 align-top">
          <span
            className={`depth-name font-display text-base font-semibold tracking-[-0.01em] ${open ? "text-accent" : "text-ink group-hover:text-accent"}`}
          >
            <DepthIcon depth={p.depth} label={(k) => t(locale, k as MessageKey)} />
            {highlight(p.name, query)}
          </span>
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
                <div className="flex flex-wrap items-center gap-10">
                  {/* Text column, capped so the pair sits close to it (not flung
                      to the page edge). The coral rail marks the project region. */}
                  <div className="min-w-[280px] max-w-[460px] flex-1 border-l-2 border-accent pl-5">
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
                    {p.deck && (
                      <p className="mb-[14px] text-[14.5px] leading-[1.65] text-muted">
                        {highlight(p.deck, query)}
                      </p>
                    )}
                    <RowActions p={p} locale={locale} size="base" />
                  </div>
                  {/* The pair sits right after the text (no ml-auto), vertically
                      centred; on narrow widths flex-wrap drops it below. */}
                  <PreviewShots
                    shots={p.previewShots ?? []}
                    locale={locale}
                    size="lg"
                  />
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
 * site). A tool with no links renders nothing — the row still shows its deck.
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

