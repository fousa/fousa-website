/**
 * Marks a project's depth next to its name in the log:
 *   "full"    → document icon  (a written case study)
 *   "gallery" → stacked frames (screenshots only)
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
          <path d="M4 2h4.4L12 5.6V14H4z" />
          <path d="M8.3 2v3.4H12" />
          <line x1="5.8" y1="8.6" x2="10.2" y2="8.6" />
          <line x1="5.8" y1="10.8" x2="10.2" y2="10.8" />
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
          <rect x="2.2" y="4" width="7.5" height="6" rx="1" />
          <rect x="6.3" y="6" width="7.5" height="6" rx="1" />
        </svg>
      </span>
    );
  }
  return null;
}
