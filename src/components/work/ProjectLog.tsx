"use client";
/**
 * The homepage log: filter bar + project table (desktop) / cards (mobile),
 * with rows that expand in place to a summary + case-study link.
 */
import Link from "next/link";
import { useState } from "react";
import { FILTERS, matchesFilter, type Filter, type Project } from "@/lib/work";
import { t } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import { StatusDot } from "./StatusDot";

/** Map filter constants to i18n message keys. */
const FILTER_KEYS = {
  All: "filterAll",
  Live: "filterLive",
  Freelance: "filterFreelance",
  Personal: "filterPersonal",
  iOS: "filterIos",
  Web: "filterWeb",
} as const;

/** Map table column headers to i18n keys. */
const COLUMNS = ["project", "client", "stack", "role", "year", "status"] as const;

export function ProjectLog({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  const [filter, setFilter] = useState<Filter>("All");
  const [open, setOpen] = useState<string | null>(null);
  const rows = projects.filter((p) => matchesFilter(p, filter));
  const toggle = (s: string) => setOpen((c) => (c === s ? null : s));

  return (
    <section>
      {/* Filter bar */}
      <div className="flex gap-6 overflow-x-auto border-b border-line px-5 md:px-11">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`-mb-px shrink-0 border-b-[1.5px] pb-[14px] text-[13.5px] font-medium transition-colors ${
              filter === f
                ? "border-accent text-ink"
                : "border-transparent text-faint hover:text-muted"
            }`}
          >
            {t(locale, FILTER_KEYS[f])}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <table className="hidden w-full border-collapse md:table">
        <thead>
          <tr className="text-left font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
            {COLUMNS.map((h) => (
              <th key={h} className="px-11 py-[18px] font-semibold">
                {t(locale, h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <Row
              key={p.slug}
              p={p}
              locale={locale}
              open={open === p.slug}
              onToggle={() => toggle(p.slug)}
            />
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <ul className="md:hidden">
        {rows.map((p) => (
          <li key={p.slug} className="border-t border-line first:border-t-0">
            <button
              onClick={() => toggle(p.slug)}
              className={`w-full px-5 py-[17px] text-left ${open === p.slug ? "bg-hover" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`font-display text-base font-semibold ${open === p.slug ? "text-accent" : "text-ink"}`}
                >
                  {p.name}
                </span>
                <StatusDot status={p.status} />
              </div>
              <div className="mt-[5px] text-[12.5px] text-muted">
                {p.client} · {p.stack} · {p.year}
              </div>
            </button>
            {open === p.slug && (
              <div className="px-5 pb-5">
                <div className="border-l-2 border-accent pl-4">
                  <p className="mb-[10px] text-[13px] leading-[1.6] text-muted">
                    {p.summary}
                  </p>
                  <Link
                    href={`/${locale}/work/${p.slug}`}
                    className="font-display text-[13px] font-semibold text-ink"
                  >
                    {t(locale, "readCaseStudy")}
                    <span className="text-accent"> →</span>
                  </Link>
                </div>
              </div>
            )}
          </li>
        ))}
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
        onClick={onToggle}
        className={`group cursor-pointer text-[14.5px] text-text [&>td]:border-t [&>td]:border-line ${open ? "" : "hover:[&>td]:bg-hover"}`}
      >
        <td className="px-11 py-5">
          <span
            className={`font-display text-base font-semibold tracking-[-0.01em] ${open ? "text-accent" : "text-ink group-hover:text-accent"}`}
          >
            {p.name}
          </span>
        </td>
        <td className="px-11 py-5">{p.client}</td>
        <td className="px-11 py-5">{p.stack}</td>
        <td className="px-11 py-5">{p.role}</td>
        <td className="px-11 py-5 font-mono text-[13px] text-muted">
          {p.year}
        </td>
        <td className="px-11 py-5">
          <StatusDot status={p.status} />
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} className="px-11 pb-7">
            <div className="max-w-[580px] border-l-2 border-accent pl-5">
              <p className="mb-[14px] text-[14.5px] leading-[1.65] text-muted">
                {p.summary}
              </p>
              <Link
                href={`/${locale}/work/${p.slug}`}
                className="font-display text-sm font-semibold text-ink"
              >
                {t(locale, "readCaseStudy")}
                <span className="text-accent"> →</span>
              </Link>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
