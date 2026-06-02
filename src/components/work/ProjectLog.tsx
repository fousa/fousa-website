"use client";
/**
 * The homepage log: filter chip bar + project table (desktop) / cards (mobile),
 * with rows that expand in place to a summary + case-study link.
 *
 * Filter state is multi-select with three groups (stack / status / affiliation),
 * OR within a group and AND across groups.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  matchesFilters,
  type Filters,
  type Project,
  type Depth,
} from "@/lib/work";
import { forLabel, type ForLabel } from "@/lib/work-display";
import { t, type MessageKey } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import { track } from "@/lib/analytics";
import { localizedHref } from "@/lib/href";
import { StatusDot } from "./StatusDot";
import { ToolingChip } from "./ToolingChip";

// ---------------------------------------------------------------------------
// Chip definitions
// ---------------------------------------------------------------------------

type Group = keyof Filters;
type ChipDef = { group: Group; value: string; labelKey: MessageKey };

const CHIPS: ChipDef[] = [
  { group: "stack", value: "apple", labelKey: "apple" },
  { group: "stack", value: "web", labelKey: "web" },
  { group: "status", value: "active", labelKey: "active" },
  { group: "affiliation", value: "freelance", labelKey: "freelance" },
  { group: "affiliation", value: "icapps", labelKey: "icapps" },
  { group: "affiliation", value: "10to1", labelKey: "tenToOne" },
];

const EMPTY_FILTERS: Filters = { stack: [], status: [], affiliation: [] };

/** Map table column headers to i18n keys. */
const COLUMNS = ["project", "for", "stack", "role", "year", "state"] as const;

export function ProjectLog({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [open, setOpen] = useState<string | null>(null);

  const hasAnyFilter =
    filters.stack.length + filters.status.length + filters.affiliation.length > 0;

  const rows = useMemo(
    () => projects.filter((p) => matchesFilters(p, filters)),
    [projects, filters],
  );

  const toggle = (group: Group, value: string) => {
    setFilters((prev) => {
      const list = prev[group] as string[];
      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];
      return { ...prev, [group]: next } as Filters;
    });
    track("filter_select", { filter: `${group}:${value}`, locale });
  };

  const reset = () => setFilters(EMPTY_FILTERS);

  const toggleRow = (slug: string) => {
    setOpen((c) => (c === slug ? null : slug));
    if (open !== slug) {
      const p = projects.find((pr) => pr.slug === slug);
      if (p) track("project_expand", { slug, depth: p.depth, locale });
    }
  };

  return (
    <section>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-x-6 gap-y-3 border-b border-line px-5 pt-1 md:flex-nowrap md:gap-y-0 md:px-11 md:pt-0">
        {CHIPS.map(({ group, value, labelKey }) => {
          const active = (filters[group] as string[]).includes(value);
          return (
            <button
              key={`${group}:${value}`}
              onClick={() => toggle(group, value)}
              className={`-mb-px shrink-0 whitespace-nowrap border-b-[1.5px] pb-3 text-[13.5px] font-medium transition-colors cursor-pointer md:pb-[14px] ${
                active
                  ? "border-accent text-ink"
                  : "border-transparent text-faint hover:text-muted"
              }`}
            >
              {t(locale, labelKey)}
            </button>
          );
        })}
        {hasAnyFilter && (
          <button
            onClick={reset}
            className="-mb-px shrink-0 whitespace-nowrap border-b-[1.5px] border-transparent pb-3 text-[13.5px] font-medium text-faint transition-colors cursor-pointer hover:text-muted md:pb-[14px]"
          >
            {t(locale, "showAll")}
          </button>
        )}
      </div>

      {/* Desktop table */}
      <table className="hidden w-full border-collapse md:table">
        <thead>
          <tr className="text-left font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
            {COLUMNS.map((h) => (
              <th key={h} className="px-11 py-[18px] align-top font-semibold">
                {t(locale, h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-11 py-10 text-center text-muted">
                {t(locale, "noProjectsFound")}
                <br />
                <button
                  onClick={reset}
                  className="mt-2 text-[13px] text-accent underline underline-offset-2 cursor-pointer"
                >
                  {t(locale, "resetFilters")}
                </button>
              </td>
            </tr>
          ) : (
            rows.map((p) => (
              <Row
                key={p.slug}
                p={p}
                locale={locale}
                open={open === p.slug}
                onToggle={() => toggleRow(p.slug)}
              />
            ))
          )}
        </tbody>
      </table>

      {/* Mobile cards */}
      <ul className="md:hidden">
        {rows.length === 0 ? (
          <li className="px-5 py-10 text-center text-muted">
            {t(locale, "noProjectsFound")}
            <br />
            <button
              onClick={reset}
              className="mt-2 text-[13px] text-accent underline underline-offset-2 cursor-pointer"
            >
              {t(locale, "resetFilters")}
            </button>
          </li>
        ) : (
          rows.map((p) => (
            <li key={p.slug} className={`border-t border-line first:border-t-0 ${open === p.slug ? "bg-hover" : ""}`}>
              <button
                onClick={() => toggleRow(p.slug)}
                className="w-full px-5 py-[17px] text-left cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`font-display text-base font-semibold ${open === p.slug ? "text-accent" : "text-ink"}`}
                  >
                    {p.name}
                  </span>
                  {p.featureTooling && <ToolingChip label={t(locale, "toolingChip")} />}
                  <StatusDot state={p.state} locale={locale} />
                </div>
                <div className="mt-[5px] text-[12.5px] text-muted">
                  <ForLabelInline f={forLabel(p, t(locale, "personal"))} /> · {p.stack} · {p.year}
                </div>
              </button>
              {open === p.slug && (
                <div className="px-5 pb-5">
                  <div className="border-l-2 border-accent pl-4">
                    <p className="mb-[10px] text-[13px] leading-[1.6] text-muted">
                      {p.summary}
                    </p>
                    {p.tooling && (
                      <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-faint">
                        {t(locale, "toolingPrefix")} ·{" "}
                        <span className="normal-case tracking-normal text-muted">{p.tooling}</span>
                      </div>
                    )}
                    <DepthLink depth={p.depth} slug={p.slug} locale={locale} size="sm" />
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </section>
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
        onClick={onToggle}
        className={`group cursor-pointer text-[14.5px] text-text [&>td]:border-t [&>td]:border-line ${open ? "[&>td]:bg-hover" : "hover:[&>td]:bg-hover"}`}
      >
        <td className="px-11 py-5 align-top">
          <span
            className={`font-display text-base font-semibold tracking-[-0.01em] ${open ? "text-accent" : "text-ink group-hover:text-accent"}`}
          >
            {p.name}
          </span>
          {p.featureTooling && <ToolingChip label={t(locale, "toolingChip")} />}
        </td>
        <td className="px-11 py-5 align-top">
          <ForLabelInline f={forLabel(p, t(locale, "personal"))} />
        </td>
        <td className="px-11 py-5 align-top">{p.stack}</td>
        <td className="px-11 py-5 align-top">{p.role}</td>
        <td className="px-11 py-5 align-top font-mono text-[13px] text-muted">
          {p.year}
        </td>
        <td className="px-11 py-5 align-top">
          <StatusDot state={p.state} locale={locale} />
        </td>
      </tr>
      {open && (
        <tr className="[&>td]:bg-hover">
          <td colSpan={6} className="px-11 pb-7">
            <div className="max-w-[580px] border-l-2 border-accent pl-5">
              <p className="mb-[14px] text-[14.5px] leading-[1.65] text-muted">
                {p.summary}
              </p>
              {p.tooling && (
                <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.06em] text-faint">
                  {t(locale, "toolingPrefix")} ·{" "}
                  <span className="normal-case tracking-normal text-muted">{p.tooling}</span>
                </div>
              )}
              <DepthLink depth={p.depth} slug={p.slug} locale={locale} size="base" />
            </div>
          </td>
        </tr>
      )}
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
    depth === "full" ? t(locale, "readCaseStudy") : t(locale, "viewScreenshots");
  const target = depth === "full" ? "case_study" : "gallery";
  return (
    <Link
      href={localizedHref(locale, `/work/${slug}`)}
      onClick={() => track("project_open", { slug, depth: depth as "full" | "gallery", target, locale })}
      className={`font-display font-semibold text-ink ${size === "sm" ? "text-[13px]" : "text-sm"}`}
    >
      {label}
      <span className="text-accent"> →</span>
    </Link>
  );
}

/** Inline renderer for the structured for-label. */
function ForLabelInline({ f }: { f: ForLabel }) {
  if (f.kind === "via") {
    return (
      <>
        <span className="text-muted">{f.employer}</span>
        <span className="mx-1 text-faint" aria-hidden>→</span>
        <span className="text-ink">{f.client}</span>
      </>
    );
  }
  return (
    <span className={f.kind === "personal" ? "text-muted" : "text-ink"}>
      {f.text}
    </span>
  );
}
