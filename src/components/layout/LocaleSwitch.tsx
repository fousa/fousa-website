"use client";
/**
 * Footer language switch. Full names on desktop (English / Nederlands), codes on
 * mobile (EN / NL) via responsive label spans — one control, one active state, no JS
 * branching. Swaps the locale segment of the current path, aware that English is
 * unprefixed.
 *
 * Uses `router.push` with `scroll: false` and a double-rAF scroll restore so switching
 * language keeps the user at the same scroll position instead of jumping to the top.
 */
import { usePathname, useRouter } from "next/navigation";
import { track } from "@/lib/analytics";

const LOCALES = [
  { code: "en", short: "EN", name: "English" },
  { code: "nl", short: "NL", name: "Nederlands" },
] as const;
const DEFAULT = "en";

/** Parse the pathname into locale + rest parts. */
export function pathParts(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const hasPrefix = (LOCALES as readonly { code: string }[]).some(
    (l) => l.code === parts[0],
  );
  const locale = hasPrefix ? parts[0] : DEFAULT;
  const rest = hasPrefix ? parts.slice(1) : parts;
  return { locale, rest };
}

/** Build a localized href for the target locale. */
export function hrefFor(pathname: string, target: string) {
  const { rest } = pathParts(pathname);
  const body = "/" + rest.join("/");
  return target === DEFAULT
    ? body || "/"
    : `/${target}${body === "/" ? "" : body}`;
}

export function LocaleSwitch() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { locale: current } = pathParts(pathname);

  /** Navigate to the target locale, preserving scroll position. */
  function switchTo(loc: string) {
    track("locale_switch", { from: current, to: loc, path: pathname });
    const y = window.scrollY;
    router.push(hrefFor(pathname, loc), { scroll: false });
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
              // No aria-label: the visible label (full name on desktop, code on
              // mobile) is the accessible name, so it always matches what's shown
              // (WCAG 2.5.3 Label in Name).
              aria-current={active ? "true" : undefined}
              className={[
                // Vertical-only ::after hit-area: a horizontal bump would overlap
                // the adjacent locale button, so we extend the tap target up/down only.
                "relative after:absolute after:-inset-y-[14px] after:inset-x-0 after:content-['']",
                active
                  ? "cursor-default text-ink"
                  : "cursor-pointer text-muted transition-colors hover:text-ink",
              ].join(" ")}
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
