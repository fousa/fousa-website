"use client";
/**
 * Skills grouped by category (layout C): a mono category label on the left
 * (desktop) / above (mobile), with that category's tags on the right — sized by
 * GLOBAL usage (the most-used skill overall is biggest, regardless of category)
 * and ordered most-used first. Every tag links into the work log filtered by
 * that skill (`?skill=<key>`). Categories and their order are editor-managed in
 * Sanity; the trailing "Other" group collects tags with no category set.
 */
import Link from "next/link";
import { localizedHref } from "@/lib/href";
import { track } from "@/lib/analytics";
import { sizeSkills, groupByCategory, type Skill } from "@/lib/skills";
import { t } from "@/i18n/messages";
import { pickLocale } from "@/i18n/pick-locale";
import type { Locale } from "@/i18n/config";

/**
 * Tailwind size + tone per global quantile step (1 = largest/most-used …
 * 5 = smallest). Sizes step up at `md`: the desktop scale would crowd long
 * names (PostgreSQL, Objective-C) past the section gutter on a phone.
 */
const SIZE: Record<number, string> = {
  1: "text-[22px] md:text-[28px] text-ink",
  2: "text-[18px] md:text-[22px] text-ink",
  3: "text-[15px] md:text-[17px] text-text",
  4: "text-[13px] md:text-[14px] text-muted",
  5: "text-[12px] md:text-[12.5px] text-faint",
};

export function Skills({ skills, locale }: { skills: Skill[]; locale: Locale }) {
  const steps = sizeSkills(skills); // global, over the full set
  const groups = groupByCategory(skills);

  return (
    <div className="mt-4">
      {groups.map(({ key, title, skills: group }) => (
        <div
          key={key}
          className="grid grid-cols-1 gap-2 border-t border-line py-4 first:border-t-0 md:grid-cols-[150px_1fr] md:gap-6"
        >
          <div className="font-mono text-[11px] uppercase tracking-[0.09em] text-faint md:pt-[7px]">
            {title ? pickLocale(title, locale) ?? title.en : t(locale, "skills.cat.other")}
          </div>
          <div className="flex flex-wrap items-baseline gap-x-[14px] gap-y-[5px]">
            {group.map((s) => (
              <Link
                key={s.key}
                href={`${localizedHref(locale, "/")}?skill=${encodeURIComponent(s.key)}#work`}
                onClick={() =>
                  track("skill_click", { key: s.key, count: s.count, locale })
                }
                className={`font-display font-semibold leading-none tracking-[-0.015em] transition-colors hover:text-accent ${SIZE[steps.get(s.key) ?? 5]}`}
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
