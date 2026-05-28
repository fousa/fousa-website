/**
 * Project state as a dot + word (never a pill).
 *
 * Only `active` gets the coral accent dot — the single accent colour in the
 * log should signal "this is alive and shipping". Everything else is muted.
 */
import type { State } from "@/lib/work";
import type { MessageKey } from "@/i18n/messages";
import { t } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";

const KEY: Record<State, MessageKey> = {
  active: "stateActive",
  maintained: "stateMaintained",
  archived: "stateArchived",
  cancelled: "stateCancelled",
};

export function StatusDot({ state, locale }: { state: State; locale: Locale }) {
  const isAccent = state === "active";
  return (
    <span
      className={`inline-flex items-center gap-2 text-[13.5px] ${isAccent ? "text-ink" : "text-muted"}`}
    >
      <span
        className={`h-[7px] w-[7px] rounded-full ${isAccent ? "bg-accent" : "bg-faint"}`}
      />
      {t(locale, KEY[state])}
    </span>
  );
}
