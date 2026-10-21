/**
 * Search-match highlighter for the project log: wraps every case-insensitive
 * occurrence of the query in a `<mark>` so the name and deck show where a
 * `?q=` search hit. Shared by the desktop row and the mobile card.
 */
import type { ReactNode } from "react";

/**
 * Wrap case-insensitive occurrences of `q` within `text` in `<mark>`, returning
 * the text unchanged when `q` is empty. Pass plain text only — React escapes the
 * children, so this introduces no markup injection.
 */
export function highlight(text: string, q: string): ReactNode {
  const query = q.trim();
  if (!query) return text;
  const parts: ReactNode[] = [];
  const lower = text.toLowerCase();
  const ql = query.toLowerCase();
  let i = 0;
  let n = 0;
  for (let idx = lower.indexOf(ql); idx !== -1; idx = lower.indexOf(ql, i)) {
    if (idx > i) parts.push(text.slice(i, idx));
    parts.push(
      <mark
        key={n++}
        className="rounded-[2px] bg-accent-soft px-[1px] text-ink"
      >
        {text.slice(idx, idx + query.length)}
      </mark>,
    );
    i = idx + query.length;
  }
  if (i < text.length) parts.push(text.slice(i));
  return parts;
}
