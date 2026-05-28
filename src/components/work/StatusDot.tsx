/**
 * Project status as a dot + word (never a pill).
 * live = accent color, everything else = muted.
 */
import type { Status } from "@/lib/work";

const LABEL: Record<Status, string> = {
  live: "Live",
  done: "Done",
  paused: "Paused",
  cancelled: "Cancelled",
};

export function StatusDot({ status }: { status: Status }) {
  const isLive = status === "live";
  return (
    <span
      className={`inline-flex items-center gap-2 text-[13.5px] ${isLive ? "text-ink" : "text-muted"}`}
    >
      <span
        className={`h-[7px] w-[7px] rounded-full ${isLive ? "bg-accent" : "bg-faint"}`}
      />
      {LABEL[status]}
    </span>
  );
}
