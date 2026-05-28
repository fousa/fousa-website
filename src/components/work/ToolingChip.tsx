/**
 * Subtle "AI-assisted" chip shown next to selected project names in the log.
 * Outline only, monospace, ink/line; flagged per project via `featureTooling`.
 */
export function ToolingChip({ label }: { label: string }) {
  return (
    <span className="ml-2 inline-flex shrink-0 items-center rounded-full border border-line px-2 py-[1px] align-middle font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">
      {label}
    </span>
  );
}
