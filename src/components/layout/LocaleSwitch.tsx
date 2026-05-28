"use client";
/**
 * Footer language switch. Full names on desktop (English / Nederlands), codes on
 * mobile (EN / NL) via responsive label spans — one control, one active state, no JS
 * branching. Swaps the leading locale segment of the current path. Each label span has
 * an explicit display at both breakpoints so a global reset can't blank it out.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";

const LOCALES = [
  { code: "en", short: "EN", name: "English" },
  { code: "nl", short: "NL", name: "Nederlands" },
] as const;

export function LocaleSwitch() {
  const pathname = usePathname() || "/";
  const seg = pathname.split("/")[1];
  const current = LOCALES.some((l) => l.code === seg) ? seg : "en";

  /** Build the path with `loc` as the leading locale segment. */
  function hrefFor(loc: string) {
    const p = pathname.split("/");
    if (LOCALES.some((l) => l.code === p[1])) p[1] = loc;
    else p.splice(1, 0, loc);
    return p.join("/") || "/";
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
            <Link
              href={hrefFor(l.code)}
              aria-label={l.name}
              aria-current={active ? "true" : undefined}
              className={
                active
                  ? "text-ink"
                  : "text-faint transition-colors hover:text-muted"
              }
            >
              {/* mobile: code */}
              <span className="inline font-mono text-xs uppercase md:hidden">
                {l.short}
              </span>
              {/* desktop: full name */}
              <span className="hidden text-[12.5px] md:inline">{l.name}</span>
            </Link>
          </span>
        );
      })}
    </span>
  );
}
