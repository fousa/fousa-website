"use client";
/**
 * Hidden "Glide" mini-game — nav entry point + fullscreen overlay shell.
 *
 * Renders a quiet "Play a game" link (with a small airplane glyph) that the
 * header styles to match the other nav items. Activating it opens a fullscreen
 * overlay portalled to <body> so it escapes the header's stacking context. The
 * overlay matches the live site theme by using the same tokens (bg / ink /
 * muted / line) the rest of the UI uses.
 *
 * Owns the overlay lifecycle (open/close, Escape, scroll lock, focus return)
 * and the end-of-flight state: when the canvas reports a landing or a storm,
 * it shows a panel with the distance flown and a "Launch again" button that
 * remounts the canvas for a fresh run. No scoreboard or persistence.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GlideCanvas } from "./GlideCanvas";
import type { EndReason } from "./engine";
import { track } from "@/lib/analytics";
import { t } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";

type EndState = { reason: EndReason; distance: number };

/** Small airplane glyph, tilted 45° as if banking away, in the accent tint. */
function PlaneIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="11"
      height="11"
      fill="currentColor"
      aria-hidden
      className="rotate-45 text-accent"
    >
      <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849Z" />
    </svg>
  );
}

export function GlideGame({
  locale,
  triggerClassName = "transition-colors hover:text-ink",
  iconOnly = false,
  withArrow = false,
  onLaunch,
}: {
  locale: Locale;
  /** Tailwind classes for the trigger so each nav can match its own styling. */
  triggerClassName?: string;
  /** Render just the airplane glyph; the label becomes screen-reader only. */
  iconOnly?: boolean;
  /** Render as a text link with the coral arrow (matches the "Hire me" link). */
  withArrow?: boolean;
  /** Called when the game opens — lets a mobile menu close itself. */
  onLaunch?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [end, setEnd] = useState<EndState | null>(null);
  // Bumping this remounts the canvas, resetting the whole simulation.
  const [runId, setRunId] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const launch = useCallback(() => {
    track("glide_open", { locale });
    setEnd(null);
    setOpen(true);
    onLaunch?.();
  }, [locale, onLaunch]);

  const close = useCallback(() => setOpen(false), []);

  const onEnd = useCallback(
    (reason: EndReason, distance: number) => setEnd({ reason, distance }),
    [],
  );

  const relaunch = useCallback(() => {
    setEnd(null);
    setRunId((n) => n + 1);
  }, []);

  // While open: lock body scroll, close on Escape, and move focus into the
  // overlay. On close, restore scroll and return focus to the trigger.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={launch}
        className={
          withArrow
            ? triggerClassName
            : `inline-flex items-center gap-1.5 ${triggerClassName}`
        }
      >
        {!withArrow && <PlaneIcon />}
        <span className={iconOnly && !withArrow ? "sr-only" : undefined}>
          {t(locale, "playGame")}
        </span>
        {withArrow && (
          <span aria-hidden className="text-accent">
            {" "}
            →
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t(locale, "playGame")}
            className="fixed inset-0 z-[100] bg-bg text-ink"
          >
            <GlideCanvas key={runId} locale={locale} onEnd={onEnd} />

            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label={t(locale, "closeRow")}
              className="absolute right-4 top-4 z-10 rounded font-mono text-xs text-muted outline-none transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {/* No Esc key on touch, so show a plain Close there. */}
              <span className="md:hidden">{t(locale, "closeRow")}</span>
              <span className="hidden md:inline">
                {t(locale, "escapeToClose")}
              </span>
            </button>

            {end && (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                <div className="w-full max-w-sm rounded-lg border border-line bg-bg px-8 py-7 text-center shadow-md">
                  <h2 className="font-display text-[22px] font-semibold tracking-[-0.01em] text-ink">
                    {t(locale, end.reason === "storm" ? "glideLost" : "glideLanded")}
                  </h2>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                    {t(locale, "glideDistanceFlown")}
                  </p>
                  <p className="mt-1 font-display text-[28px] font-bold text-ink">
                    {end.distance.toFixed(1)}{" "}
                    <span className="text-[18px] font-semibold text-muted">km</span>
                  </p>
                  <button
                    type="button"
                    autoFocus
                    onClick={relaunch}
                    className="mt-6 rounded font-display text-[14px] font-semibold text-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {t(locale, "glideLaunchAgain")}
                    <span aria-hidden className="text-accent"> →</span>
                  </button>
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
