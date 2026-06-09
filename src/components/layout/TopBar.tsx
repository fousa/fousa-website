"use client";
/**
 * Site header: wordmark, inline nav (md+) and a mobile hamburger menu.
 * Sticky at the top — transparent when at the very top of the page, gains a
 * hairline border + translucent backdrop-blur once the user scrolls.
 */
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { t } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import { localizedHref } from "@/lib/href";
import { Wordmark } from "@/components/brand/Wordmark";
import { useScrolled } from "./use-scrolled";

export function TopBar({ locale }: { locale: Locale }) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(sentinel);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  // Guards the focus-return effect from firing on initial mount (menu starts
  // closed), which would otherwise steal focus to the hamburger on page load.
  const mounted = useRef(false);
  const NAV = [
    { href: localizedHref(locale, "/"), label: t(locale, "work") },
    { href: localizedHref(locale, "/gallery"), label: t(locale, "gallery") },
    { href: localizedHref(locale, "/about"), label: t(locale, "about") },
  ];

  // On open: move focus into the menu and allow Escape to close.
  // On close (after the first render): return focus to the trigger.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (open) {
      menuRef.current
        ?.querySelector<HTMLElement>("a, button")
        ?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
    triggerRef.current?.focus();
  }, [open]);

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
        {/* The wordmark stays the home link; an easter-egg "take off ✈" play
            link wipes open to its right on hover/focus (desktop only — mobile
            uses the menu item below). The reveal is a sibling, not nested, so
            clicking the mark navigates home and clicking the reveal launches
            the game. */}
        <span className="brand-unit">
          <Link
            href={localizedHref(locale, "/")}
            className="font-display text-[19px] font-bold tracking-[-0.02em]"
          >
            <Wordmark />
          </Link>
          <span className="reveal-clip hidden md:inline-flex">
            <Link
              href={localizedHref(locale, "/game")}
              aria-label={t(locale, "play.aria")}
              className="reveal-link rounded outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t(locale, "play.label")}
              <span className="reveal-plane" aria-hidden>
                ✈
              </span>
            </Link>
          </span>
        </span>

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
            <span aria-hidden className="text-accent"> →</span>
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          ref={triggerRef}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? t(locale, "menu.close") : t(locale, "menu.open")}
          aria-expanded={open}
          aria-controls={menuId}
          className="flex flex-col gap-[5px] md:hidden"
        >
          <span className="block h-[2px] w-5 bg-ink" />
          <span className="block h-[2px] w-5 bg-ink" />
          <span className="block h-[2px] w-5 bg-ink" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav
          ref={menuRef}
          id={menuId}
          className="flex flex-col gap-4 border-t border-line bg-bg px-5 py-5 text-base font-medium md:hidden"
        >
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          {/* No hover on touch, so the easter egg gets a plain menu entry here —
              styled to match the desktop hover-reveal (faint, small uppercase mono). */}
          <Link
            href={localizedHref(locale, "/game")}
            aria-label={t(locale, "play.aria")}
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-faint"
          >
            {t(locale, "play.label")}
            <span aria-hidden className="text-accent">
              ✈
            </span>
          </Link>
          <Link
            href={`${localizedHref(locale, "/about")}#contact`}
            onClick={() => setOpen(false)}
          >
            {t(locale, "hireMe")}
            <span aria-hidden className="text-accent"> →</span>
          </Link>
        </nav>
      )}
      </header>
    </>
  );
}
