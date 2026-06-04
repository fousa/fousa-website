"use client";
/**
 * The About "Skills" section: every technology used by ≥1 project, laid out in
 * three columns of "name … count ↗", most-used first (column one holds the
 * heaviest hitters). Each row is a real link to the homepage log filtered by
 * that skill (`/?skill=<key>#work`), so a reader can jump straight from a skill
 * to the projects that used it. Clicking one fires `skill_click`; the log's own
 * `filter_select` fires too when the filter applies — they answer different
 * questions (clicked on About vs. a filter became active).
 */
import Link from "next/link";
import { localizedHref } from "@/lib/href";
import { track } from "@/lib/analytics";
import type { Skill } from "@/lib/skills";
import type { Locale } from "@/i18n/config";

/** Split a list into three contiguous columns; the first holds the most-used. */
function toColumns(skills: Skill[]): [Skill[], Skill[], Skill[]] {
  const per = Math.ceil(skills.length / 3);
  return [
    skills.slice(0, per),
    skills.slice(per, per * 2),
    skills.slice(per * 2),
  ];
}

export function Skills({
  skills,
  locale,
}: {
  skills: Skill[];
  locale: Locale;
}) {
  if (skills.length === 0) return null;
  const columns = toColumns(skills);

  return (
    <div className="mt-6 grid grid-cols-1 gap-x-10 md:grid-cols-3">
      {columns.map((col, i) => (
        <div key={i}>
          {col.map((s) => (
            <Link
              key={s.key}
              href={`${localizedHref(locale, "/")}?skill=${encodeURIComponent(s.key)}#work`}
              onClick={() =>
                track("skill_click", { key: s.key, count: s.count, locale })
              }
              className="group flex items-baseline justify-between gap-3 border-t border-line py-[10px] first:border-t-0"
            >
              <span className="font-display text-[14.5px] font-semibold text-ink transition-colors group-hover:text-accent">
                {s.name}
              </span>
              <span className="shrink-0 font-mono text-[12px] text-muted">
                {s.count}
                <span className="text-accent" aria-hidden>
                  {" ↗"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
