/** Minimal site footer: copyright left, locale switch + theme toggle right.
 *  One hairline, faint text, no fills — a utility strip, not a second nav. */
import { LocaleSwitch } from "./LocaleSwitch";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line">
      <div className="flex items-center justify-between gap-4 px-5 py-6 text-[13px] text-faint md:px-11 md:py-7">
        <span>
          © {year} fousa<span className="text-accent">.</span>be
        </span>
        <div className="flex items-center gap-4">
          <LocaleSwitch />
          <span className="h-3 w-px bg-line" aria-hidden />
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
