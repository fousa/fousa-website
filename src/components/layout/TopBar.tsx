"use client";
/**
 * Site header: wordmark, inline nav (md+) and a mobile hamburger menu.
 * Nav labels come from the i18n dictionary; locale switcher uses the
 * existing LocaleSwitcher component for real EN/NL path swapping.
 */
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { t } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";

export function TopBar({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const NAV = [
    { href: `/${locale}`, label: t(locale, "work") },
    { href: `/${locale}/about`, label: t(locale, "about") },
  ];

  return (
    <header className="border-b border-line">
      <div className="flex items-center justify-between px-5 py-5 md:px-11">
        <Link
          href={`/${locale}`}
          className="font-display text-[19px] font-bold tracking-[-0.02em]"
        >
          fousa<span className="text-accent">.</span>be
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
          <LocaleSwitcher currentLocale={locale} />
          <ThemeToggle />
          <Link
            href={`/${locale}/about#contact`}
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
        <nav className="flex flex-col gap-4 border-t border-line px-5 py-5 text-base font-medium md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          <Link
            href={`/${locale}/about#contact`}
            onClick={() => setOpen(false)}
          >
            {t(locale, "hireMe")}
            <span className="text-accent"> →</span>
          </Link>
          <div className="flex items-center gap-6 pt-1">
            <LocaleSwitcher currentLocale={locale} />
            <ThemeToggle />
          </div>
        </nav>
      )}
    </header>
  );
}
