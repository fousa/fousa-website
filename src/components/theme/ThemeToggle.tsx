"use client";
/**
 * Dark-mode toggle. Flips `.dark` on <html> and persists to localStorage.
 * Initial class is set pre-paint by the inline script in the layout.
 */
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(
    () => setDark(document.documentElement.classList.contains("dark")),
    [],
  );

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

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
