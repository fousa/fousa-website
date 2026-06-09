"use client";
/**
 * Cross-project gallery masonry. Items are absolutely positioned; on filter,
 * positions animate (transform) while filtered-out items fade, then drop out of
 * flow (`display: none`, see globals.css) so they don't pad the page height; the
 * remaining shots glide to their new columns and nothing jumps. The device
 * filter persists in `?d=`. Reduced-motion collapses the glide to instant (the
 * global safeguard in globals.css). Each shot links to its case study.
 */
import { useRef, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Frame } from "@/components/work/Frame";
import { localizedHref } from "@/lib/href";
import { track } from "@/lib/analytics";
import { t, type MessageKey } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import {
  GALLERY_FILTERS,
  type GalleryItem,
  type DeviceGroup,
} from "@/lib/gallery";

/** Label key per filter / device bucket (the device tag reuses the filter labels). */
const FILTER_LABEL: Record<"all" | DeviceGroup, MessageKey> = {
  all: "galleryFilterAll",
  iphone: "galleryFilterIphone",
  ipad: "galleryFilterIpad",
  watch: "galleryFilterWatch",
  tv: "galleryFilterTv",
  web: "galleryFilterWeb",
  other: "galleryFilterOther",
};

export function GalleryMasonry({
  shots,
  locale,
}: {
  shots: GalleryItem[];
  locale: Locale;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const active = (params.get("d") ?? "all") as "all" | DeviceGroup;
  const gridRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [ready, setReady] = useState(false);

  const setFilter = (d: "all" | DeviceGroup) => {
    const sp = new URLSearchParams(params);
    if (d === "all") sp.delete("d");
    else sp.set("d", d);
    router.replace(`${pathname}${sp.toString() ? `?${sp}` : ""}`, {
      scroll: false,
    });
  };

  // Layout: position visible items into the shortest column. Filtered-out items
  // are flagged hidden (CSS fades them, then drops them to display:none) and are
  // skipped here, so they neither reposition nor reserve any page height.
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const layout = () => {
      const w = grid.clientWidth;
      const cols = w < 560 ? 2 : w < 820 ? 3 : 4;
      const gap = 18;
      const colW = (w - gap * (cols - 1)) / cols;
      const colH = new Array(cols).fill(0);
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.width = `${colW}px`;
        const visible = active === "all" || shots[i].device === active;
        el.dataset.hidden = visible ? "false" : "true";
        if (!visible) return;
        const h = el.offsetHeight;
        let c = 0;
        for (let k = 1; k < cols; k++) if (colH[k] < colH[c]) c = k;
        el.style.transform = `translate(${c * (colW + gap)}px, ${colH[c]}px)`;
        colH[c] += h + gap;
      });
      grid.style.height = `${Math.max(...colH) - gap}px`;
    };
    layout();
    setReady(true);
    const ro = new ResizeObserver(layout);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [active, shots]);

  return (
    <>
      <div className="flex flex-wrap gap-x-2 gap-y-2 pb-6 pt-2">
        {GALLERY_FILTERS.filter((f): f is DeviceGroup => f !== "all").map((f) => {
          const count = shots.filter((s) => s.device === f).length;
          if (count === 0) return null;
          const on = active === f;
          // Single-select: clicking the active chip clears back to all.
          const next = on ? "all" : f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(next);
                track("gallery_filter", {
                  device: next,
                  count: next === "all" ? shots.length : count,
                });
              }}
              aria-pressed={on}
              className={`relative inline-flex shrink-0 items-center rounded-full border px-3 py-[5px] text-[12.5px] font-medium transition-colors cursor-pointer after:absolute after:-inset-y-[9px] after:inset-x-0 after:content-[''] ${
                on
                  ? "border-transparent bg-accent-soft text-accent-deep font-semibold"
                  : "border-line text-muted hover:text-ink"
              }`}
            >
              {t(locale, FILTER_LABEL[f])}
            </button>
          );
        })}
        {active !== "all" && (
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              track("gallery_filter", { device: "all", count: shots.length });
            }}
            className="shrink-0 text-[12.5px] text-accent transition-colors hover:text-accent-deep cursor-pointer"
          >
            {t(locale, "clearAll")}
          </button>
        )}
      </div>

      <div ref={gridRef} className={`gallery-grid ${ready ? "" : "no-anim"}`}>
        {shots.map((s, i) => (
          <Link
            key={`${s.slug}-${i}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            href={localizedHref(locale, `/work/${s.slug}`)}
            className="gallery-item"
            data-hidden="false"
            aria-label={t(locale, "galleryOpen").replace("{name}", s.projectName)}
            onClick={() =>
              track("project_open", {
                slug: s.slug,
                depth: s.depth,
                // The user tapped a screenshot, so the open originates from the
                // gallery (vs a "case_study" open from a log row).
                target: "gallery",
                locale,
              })
            }
          >
            <span className="gallery-inner">
              <Frame shot={s.shot} />
              <span className="mt-[7px] flex items-center justify-between">
                <span className="font-display text-[13px] font-semibold text-ink">
                  {s.projectName}
                </span>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-faint">
                  {t(locale, FILTER_LABEL[s.device])}
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
