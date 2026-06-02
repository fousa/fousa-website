"use client";
/**
 * Dark-mode toggle. Flips `.dark` on <html> and persists to localStorage.
 * Initial class is set pre-paint by the inline script in the layout.
 */
import { useSyncExternalStore, useCallback } from "react";
import { track } from "@/lib/analytics";
import { t } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";

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

export function ThemeToggle({ locale }: { locale: Locale }) {
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
      // Label states the action (what activation does), not the current mode;
      // aria-pressed carries the current on/off state for AT.
      aria-label={dark ? t(locale, "theme.switchToLight") : t(locale, "theme.switchToDark")}
      aria-pressed={dark}
      className="relative inline-flex font-mono text-xs text-muted transition-colors hover:text-ink after:absolute after:-inset-y-[14px] after:inset-x-0 after:content-['']"
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}
