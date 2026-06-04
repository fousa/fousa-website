"use client";
/**
 * Skills as a numbered category index (layout B). Each category is a hairline
 * row: a mono numeral in the left gutter, then the category label and its tags.
 * Desktop lays the row out as number · label · tags; mobile keeps the number in
 * the gutter and stacks the label over its tags, both indented past the number
 * (the tags hang under the label, not under the number). Tags are uniform-size —
 * the most-used ones (global frequency tier) render in ink and the rest dim, a
 * quiet frequency hint with no size jumps. Every tag links into the work log
 * filtered by that skill (`?skill=<key>`). Categories and their order are
 * editor-managed in Sanity; the trailing "Other" group collects tags with no
 * category set.
 */
import Link from "next/link";
import { localizedHref } from "@/lib/href";
import { track } from "@/lib/analytics";
import { coreKeys, groupByCategory, type Skill } from "@/lib/skills";
import { t } from "@/i18n/messages";
import { pickLocale } from "@/i18n/pick-locale";
import type { Locale } from "@/i18n/config";

export function Skills({ skills, locale }: { skills: Skill[]; locale: Locale }) {
  const groups = groupByCategory(skills);
  const core = coreKeys(skills); // global, over the full set

  return (
    <div className="mt-4">
      {groups.map(({ key, title, skills: group }, i) => (
        <div
          key={key}
          className="grid grid-cols-[34px_1fr] items-baseline gap-x-3 border-t border-line py-4 first:border-t-0 md:gap-x-[18px]"
        >
          {/* Number stays in the left gutter on every breakpoint. */}
          <span className="font-mono text-[12px] text-faint">
            {String(i + 1).padStart(2, "0")}
          </span>

          {/* Mobile: label over tags, both indented past the number. Desktop:
              label and tags side by side in a 150px · 1fr row. */}
          <div className="md:grid md:grid-cols-[150px_1fr] md:items-baseline md:gap-x-[18px]">
            <div className="font-display text-[16px] font-semibold text-ink">
              {title
                ? pickLocale(title, locale) ?? title.en
                : t(locale, "skills.cat.other")}
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-1 md:mt-0">
              {group.map((s, j) => (
                <span key={s.key} className="inline-flex items-baseline">
                  <Link
                    href={`${localizedHref(locale, "/")}?skill=${encodeURIComponent(s.key)}#work`}
                    onClick={() =>
                      track("skill_click", { key: s.key, count: s.count, locale })
                    }
                    className={`font-display text-[14.5px] font-semibold leading-snug transition-colors hover:text-accent ${
                      core.has(s.key) ? "text-ink" : "text-muted"
                    }`}
                  >
                    {s.name}
                  </Link>
                  {j < group.length - 1 && (
                    <span className="px-1.5 text-faint" aria-hidden>
                      ·
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
