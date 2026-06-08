"use client";
/**
 * Search entry in the filter bar. Collapsed: a magnifying-glass icon button.
 * Open/active: a dark filled pill (matching an active filter chip) holding a
 * borderless input and a clear button. No placeholder, per the design.
 * Collapses back to the icon when the field is empty and loses focus.
 */
import { useRef, useState, useEffect } from "react";

/** Magnifying glass — circle lens + diagonal handle, inherits the text color. */
function SearchIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="7" cy="7" r="4.5" />
      <line x1="10.5" y1="10.5" x2="14" y2="14" />
    </svg>
  );
}

/** A simple cross, used for the clear affordance. */
function XIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="11"
      height="11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="4" y1="4" x2="12" y2="12" />
      <line x1="12" y1="4" x2="4" y2="12" />
    </svg>
  );
}

/**
 * @param value - current input text (controlled by the parent's live state)
 * @param onChange - called on every keystroke with the new value
 * @param onClear - clears the query (× button or Escape)
 * @param label - i18n lookup bound to the active locale (key → string)
 */
export function SearchChip({
  value,
  onChange,
  onClear,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  label: (k: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const active = open || value.trim().length > 0;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label("search.open")}
        aria-expanded={false}
        className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-muted hover:text-ink cursor-pointer"
      >
        <SearchIcon />
      </button>
    );
  }

  return (
    <div
      role="search"
      className="inline-flex h-[34px] min-w-[230px] shrink-0 items-center gap-2 rounded-full border border-ink bg-ink pl-[13px] pr-[7px]"
    >
      <span className="inline-flex shrink-0 text-bg/60" aria-hidden>
        <SearchIcon />
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          if (!value.trim()) setOpen(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClear();
            setOpen(false);
          }
        }}
        aria-label={label("search.label")}
        className="h-full min-w-0 flex-1 border-none bg-transparent text-[13.5px] text-bg caret-bg outline-none"
      />
      <button
        type="button"
        onClick={() => {
          onClear();
          setOpen(false);
        }}
        aria-label={label("search.clear")}
        className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-bg/70 transition hover:bg-white/15 hover:text-bg cursor-pointer"
      >
        <XIcon />
      </button>
    </div>
  );
}
