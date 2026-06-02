/** Minimal site footer: copyright left, locale switch + theme toggle right.
 *  One hairline, faint text, no fills — a utility strip, not a second nav.
 *  Privacy info lives in an inline info tip next to the copyright. */
import { LocaleSwitch } from "./LocaleSwitch";
import { InfoTip } from "./InfoTip";
import { GlideGame } from "@/components/glide/GlideGame";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Wordmark } from "@/components/brand/Wordmark";
import { t } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";

export function SiteFooter({ locale }: { locale: Locale }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line">
      <div className="flex items-center justify-between gap-4 px-5 py-6 text-[13px] text-muted md:px-11 md:py-7">
        <span className="inline-flex items-center gap-2">
          © {year} <Wordmark />
          <InfoTip label={t(locale, "privacyLabel")}>
            {t(locale, "privacyBody")}
          </InfoTip>
        </span>
        <div className="flex items-center gap-4">
          <GlideGame locale={locale} />
          <span className="h-3 w-px bg-line" aria-hidden />
          <LocaleSwitch />
          <span className="h-3 w-px bg-line" aria-hidden />
          <ThemeToggle locale={locale} />
        </div>
      </div>
    </footer>
  );
}
