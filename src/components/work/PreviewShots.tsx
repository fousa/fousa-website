/**
 * The expanded log row's screenshot preview: up to two gallery shots the editor
 * flagged "Show in project list", each in its device `Frame`. Owns the per-device
 * width tables (`base` for mobile, `lg` for the desktop row) that keep mixed
 * frames on a common height.
 */
import { t } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import { frameLabelKey, type Frame as FrameKind, type GalleryShot } from "@/lib/work";
import { Frame } from "./Frame";

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
export function PreviewShots({
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
