"use client";
/**
 * Renders the "no projects match" state inside the project log.
 * Brand `f.` mark on the left, headline + body, two inline actions.
 * Copy comes from the page (i18n + optional Sanity override).
 */
type Props = {
  headline: string;
  body: string;
  clearLabel: string;
  showAllLabel: string;
  onClear: () => void;
};

export function EmptyState({
  headline,
  body,
  clearLabel,
  showAllLabel,
  onClear,
}: Props) {
  return (
    <div className="flex items-start gap-6 border-t border-line px-5 py-16 md:px-11">
      {/* brand mark, hairline circle — same f. as the wordmark */}
      <div
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink font-display text-[15px] font-bold text-ink"
      >
        f<span className="text-accent">.</span>
      </div>

      <div className="min-w-0">
        <h3 className="font-display text-[18px] font-semibold tracking-[-0.01em] text-ink">
          {headline}
        </h3>
        <p className="mt-1.5 max-w-[44ch] text-[14px] leading-[1.6] text-muted">
          {body}
        </p>
        <div className="mt-3 inline-flex items-center gap-4">
          <button
            onClick={onClear}
            className="font-display text-[13.5px] font-semibold text-ink cursor-pointer"
          >
            {clearLabel}
            <span aria-hidden className="text-accent"> →</span>
          </button>
          <span className="text-[13.5px] text-muted">· {showAllLabel}</span>
        </div>
      </div>
    </div>
  );
}
