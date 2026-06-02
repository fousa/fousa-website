"use client";
/**
 * Hidden "Glide" mini-game — footer entry point + fullscreen overlay shell.
 *
 * Renders a quiet "▶ Play a game" link styled like the other footer controls.
 * Activating it opens a fullscreen overlay portalled to <body> so it escapes
 * the footer's stacking context. The overlay matches the live site theme by
 * using the same tokens (bg / ink / muted / line) the rest of the UI uses.
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

export function GlideGame({ locale }: { locale: Locale }) {
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
  }, [locale]);

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
        className="font-mono text-xs text-muted transition-colors hover:text-ink"
      >
        <span aria-hidden>▶ </span>
        {t(locale, "playGame")}
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
              className="absolute right-4 top-4 z-10 font-mono text-xs text-muted transition-colors hover:text-ink"
            >
              {t(locale, "escapeToClose")}
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
                    className="mt-6 font-display text-[14px] font-semibold text-ink"
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
