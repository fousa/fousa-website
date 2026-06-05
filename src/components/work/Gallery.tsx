"use client";
/**
 * Screenshot gallery, grouped by device, with an enlarging lightbox carousel.
 *
 * Shots are partitioned by their `frame` into device groups (iPad → iPhone →
 * Apple Watch → …) and rendered as framed thumbnails under a mono heading per
 * group (the heading is omitted when every shot is the same device). Shots are
 * reordered into that same device order, so the lightbox's prev/next traverses
 * the grid in the order it's shown.
 *
 * Clicking a thumbnail opens a fullscreen overlay showing the bare image at
 * size, with previous/next navigation, a caption and a counter. Keyboard:
 * Escape closes, ←/→ step through. Focus moves into the dialog on open and
 * returns to the originating thumbnail on close; body scroll is locked while
 * open.
 */
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import type { GalleryShot } from "@/lib/work";
import {
  DEVICE_ORDER,
  DEVICE_LABEL_KEY,
  deviceForFrame,
} from "@/lib/gallery-devices";
import { Frame } from "./Frame";

export function Gallery({
  shots,
  locale,
}: {
  shots: GalleryShot[];
  locale: Locale;
}) {
  // Reorder into device order (stable, so the editor's order is kept within a
  // group). All indices below — thumbRefs, lightbox — point into this array.
  const ordered = useMemo(
    () =>
      [...shots].sort(
        (a, b) =>
          DEVICE_ORDER.indexOf(deviceForFrame(a.frame)) -
          DEVICE_ORDER.indexOf(deviceForFrame(b.frame)),
      ),
    [shots],
  );

  // Partition into device groups, keeping each shot's index into `ordered`.
  const groups = useMemo(
    () =>
      DEVICE_ORDER.map((device) => ({
        device,
        entries: ordered
          .map((shot, index) => ({ shot, index }))
          .filter(({ shot }) => deviceForFrame(shot.frame) === device),
      })).filter((group) => group.entries.length > 0),
    [ordered],
  );
  // Only label groups when there's more than one device to distinguish.
  const showHeadings = groups.length > 1;

  // null = closed; otherwise the index of the open shot.
  const [index, setIndex] = useState<number | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const many = ordered.length > 1;

  // Only return focus to the thumbnail (which shows the focus ring) when the
  // lightbox was dismissed via the keyboard. A mouse close should leave the
  // thumbnail un-ringed, so the ring doesn't flash back on every close.
  const restoreFocus = useRef(false);
  const close = useCallback((viaKeyboard = false) => {
    restoreFocus.current = viaKeyboard;
    setIndex(null);
  }, []);
  const step = useCallback(
    (delta: number) =>
      setIndex((i) =>
        i === null ? i : (i + delta + ordered.length) % ordered.length,
      ),
    [ordered.length],
  );

  // While open: lock scroll, focus the dialog, wire Escape + arrow keys.
  // On close: return focus to the opening thumbnail only for keyboard dismissal.
  useEffect(() => {
    if (!open) return;
    const opener = index;
    const thumbs = thumbRefs.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (opener !== null && restoreFocus.current) thumbs[opener]?.focus();
      restoreFocus.current = false;
    };
  }, [open, index, close, step]);

  const current = index !== null ? ordered[index] : null;

  return (
    <div className="px-5 py-10 md:px-11">
      <div className="flex flex-col gap-12 md:gap-16">
        {groups.map(({ device, entries }) => (
          <section key={device} aria-label={t(locale, DEVICE_LABEL_KEY[device])}>
            {showHeadings && (
              <h3 className="mb-6 font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-faint">
                {t(locale, DEVICE_LABEL_KEY[device])}
              </h3>
            )}
            <div className="flex flex-wrap items-end justify-center gap-8 md:gap-10">
              {entries.map(({ shot, index: i }) => (
                <div
                  key={shot.key}
                  className={
                    shot.frame === "phone"
                      ? "w-[180px]"
                      : shot.frame === "watch"
                        ? "w-[150px]"
                        : shot.frame === "tablet"
                          ? "w-[280px]"
                          : "w-full max-w-[560px]"
                  }
                >
                  <button
                    ref={(el) => {
                      thumbRefs.current[i] = el;
                    }}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={t(locale, "galleryEnlarge")}
                    className="block w-full cursor-zoom-in rounded-md ring-offset-2 ring-offset-bg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Frame shot={shot} />
                  </button>
                  {shot.caption && (
                    <p className="mt-2 text-center font-mono text-[11px] text-muted">
                      {shot.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {current && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={current.caption ?? t(locale, "galleryEnlarge")}
          tabIndex={-1}
          onClick={(e) => close(e.detail === 0)}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-bg/95 px-5 py-16 backdrop-blur-sm focus:outline-none md:px-16"
        >
          {/* Close */}
          <button
            type="button"
            onClick={(e) => close(e.detail === 0)}
            aria-label={t(locale, "lightboxClose")}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:right-8 md:top-8"
          >
            <span aria-hidden>×</span>
          </button>

          {/* Prev */}
          {many && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              aria-label={t(locale, "lightboxPrev")}
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-3xl leading-none text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:left-6"
            >
              <span aria-hidden>‹</span>
            </button>
          )}

          {/* Image — stopPropagation so clicking it doesn't close the overlay.
              The image fills a flex-1 box and uses object-contain, so the whole
              shot scales to fit the space left between the padding and caption. */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full flex-col items-center justify-center gap-4"
          >
            <div className="relative min-h-0 w-full flex-1">
              <Image
                src={current.imageUrl}
                alt={current.caption ?? ""}
                fill
                sizes="90vw"
                className="rounded object-contain"
              />
            </div>
            {(current.caption || many) && (
              <p className="shrink-0 text-center font-mono text-[11px] text-muted">
                {current.caption}
                {current.caption && many ? " · " : ""}
                {many ? `${index! + 1} / ${ordered.length}` : ""}
              </p>
            )}
          </div>

          {/* Next */}
          {many && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              aria-label={t(locale, "lightboxNext")}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-3xl leading-none text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:right-6"
            >
              <span aria-hidden>›</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
