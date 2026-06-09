"use client";
/**
 * Full-screen "Glide" mini-game shell — the body of the `/game` route.
 *
 * Renders the canvas over a fixed, full-viewport surface (covering the header
 * and footer the locale layout draws underneath) using the live site tokens
 * (bg / ink / muted / line). Owns the end-of-flight state: when the canvas
 * reports a landing or a storm it shows a panel with the distance flown and a
 * "Launch again" button that remounts the canvas for a fresh run.
 *
 * Leaving the game (the close control, or Escape) navigates to the localized
 * home page — there's no overlay to dismiss anymore, the URL drives the game.
 * `glide_open` is tracked on mount and `glide_close` (seconds played + runs
 * flown) on unmount, so navigating away closes the books on the session.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GlideCanvas } from "./GlideCanvas";
import type { EndReason } from "./engine";
import { track } from "@/lib/analytics";
import { t } from "@/i18n/messages";
import { localizedHref } from "@/lib/href";
import type { Locale } from "@/i18n/config";

type EndState = { reason: EndReason; distance: number };

export function GlidePlay({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [end, setEnd] = useState<EndState | null>(null);
  // Bumping this remounts the canvas, resetting the whole simulation.
  const [runId, setRunId] = useState(0);
  // Number of flights this session (first launch is 1, each relaunch adds one).
  const runsRef = useRef(0);
  // Read locale at unmount (the close-tracking effect) without re-keying it.
  const localeRef = useRef(locale);
  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  const leave = useCallback(
    () => router.push(localizedHref(locale, "/")),
    [router, locale],
  );

  const onEnd = useCallback(
    (reason: EndReason, distance: number) => setEnd({ reason, distance }),
    [],
  );

  const relaunch = useCallback(() => {
    runsRef.current += 1;
    setEnd(null);
    setRunId((n) => n + 1);
  }, []);

  // Session bookkeeping: lock body scroll, track open on mount and close on
  // unmount (with the seconds played and runs flown). Runs exactly once.
  useEffect(() => {
    track("glide_open", { locale: localeRef.current });
    const startedAt = Date.now();
    runsRef.current = 1;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      track("glide_close", {
        seconds: Math.round((Date.now() - startedAt) / 1000),
        runs: runsRef.current,
        locale: localeRef.current,
      });
    };
  }, []);

  // Escape leaves the game (rebinds cheaply if the locale changes).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") leave();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [leave]);

  return (
    <div className="fixed inset-0 z-[100] bg-bg text-ink">
      <GlideCanvas key={runId} locale={locale} onEnd={onEnd} />

      <button
        type="button"
        onClick={leave}
        aria-label={t(locale, "closeRow")}
        className="absolute right-4 top-4 z-10 rounded font-mono text-xs text-muted outline-none transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {/* No Esc key on touch, so show a plain Close there. */}
        <span className="md:hidden">{t(locale, "closeRow")}</span>
        <span className="hidden md:inline">{t(locale, "escapeToClose")}</span>
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
    </div>
  );
}
