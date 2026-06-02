"use client";
/**
 * The Glide play surface — a single full-bleed <canvas> driven by
 * requestAnimationFrame.
 *
 * Owns the colour pipeline (palette read from live CSS tokens, re-read on a
 * `.dark` flip), the loop lifecycle (pause when hidden, cancel on unmount,
 * static frame under prefers-reduced-motion), and now the flight model: it
 * collects keyboard/touch input, steps the glider, follows it with an eased
 * camera, and draws the glider over a drifting top-down ground.
 *
 * Controls: ←/→ or A/D steer, ↑/↓ or W/S set airspeed. Touch: the screen half
 * you press steers (left/right) and sets speed (top = fast, bottom = slow).
 * No mouse steering.
 */
import { useEffect, useRef } from "react";
import { createGlider, stepGlider, type Glider, type Input } from "./engine";
import {
  createWorld,
  liftAt,
  updateWorld,
  type Thermal,
  type World,
} from "./world";
import { readPalette, type Palette } from "./palette";

/** Glider screen anchor as a fraction of viewport width — the camera keeps the
 *  glider near here horizontally while the world scrolls past. */
const ANCHOR_X = 0.4;
/** Camera follow easing (per second). */
const CAM_EASE = 5;
/** Field-grid spacing in px. */
const GRID = 120;

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

/** Drifting field grid: verticals scroll with the camera, horizontals stay,
 *  together reading as forward flight over parcelled fields seen from above. */
function drawGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: Palette,
  cameraX: number,
) {
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = pal.line;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  for (let x = -(((cameraX % GRID) + GRID) % GRID); x < w; x += GRID) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = GRID; y < h; y += GRID) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** A cumulus puff marking a thermal. The active thermal (currently lifting the
 *  glider) additionally gets a coral ring at its radius and a core dot. */
function drawThermal(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  t: Thermal,
  pal: Palette,
  active: boolean,
) {
  ctx.save();
  ctx.fillStyle = pal.muted;
  ctx.globalAlpha = 0.16;
  ctx.beginPath();
  ctx.arc(sx, sy, t.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.22;
  ctx.beginPath();
  ctx.arc(sx, sy, t.r * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (active) {
    ctx.save();
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx, sy, t.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = pal.accent;
    ctx.beginPath();
    ctx.arc(sx, sy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/** A small dart pointing along the heading, in the site accent. */
function drawGlider(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  heading: number,
  pal: Palette,
) {
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(heading);
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.moveTo(13, 0);
  ctx.lineTo(-8, -7);
  ctx.lineTo(-3, 0);
  ctx.lineTo(-8, 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
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
    let cameraX = -dims.w * ANCHOR_X;
    const glider: Glider = createGlider(dims.h);
    const world: World = createWorld();
    let active: Thermal | null = null;
    let raf = 0;
    let last = 0;

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Input state, mutated by listeners and sampled each frame.
    const keys = { left: false, right: false, up: false, down: false };
    let touch: Input | null = null;

    function readInput(): Input {
      if (touch) return touch;
      const turn = ((keys.right ? 1 : 0) - (keys.left ? 1 : 0)) as Input["turn"];
      const pitch = ((keys.up ? 1 : 0) - (keys.down ? 1 : 0)) as Input["pitch"];
      return { turn, pitch };
    }

    function paint() {
      drawGround(ctx!, dims.w, dims.h, pal, cameraX);
      for (const t of world.thermals) {
        const sx = t.x - cameraX;
        if (sx + t.r < 0 || sx - t.r > dims.w) continue;
        drawThermal(ctx!, sx, t.yFrac * dims.h, t, pal, t === active);
      }
      drawGlider(ctx!, glider.x - cameraX, glider.y, glider.heading, pal);
    }

    function frame(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      updateWorld(world, cameraX, dims.w);
      const input = readInput();
      const lift = liftAt(world, glider, dims.h, input.turn !== 0);
      active = lift.active;
      stepGlider(glider, input, dt, dims, lift.value);
      const target = glider.x - dims.w * ANCHOR_X;
      cameraX += (target - cameraX) * (1 - Math.exp(-CAM_EASE * dt));
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

    // --- Keyboard -----------------------------------------------------------
    function setKey(e: KeyboardEvent, down: boolean): boolean {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          keys.left = down;
          return true;
        case "ArrowRight":
        case "d":
        case "D":
          keys.right = down;
          return true;
        case "ArrowUp":
        case "w":
        case "W":
          keys.up = down;
          return true;
        case "ArrowDown":
        case "s":
        case "S":
          keys.down = down;
          return true;
        default:
          return false;
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (setKey(e, true)) e.preventDefault();
    }
    function onKeyUp(e: KeyboardEvent) {
      setKey(e, false);
    }

    // --- Touch: x-half steers, y-half sets speed ----------------------------
    function setTouch(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      const rect = canvas!.getBoundingClientRect();
      const turn = (t.clientX - rect.left < rect.width / 2 ? -1 : 1) as Input["turn"];
      const pitch = (t.clientY - rect.top < rect.height / 2 ? 1 : -1) as Input["pitch"];
      touch = { turn, pitch };
      e.preventDefault();
    }
    function clearTouch() {
      touch = null;
    }

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

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("touchstart", setTouch, { passive: false });
    canvas.addEventListener("touchmove", setTouch, { passive: false });
    canvas.addEventListener("touchend", clearTouch);
    canvas.addEventListener("touchcancel", clearTouch);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    reduceQuery.addEventListener("change", onReduceChange);

    paint();
    start();

    return () => {
      stop();
      themeObserver.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("touchstart", setTouch);
      canvas.removeEventListener("touchmove", setTouch);
      canvas.removeEventListener("touchend", clearTouch);
      canvas.removeEventListener("touchcancel", clearTouch);
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
