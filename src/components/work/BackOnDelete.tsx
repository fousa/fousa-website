"use client";
/**
 * Detail-page keyboard shortcut: pressing Delete/Backspace returns to the
 * previous screen (browser history), mirroring the on-page back link. Ignored
 * while typing in a field or with a modifier held, so it never eats a real
 * backspace or an OS chord. Renders nothing.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function BackOnDelete() {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // The Mac "delete" key reports as Backspace; the forward-delete key reports
      // as Delete. Accept either.
      if (e.key !== "Backspace" && e.key !== "Delete") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      )
        return;
      e.preventDefault();
      router.back();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router]);

  return null;
}
