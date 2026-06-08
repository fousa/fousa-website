"use client";
/**
 * Detail-page keyboard shortcuts:
 *   - Delete / Backspace → previous screen (browser history), mirroring the
 *     on-page back link.
 *   - Escape → the (localized) home page — unless a modal lightbox is open, in
 *     which case Escape is left to the lightbox to close itself.
 * Both are ignored while typing in a field or with a modifier held, so they
 * never eat a real backspace or an OS chord. Renders nothing.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { localizedHref } from "@/lib/href";
import type { Locale } from "@/i18n/config";

export function DetailShortcuts({ locale }: { locale: Locale }) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      )
        return;

      // The Mac "delete" key reports as Backspace; the forward-delete key reports
      // as Delete. Either returns to the previous screen.
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        router.back();
        return;
      }

      if (e.key === "Escape") {
        // A lightbox owns Escape while open — bail so it can close instead.
        if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
        e.preventDefault();
        router.push(localizedHref(locale, "/"));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, locale]);

  return null;
}
