/**
 * Marks a project's depth next to its name in the log:
 *   "full"    → page-with-text-lines icon (a written case study)
 *   "gallery" → photo icon (screenshots only)
 *   "none"    → nothing
 *
 * Purely a marker; the actual link lives in the expanded row CTA. The component
 * is decoupled from the message catalog — the caller passes a `label` resolver
 * so the accessible name can be localized without importing i18n here.
 */
import type { Depth } from "@/lib/work";

export function DepthIcon({
  depth,
  label,
}: {
  depth: Depth;
  label: (key: string) => string;
}) {
  if (depth === "full") {
    return (
      <span className="depth-ico" role="img" aria-label={label("depth.caseStudy")}>
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="3.5" y="2" width="9" height="12" rx="1.2" />
          <line x1="5.6" y1="5.4" x2="10.4" y2="5.4" />
          <line x1="5.6" y1="8" x2="10.4" y2="8" />
          <line x1="5.6" y1="10.6" x2="8.6" y2="10.6" />
        </svg>
      </span>
    );
  }
  if (depth === "gallery") {
    return (
      <span className="depth-ico" role="img" aria-label={label("depth.gallery")}>
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="2.4" y="3.6" width="11.2" height="8.8" rx="1.4" />
          <circle cx="6" cy="6.6" r="1" />
          <path d="M3 11.4l3.2-3 2.4 2.3L11 8l2.6 2.6" />
        </svg>
      </span>
    );
  }
  return null;
}
