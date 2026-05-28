"use client";
/**
 * True once the page has scrolled past the top. Works by observing a 1px sentinel
 * rendered at the very top of the document; when it leaves the viewport, we're "scrolled".
 *
 * Uses IntersectionObserver — no scroll listener, no jank.
 *
 * @param ref - ref to the sentinel element placed at the top of the page
 */
import { useEffect, useState, type RefObject } from "react";

export function useScrolled(ref: RefObject<HTMLElement | null>) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: "0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return scrolled;
}
