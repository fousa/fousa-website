"use client";
/**
 * Screenshot gallery with an enlarging lightbox carousel.
 *
 * Renders the framed thumbnails as buttons; clicking one opens a fullscreen
 * overlay showing the bare image at size, with previous/next navigation, a
 * caption and a counter. Keyboard: Escape closes, ←/→ step through. Focus moves
 * into the dialog on open and returns to the originating thumbnail on close;
 * body scroll is locked while open.
 */
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { t } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import type { GalleryShot } from "@/lib/work";
import { Frame } from "./Frame";

export function Gallery({
  shots,
  locale,
}: {
  shots: GalleryShot[];
  locale: Locale;
}) {
  // null = closed; otherwise the index of the open shot.
  const [index, setIndex] = useState<number | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const many = shots.length > 1;

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
      setIndex((i) => (i === null ? i : (i + delta + shots.length) % shots.length)),
    [shots.length],
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

  const current = index !== null ? shots[index] : null;

  return (
    <div className="px-5 py-10 md:px-11">
      <div className="flex flex-wrap items-end justify-center gap-8 md:gap-10">
        {shots.map((shot, i) => (
          <div
            key={shot.key}
            className={
              shot.frame === "phone"
                ? "w-[180px]"
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

          {/* Image — stopPropagation so clicking it doesn't close the overlay. */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-full flex-col items-center"
          >
            <Image
              src={current.imageUrl}
              alt={current.caption ?? ""}
              width={current.width}
              height={current.height}
              sizes="90vw"
              className="h-auto w-auto max-h-[80vh] max-w-[90vw] rounded object-contain"
            />
            {(current.caption || many) && (
              <p className="mt-4 text-center font-mono text-[11px] text-muted">
                {current.caption}
                {current.caption && many ? " · " : ""}
                {many ? `${index! + 1} / ${shots.length}` : ""}
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
