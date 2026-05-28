"use client";
/**
 * Footer language switch. Full names on desktop (English / Nederlands), codes on
 * mobile (EN / NL) via responsive label spans — one control, one active state, no JS
 * branching. Swaps the leading locale segment of the current path. Each label span has
 * an explicit display at both breakpoints so a global reset can't blank it out.
 *
 * Uses `router.push` with `scroll: false` and a double-rAF scroll restore so switching
 * language keeps the user at the same scroll position instead of jumping to the top.
 */
import { usePathname, useRouter } from "next/navigation";

const LOCALES = [
  { code: "en", short: "EN", name: "English" },
  { code: "nl", short: "NL", name: "Nederlands" },
] as const;

export function LocaleSwitch() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const seg = pathname.split("/")[1];
  const current = LOCALES.some((l) => l.code === seg) ? seg : "en";

  /** Build the path with `loc` as the leading locale segment. */
  function hrefFor(loc: string) {
    const p = pathname.split("/");
    if (LOCALES.some((l) => l.code === p[1])) p[1] = loc;
    else p.splice(1, 0, loc);
    return p.join("/") || "/";
  }

  /** Navigate to the target locale, preserving scroll position. */
  function switchTo(loc: string) {
    const y = window.scrollY;
    router.push(hrefFor(loc), { scroll: false });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const max = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight,
        );
        window.scrollTo({
          top: Math.min(y, max),
          behavior: "instant" as ScrollBehavior,
        });
      }),
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      {LOCALES.map((l, i) => {
        const active = l.code === current;
        return (
          <span key={l.code} className="inline-flex items-center gap-2">
            {i > 0 && (
              <span className="text-line" aria-hidden>
                /
              </span>
            )}
            <button
              onClick={() => switchTo(l.code)}
              aria-label={l.name}
              aria-current={active ? "true" : undefined}
              className={
                active
                  ? "cursor-default text-ink"
                  : "cursor-pointer text-faint transition-colors hover:text-muted"
              }
            >
              {/* mobile: code */}
              <span className="inline font-mono text-xs uppercase md:hidden">
                {l.short}
              </span>
              {/* desktop: full name */}
              <span className="hidden text-[12.5px] md:inline">{l.name}</span>
            </button>
          </span>
        );
      })}
    </span>
  );
}
