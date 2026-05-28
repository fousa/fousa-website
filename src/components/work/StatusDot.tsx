/**
 * Project state as a dot + word (never a pill).
 * live = accent color, everything else = muted.
 */
import type { State } from "@/lib/work";

const LABEL: Record<State, string> = {
  live: "Live",
  cancelled: "Cancelled",
  deprecated: "Deprecated",
};

export function StatusDot({ state }: { state: State }) {
  const isLive = state === "live";
  return (
    <span
      className={`inline-flex items-center gap-2 text-[13.5px] ${isLive ? "text-ink" : "text-muted"}`}
    >
      <span
        className={`h-[7px] w-[7px] rounded-full ${isLive ? "bg-accent" : "bg-faint"}`}
      />
      {LABEL[state]}
    </span>
  );
}
