/** Availability indicator for the contact panel: a coloured dot + label.
 *  Semantic colours (green/amber/red) are intentional; pulse only on `available`. */
export type AvailabilityStatus = "available" | "after-hours" | "unavailable";

const DOT: Record<AvailabilityStatus, string> = {
  available: "var(--status-ok)",
  "after-hours": "var(--status-warn)",
  unavailable: "var(--status-full)",
};

export function AvailabilityBadge({
  status,
  message,
}: {
  status: AvailabilityStatus;
  message: string;
}) {
  return (
    <span className="flex items-center gap-[10px] font-mono text-[11px] uppercase tracking-[0.1em] text-panel-muted">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${status === "available" ? "avail-pulse" : ""}`}
        style={{ backgroundColor: DOT[status], color: DOT[status] }}
        aria-hidden
      />
      <span>{message}</span>
    </span>
  );
}
