"use client";
/**
 * Hidden "Glide" mini-game — footer entry point + fullscreen overlay shell.
 *
 * Renders a quiet "▶ Play a game" link styled like the other footer controls.
 * Activating it opens a fullscreen overlay portalled to <body> so it escapes
 * the footer's stacking context. The overlay matches the live site theme by
 * using the same tokens (bg / ink / muted / line) the rest of the UI uses.
 *
 * This step provides only the shell: open/close, Escape to close, body scroll
 * lock, and focus handling. The canvas render loop and flight model land in
 * later steps.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { track } from "@/lib/analytics";
import { t } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";

export function GlideGame({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const launch = useCallback(() => {
    track("glide_open", { locale });
    setOpen(true);
  }, [locale]);

  const close = useCallback(() => setOpen(false), []);

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
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label={t(locale, "closeRow")}
              className="absolute right-4 top-4 z-10 font-mono text-xs text-muted transition-colors hover:text-ink"
            >
              {t(locale, "escapeToClose")}
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
