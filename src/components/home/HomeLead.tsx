/**
 * Homepage lead: prominent name (with the coral brand period), role line, and a
 * friendly invitation to filter the log below. Copy comes from Profile. The
 * role line carries the hidden Glide game entry — a small tilted plane glyph.
 */
import { GlideGame } from "@/components/glide/GlideGame";
import type { Locale } from "@/i18n/config";

export function HomeLead({
  locale,
  name,
  role,
  filterIntro,
}: {
  locale: Locale;
  name: string;
  role: string;
  filterIntro: string;
}) {
  return (
    <div className="px-5 pb-10 pt-10 md:px-11 md:pb-16 md:pt-16">
      <h1 className="font-display text-[40px] font-bold leading-[1] tracking-[-0.035em] text-ink sm:text-[52px] md:text-[56px]">
        {name}
        <span className="text-accent">.</span>
      </h1>
      <p className="mt-[14px] text-[15px] text-muted">{role}</p>
      <p className="mt-[18px] max-w-[520px] text-[15px] leading-[1.6] text-muted">
        {filterIntro}
      </p>
      <GlideGame
        locale={locale}
        withArrow
        triggerClassName="mt-5 inline-block rounded text-[15px] font-semibold text-ink outline-none transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
    </div>
  );
}
