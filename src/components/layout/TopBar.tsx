"use client";
/**
 * Site header: wordmark, inline nav (md+) and a mobile hamburger menu.
 * Sticky at the top — transparent when at the very top of the page, gains a
 * hairline border + translucent backdrop-blur once the user scrolls.
 */
import Link from "next/link";
import { useRef, useState } from "react";
import { t } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import { localizedHref } from "@/lib/href";
import { Wordmark } from "@/components/brand/Wordmark";
import { useScrolled } from "./use-scrolled";

export function TopBar({ locale }: { locale: Locale }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(sentinel);
  const NAV = [
    { href: localizedHref(locale, "/"), label: t(locale, "work") },
    { href: localizedHref(locale, "/about"), label: t(locale, "about") },
  ];

  return (
    <>
      <div ref={sentinel} aria-hidden="true" className="absolute top-0 h-px w-full" />
      <header
        className={[
          "sticky top-0 z-50 transition-[background-color,border-color] duration-200 motion-reduce:transition-none",
          scrolled
            ? "border-b border-line bg-bg/80 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        ].join(" ")}
      >
      <div className="flex items-center justify-between px-5 py-5 md:px-11">
        <Link
          href={localizedHref(locale, "/")}
          className="font-display text-[19px] font-bold tracking-[-0.02em]"
        >
          <Wordmark />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="transition-colors hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href={`${localizedHref(locale, "/about")}#contact`}
            className="font-semibold text-ink"
          >
            {t(locale, "hireMe")}
            <span className="text-accent"> →</span>
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          className="flex flex-col gap-[5px] md:hidden"
        >
          <span className="block h-[2px] w-5 bg-ink" />
          <span className="block h-[2px] w-5 bg-ink" />
          <span className="block h-[2px] w-5 bg-ink" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="flex flex-col gap-4 border-t border-line bg-bg px-5 py-5 text-base font-medium md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          <Link
            href={`${localizedHref(locale, "/about")}#contact`}
            onClick={() => setOpen(false)}
          >
            {t(locale, "hireMe")}
            <span className="text-accent"> →</span>
          </Link>
        </nav>
      )}
      </header>
    </>
  );
}
