/**
 * Typed analytics wrapper around Vercel Analytics `track()`.
 *
 * Centralizes event names and payload shapes so they can't drift across
 * components. Silently no-ops server-side and swallows errors in dev.
 */
import { track as vercelTrack } from "@vercel/analytics";

/** Strongly-typed event map. Keep values primitive (string/number/boolean) —
 *  Vercel Analytics serializes them as-is; objects/arrays will be coerced. */
type Events = {
  project_expand: { slug: string; depth: "none" | "gallery" | "full"; locale: string };
  project_open: {
    slug: string;
    depth: "gallery" | "full";
    target: "case_study" | "gallery";
    locale: string;
  };
  filter_select: { filter: string; locale: string };
  locale_switch: { from: string; to: string; path: string };
  theme_toggle: { to: "dark" | "light" };
  outbound_click: {
    kind: "email" | "github" | "linkedin" | "bluesky" | "instagram" | "cv";
    href: string;
    locale: string;
  };
};

/** Type-safe wrapper around vercel/analytics `track`. Silently no-ops in dev. */
export function track<K extends keyof Events>(name: K, props: Events[K]) {
  if (typeof window === "undefined") return;
  try {
    vercelTrack(name, props as Record<string, string | number | boolean>);
  } catch {}
}

export type OutboundKind = Events["outbound_click"]["kind"];
