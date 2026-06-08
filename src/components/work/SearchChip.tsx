"use client";
/**
 * Search entry in the filter bar. Collapsed: a magnifying-glass icon button.
 * Open/active: a dark filled pill (matching an active filter chip) holding a
 * borderless input and a clear button. No placeholder, per the design.
 * Collapses back to the icon when the field is empty and loses focus. A single
 * container morphs between the two states (width + fill animate) so the
 * expansion reads as one motion rather than a swap.
 */
import { useImperativeHandle, useRef, useState, useEffect, type Ref } from "react";

/** Imperative handle so a parent (e.g. the `f` shortcut) can open + focus it. */
export type SearchChipHandle = { focus: () => void };

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
 * @param ref - exposes `focus()` to open the chip and focus its input
 */
export function SearchChip({
  value,
  onChange,
  onClear,
  label,
  ref,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  label: (k: string) => string;
  ref?: Ref<SearchChipHandle>;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const active = open || value.trim().length > 0;

  // Opening flips to the active branch; the effect below focuses the input once
  // it mounts. When already active, focus it directly (state won't change, so
  // the effect wouldn't re-run).
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        setOpen(true);
        inputRef.current?.focus();
      },
    }),
    [],
  );

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // A single morphing container so the icon → pill change animates its width and
  // fill rather than swapping two separate elements instantly. The input and
  // clear button mount only when active; the container grows to reveal them
  // (overflow-hidden keeps them clipped mid-animation).
  return (
    <div
      role={active ? "search" : undefined}
      className={`group inline-flex h-[34px] shrink-0 items-center overflow-hidden rounded-full border transition-all duration-200 ease-out motion-reduce:transition-none ${
        active
          ? "w-[230px] gap-2 border-ink bg-ink pl-[13px] pr-[7px]"
          : "w-[34px] justify-center border-line hover:border-muted"
      }`}
    >
      {!active ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={label("search.open")}
          aria-expanded={false}
          className="inline-flex h-full w-full items-center justify-center text-muted transition-colors group-hover:text-ink cursor-pointer"
        >
          <SearchIcon />
        </button>
      ) : (
        <>
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
              // Escape keeps the query but drops focus out of the field
              // (collapsing to the icon only if it's empty, via onBlur), so the
              // page's ↑/↓ row navigation can take over.
              if (e.key === "Escape") {
                e.stopPropagation();
                inputRef.current?.blur();
              }
            }}
            aria-label={label("search.label")}
            className="h-full min-w-0 flex-1 border-none bg-transparent text-[13.5px] font-medium text-bg caret-bg outline-none"
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
        </>
      )}
    </div>
  );
}
