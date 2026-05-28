"use client";
/**
 * Dark-mode toggle. Flips `.dark` on <html> and persists to localStorage.
 * Initial class is set pre-paint by the inline script in the layout.
 */
import { useSyncExternalStore, useCallback } from "react";
import { track } from "@/lib/analytics";

function subscribe(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    track("theme_toggle", { to: next ? "dark" : "light" });
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch { /* quota / SSR */ }
  }, []);

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="font-mono text-xs text-faint transition-colors hover:text-ink"
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}
