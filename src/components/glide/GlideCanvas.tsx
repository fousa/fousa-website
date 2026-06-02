"use client";
/**
 * The Glide play surface — a single full-bleed <canvas> driven by
 * requestAnimationFrame.
 *
 * This step establishes the render loop and, crucially, the colour pipeline:
 * the palette is read from the live CSS tokens and re-read whenever the site
 * theme flips, so the canvas tracks light/dark natively. The loop pauses when
 * the tab is hidden, cancels on unmount, and falls back to a single static
 * frame when the user prefers reduced motion. The flight model arrives in a
 * later step; for now it paints a drifting top-down ground.
 */
import { useEffect, useRef } from "react";
import { GLIDE } from "./config";
import { readPalette, type Palette } from "./palette";

/** Sets the canvas backing-store size to the CSS size × devicePixelRatio and
 *  scales the context so all drawing uses CSS pixels. Returns CSS dimensions. */
function fitCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

/** Paints one frame: ground fill plus a drifting field grid that reads as
 *  forward motion. `scroll` is the camera's X offset in CSS pixels. */
function draw(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: Palette,
  scroll: number,
) {
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, w, h);

  const gap = 120;
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  // Vertical hairlines scroll with travel; horizontals stay put — together
  // they read as gliding forward over parcelled fields seen from above.
  for (let x = -(scroll % gap); x < w; x += gap) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = gap; y < h; y += gap) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function GlideCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let pal = readPalette();
    let dims = fitCanvas(canvas, ctx);
    let scroll = 0;
    let raf = 0;
    let last = 0;

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    /** Render a single static frame — used for reduced-motion and whenever the
     *  loop is paused but the canvas still needs a correct repaint. */
    function paint() {
      draw(ctx!, dims.w, dims.h, pal, scroll);
    }

    function frame(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      // Constant cruise drift for now; later driven by airspeed. dt*60 keeps
      // the per-frame px tuning stable across refresh rates.
      scroll += GLIDE.CRUISE * GLIDE.PX_PER_KMH * dt * 60;
      paint();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (raf || reduceQuery.matches) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    // Re-read tokens on a `.dark` flip so colours follow the site theme.
    const themeObserver = new MutationObserver(() => {
      pal = readPalette();
      paint();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    function onResize() {
      dims = fitCanvas(canvas!, ctx!);
      paint();
    }
    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }
    function onReduceChange() {
      if (reduceQuery.matches) stop();
      paint();
      start();
    }

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    reduceQuery.addEventListener("change", onReduceChange);

    paint();
    start();

    return () => {
      stop();
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceQuery.removeEventListener("change", onReduceChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full touch-none"
      aria-hidden
    />
  );
}
