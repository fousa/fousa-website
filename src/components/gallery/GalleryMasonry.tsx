"use client";
/**
 * Cross-project gallery masonry. Items are absolutely positioned; on filter,
 * positions animate (transform) while filtered-out items fade in place, so the
 * remaining shots glide to their new columns and nothing jumps. The device
 * filter persists in `?d=`. Reduced-motion collapses the glide to instant (the
 * global safeguard in globals.css). Each shot links to its case study with
 * `?from=gallery`, so the detail back link reads "← Gallery".
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
  tv: "galleryFilterTv",
  web: "galleryFilterWeb",
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

  // Layout: position visible items into the shortest column; filtered-out items
  // keep their last transform and just fade (no reposition), so nothing jumps.
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
      <div className="flex flex-wrap gap-2 pb-6 pt-2">
        {GALLERY_FILTERS.map((f) => {
          const on = active === f;
          const count =
            f === "all"
              ? shots.length
              : shots.filter((s) => s.device === f).length;
          if (count === 0 && f !== "all") return null;
          return (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f);
                track("gallery_filter", { device: f, count });
              }}
              aria-pressed={on}
              className={`inline-flex h-[31px] items-center gap-[7px] rounded-full border px-[13px] font-display text-[12.5px] font-medium transition-colors ${
                on
                  ? "border-ink bg-ink text-bg"
                  : "border-line text-text hover:border-muted hover:text-ink"
              }`}
            >
              {t(locale, FILTER_LABEL[f])}
              <span className="font-mono text-[10px] opacity-55">{count}</span>
            </button>
          );
        })}
      </div>

      <div ref={gridRef} className={`gallery-grid ${ready ? "" : "no-anim"}`}>
        {shots.map((s, i) => (
          <Link
            key={`${s.slug}-${i}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            href={`${localizedHref(locale, `/work/${s.slug}`)}?from=gallery`}
            className="gallery-item"
            data-hidden="false"
            aria-label={t(locale, "galleryOpen").replace("{name}", s.projectName)}
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
