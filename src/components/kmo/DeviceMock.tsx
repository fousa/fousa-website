/**
 * Decorative device mocks for the KMO page's package cards: an iPhone with a
 * real bezel for the field app, a Safari window for the two web packages.
 *
 * Pure markup instead of screenshots, so they follow the theme tokens (the
 * screen is `bg-bg`, the UI sketched in hairlines and grey bars). The whole
 * mock is `aria-hidden`: the card's own text carries the meaning.
 */
import type { KmoMock } from "@/lib/kmo";

/** A grey "text line" placeholder; width is set per use. */
const BAR = "block h-[5px] rounded-full bg-[#d4d4d8] dark:bg-[#3f3f46]";

export function DeviceMock({ kind }: { kind: KmoMock }) {
  return (
    <div
      aria-hidden
      className="flex h-[240px] items-center justify-center overflow-hidden rounded bg-surface"
    >
      {kind === "phone" ? <Phone /> : <Browser kind={kind} />}
    </div>
  );
}

/** iPhone: dark bezel, Dynamic Island, an inspection checklist, home indicator. */
function Phone() {
  const rows = [
    { w: 56, done: true },
    { w: 44, done: true },
    { w: 62, done: false },
    { w: 38, done: false },
  ];
  return (
    <div className="h-[212px] w-[124px] rounded-[24px] bg-[#1c1c1e] p-[5px] shadow-[inset_0_0_0_1px_#52525b]">
      <div className="relative flex h-full flex-col gap-[7px] overflow-hidden rounded-[19px] bg-bg px-2.5 pt-6 pb-2">
        <span className="absolute top-1.5 left-1/2 h-2.5 w-[34px] -translate-x-1/2 rounded-full bg-[#0c0c0d]" />
        <span className="font-display text-[12px] font-semibold text-ink">Inspectie</span>
        <div className="flex flex-col border-t border-line">
          {rows.map((row) => (
            <div
              key={row.w}
              className="flex h-[17px] items-center justify-between border-b border-line"
            >
              <span className={BAR} style={{ width: row.w }} />
              <span
                className={
                  row.done ? "size-2 rounded-[2px] bg-ink" : "size-2 rounded-[2px] border border-faint"
                }
              />
            </div>
          ))}
        </div>
        <span className="h-[26px] shrink-0 rounded-[3px] border border-line bg-surface" />
        <span className="mt-auto h-[18px] shrink-0 rounded bg-ink" />
        <span className="h-[3px] w-10 shrink-0 self-center rounded-full bg-ink" />
      </div>
    </div>
  );
}

/** Safari window: traffic lights, an address field, then the app's screen. */
function Browser({ kind }: { kind: "portal" | "tool" }) {
  return (
    <div className="flex h-[172px] w-[268px] flex-col overflow-hidden rounded-lg border border-[#d4d4d8] bg-bg dark:border-[#3f3f46]">
      <div className="flex h-6 shrink-0 items-center gap-1 border-b border-line bg-surface px-2">
        <span className="size-[7px] rounded-full bg-[#ff5f57]" />
        <span className="size-[7px] rounded-full bg-[#febc2e]" />
        <span className="size-[7px] rounded-full bg-[#28c840]" />
        <span className="mr-[26px] ml-2.5 h-3.5 flex-1 rounded border border-line bg-bg" />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 px-3.5 py-3">
        {kind === "portal" ? <PortalScreen /> : <ToolScreen />}
      </div>
    </div>
  );
}

/** Client portal: a dossier with its progress steps and two documents. */
function PortalScreen() {
  const dot = "size-2 shrink-0 rounded-full";
  const line = "h-px flex-1";
  return (
    <>
      <span className="font-display text-[12px] font-semibold text-ink">Nieuwe keuken</span>
      <div className="flex items-center">
        <span className={`${dot} bg-ink`} />
        <span className={`${line} bg-ink`} />
        <span className={`${dot} bg-ink`} />
        <span className={`${line} bg-ink`} />
        <span className={`${dot} bg-accent shadow-[0_0_0_3px_var(--accent-soft)]`} />
        <span className={`${line} bg-line`} />
        <span className={`${dot} bg-line`} />
        <span className={`${line} bg-line`} />
        <span className={`${dot} bg-line`} />
      </div>
      <div className="flex flex-col border-t border-line">
        {[84, 66].map((w) => (
          <div key={w} className="flex h-[22px] items-center justify-between border-b border-line">
            <span className={BAR} style={{ width: w }} />
            <span className="block h-[5px] w-[18px] rounded-full bg-line" />
          </div>
        ))}
      </div>
      <span className="mt-auto block h-[7px] w-[84px] rounded-full bg-ink" />
    </>
  );
}

/** Internal tool: tabs, a stock table with two low-stock rows, an action. */
function ToolScreen() {
  const rows = [
    { w: "70%", low: true },
    { w: "55%", low: false },
    { w: "80%", low: true },
    { w: "45%", low: false },
  ];
  return (
    <>
      <div className="flex gap-2 border-b border-line pb-1.5">
        <span className="block h-1.5 w-7 rounded-full bg-[#d4d4d8] dark:bg-[#3f3f46]" />
        <span className="block h-1.5 w-[34px] rounded-full bg-ink" />
        <span className="block h-1.5 w-[30px] rounded-full bg-[#d4d4d8] dark:bg-[#3f3f46]" />
      </div>
      <div className="flex flex-col">
        {rows.map((row) => (
          <div
            key={row.w}
            className="grid h-[19px] grid-cols-[minmax(0,1fr)_22px_8px] items-center gap-2 border-b border-line"
          >
            <span className={BAR} style={{ width: row.w }} />
            <span className="block h-[5px] rounded-full bg-line" />
            <span className={`size-1.5 rounded-full ${row.low ? "bg-accent" : "bg-line"}`} />
          </div>
        ))}
      </div>
      <span className="mt-auto block h-[7px] w-[70px] rounded-full bg-ink" />
    </>
  );
}
