/**
 * Minimal hairline device/browser frame around a screenshot. Stays in the
 * design system (1px–1.5px outline, no gloss). `frame="none"` renders the
 * bare image with a subtle border.
 */
import Image from "next/image";
import type { GalleryShot } from "@/lib/work";

export function Frame({ shot }: { shot: GalleryShot }) {
  const img = (
    <Image
      src={shot.imageUrl}
      alt={shot.caption ?? ""}
      width={shot.width}
      height={shot.height}
      className="h-full w-full object-cover"
    />
  );

  if (shot.frame === "none") {
    return (
      <figure className="overflow-hidden rounded-md border border-line">
        {img}
      </figure>
    );
  }

  if (shot.frame === "phone") {
    return (
      <figure className="w-full">
        <div className="rounded-[22px] border-[1.5px] border-ink p-[7px]">
          <div className="relative aspect-[9/19] overflow-hidden rounded-[15px] bg-surface">
            <span
              className="absolute left-1/2 top-0 h-3.5 w-[26%] -translate-x-1/2 rounded-b-[9px] bg-ink"
              aria-hidden
            />
            {img}
          </div>
        </div>
      </figure>
    );
  }

  // Both tablet orientations share the same hairline bezel and corner radius —
  // a landscape and a portrait iPad read as one device turned two ways. Only
  // the aspect ratio differs: 4:3 wide vs 3:4 tall (real iPad proportions).
  if (shot.frame === "tablet-landscape" || shot.frame === "tablet-portrait") {
    const ratio = shot.frame === "tablet-portrait" ? "aspect-[3/4]" : "aspect-[4/3]";
    return (
      <figure className="w-full">
        <div className="rounded-2xl border-[1.5px] border-ink p-[9px]">
          <div className={`${ratio} overflow-hidden rounded-md bg-surface`}>
            {img}
          </div>
        </div>
      </figure>
    );
  }

  if (shot.frame === "watch") {
    return (
      <figure className="relative w-full">
        {/* Digital crown + side button on the right edge. */}
        <span
          className="absolute right-0 top-[36%] h-5 w-[3px] -translate-y-1/2 translate-x-full rounded-r-[2px] bg-ink"
          aria-hidden
        />
        <span
          className="absolute right-0 top-[58%] h-7 w-[2px] -translate-y-1/2 translate-x-full rounded-r-[2px] bg-ink"
          aria-hidden
        />
        <div className="rounded-[34px] border-[1.5px] border-ink p-[8px]">
          <div className="aspect-[4/5] overflow-hidden rounded-[26px] bg-surface">
            {img}
          </div>
        </div>
      </figure>
    );
  }

  // browser
  return (
    <figure>
      <div className="overflow-hidden rounded-[10px] border-[1.5px] border-ink">
        <div className="flex items-center gap-1.5 border-b-[1.5px] border-ink px-3 py-[9px]">
          <span className="block h-[9px] w-[9px] rounded-full border-[1.5px] border-ink" />
          <span className="block h-[9px] w-[9px] rounded-full border-[1.5px] border-ink" />
          <span className="block h-[9px] w-[9px] rounded-full border-[1.5px] border-ink" />
        </div>
        <div className="aspect-[16/10] overflow-hidden bg-surface">{img}</div>
      </div>
    </figure>
  );
}
