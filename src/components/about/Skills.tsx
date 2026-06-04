"use client";
/**
 * Type-scaled skills cloud for the About page. Size encodes how many projects
 * use each skill (five quantile steps), monochrome. Tags flow as tight running
 * text — sharing a baseline — so the cloud stays dense and even. Every skill is
 * shown, each linking into the work log filtered by that skill (`?skill=<key>`).
 *
 * The display order derives from a stable key hash, so server and client render
 * identically (no hydration mismatch, no jitter).
 */
import { useMemo } from "react";
import Link from "next/link";
import { localizedHref } from "@/lib/href";
import { track } from "@/lib/analytics";
import { sizeSkills, displayOrder, type Skill } from "@/lib/skills";
import { t } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";

/**
 * Tailwind size + tone per quantile step (1 = largest/most-used … 5 = smallest).
 * Sizes step up at `md`: the desktop scale is too large for a phone, where the
 * biggest tags would otherwise crowd the screen edges past the section padding.
 */
const SIZE: Record<number, string> = {
  1: "text-[28px] md:text-[40px] text-ink",
  2: "text-[23px] md:text-[31px] text-ink",
  3: "text-[19px] md:text-[23px] text-text",
  4: "text-[15px] md:text-[17px] text-muted",
  5: "text-[13px] md:text-[14px] text-faint",
};

export function Skills({
  skills,
  locale,
}: {
  skills: Skill[];
  locale: Locale;
}) {
  const steps = useMemo(() => sizeSkills(skills), [skills]);
  const visible = useMemo(() => displayOrder(skills), [skills]);

  return (
    <div className="mt-4">
      <p className="pb-2 text-[13px] text-muted">{t(locale, "skills.sub")}</p>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-2">
        {visible.map((s) => (
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
  );
}
