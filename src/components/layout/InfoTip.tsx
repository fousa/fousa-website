"use client";
/**
 * Small "i" affordance that shows a short note as a popover.
 * - Desktop: opens on hover and on keyboard focus, closes when both end.
 * - Mobile: tap toggles; tap-outside or Escape closes.
 * The popover anchors above the button with a small arrow.
 */
import { useEffect, useRef, useState } from "react";

export function InfoTip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent | TouchEvent) {
      if (wrap.current && !wrap.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={wrap} className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={[
          "inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border font-mono text-[9px] leading-none transition-colors",
          open
            ? "border-ink bg-ink text-bg"
            : "border-faint text-faint hover:border-muted hover:text-muted",
        ].join(" ")}
      >
        i
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-[240px] -translate-x-1/2 rounded-md bg-ink px-3 py-2 text-left font-sans text-[12.5px] leading-[1.45] text-bg shadow-md"
        >
          {children}
          <span
            aria-hidden
            className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-ink"
          />
        </span>
      )}
    </span>
  );
}
