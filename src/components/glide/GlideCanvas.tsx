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
import { t } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import {
  altitudeM,
  createGlider,
  distanceKm,
  stepGlider,
  varioMs,
  type EndReason,
  type Glider,
  type Input,
} from "./engine";
import { drawInstruments, drawScore, LOW_ALT } from "./instruments";
import {
  createWorld,
  liftAt,
  riverCenterX,
  riverSinkAt,
  stormHit,
  updateWorld,
  type River,
  type Storm,
  type Thermal,
  type World,
} from "./world";
import { readFonts, readPalette, type Fonts, type Palette } from "./palette";

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
 *  together reading as forward flight over parcelled fields seen from above.
 *  A faint half-step grid sits under a stronger field grid with survey dots at
 *  its intersections, so the ground reads clearly without fighting the play. */
function drawGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: Palette,
  cameraX: number,
) {
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  const minor = GRID / 2;
  const startMinor = -(((cameraX % minor) + minor) % minor);
  const startMajor = -(((cameraX % GRID) + GRID) % GRID);

  // Minor grid — faint and dense, for a sense of texture and speed.
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  for (let x = startMinor; x < w; x += minor) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y < h; y += minor) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // Major grid — stronger, parcelling the fields.
  ctx.strokeStyle = pal.faint;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  for (let x = startMajor; x < w; x += GRID) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y < h; y += GRID) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // Survey dots at the major intersections.
  ctx.fillStyle = pal.faint;
  ctx.globalAlpha = 0.45;
  for (let x = startMajor; x < w; x += GRID) {
    for (let y = 0; y < h; y += GRID) {
      ctx.beginPath();
      ctx.arc(x, y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Overlapping lobes (offset & radius as fractions of the thermal radius) that
 *  together read as a billowing cumulus: a flatter base with a bumpy top. */
const CLOUD_LOBES = [
  { dx: 0, dy: 0.12, rr: 0.62 },
  { dx: -0.52, dy: 0.18, rr: 0.44 },
  { dx: 0.54, dy: 0.16, rr: 0.46 },
  { dx: -0.26, dy: -0.3, rr: 0.42 },
  { dx: 0.3, dy: -0.26, rr: 0.46 },
  { dx: 0.02, dy: -0.46, rr: 0.34 },
];

/** Traces the union of the cloud lobes as a single sub-pathed shape, scaled by
 *  `scale` toward the centre, ready for one fill. */
function cloudPath(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  r: number,
  scale: number,
) {
  ctx.beginPath();
  for (const l of CLOUD_LOBES) {
    const cx = sx + l.dx * r * scale;
    const cy = sy + l.dy * r * scale;
    const rr = l.rr * r * scale;
    ctx.moveTo(cx + rr, cy);
    ctx.arc(cx, cy, rr, 0, Math.PI * 2);
  }
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
  // Soft full silhouette, then a denser inner mass for a touch of depth.
  ctx.globalAlpha = 0.14;
  cloudPath(ctx, sx, sy, t.r, 1);
  ctx.fill();
  ctx.globalAlpha = 0.12;
  cloudPath(ctx, sx, sy, t.r, 0.62);
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

/** A meandering vertical band of strong sink. */
function drawRiver(
  ctx: CanvasRenderingContext2D,
  river: River,
  pal: Palette,
  cameraX: number,
  h: number,
) {
  ctx.save();
  ctx.fillStyle = pal.faint;
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  // Left edge top→bottom, then right edge bottom→top, following the meander.
  for (let y = 0; y <= h; y += 12) {
    const cx = riverCenterX(river, y) - cameraX;
    if (y === 0) ctx.moveTo(cx - river.width / 2, y);
    else ctx.lineTo(cx - river.width / 2, y);
  }
  for (let y = h; y >= 0; y -= 12) {
    const cx = riverCenterX(river, y) - cameraX;
    ctx.lineTo(cx + river.width / 2, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** A big, dark, billowing storm cloud with a coral lightning bolt that flares
 *  on a periodic flash. Drawn with the cumulus silhouette but heavier and in
 *  the high-contrast ink token so it reads as a clear hazard. */
function drawStorm(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  storm: Storm,
  pal: Palette,
  clock: number,
) {
  // Flash for a short beat every ~1.8s, offset per storm.
  const flashing = (clock + storm.flashOffset) % 1.8 < 0.12;
  const r = storm.r;

  ctx.save();
  // Heavy billowing mass, denser core, and a defined rim.
  ctx.fillStyle = pal.ink;
  ctx.globalAlpha = 0.5;
  cloudPath(ctx, sx, sy, r, 1);
  ctx.fill();
  ctx.globalAlpha = 0.68;
  cloudPath(ctx, sx, sy, r, 0.6);
  ctx.fill();
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = pal.ink;
  cloudPath(ctx, sx, sy, r, 1);
  ctx.stroke();
  // A coral glow washes the cloud on the flash beat.
  if (flashing) {
    ctx.fillStyle = pal.accent;
    ctx.globalAlpha = 0.2;
    cloudPath(ctx, sx, sy, r, 1);
    ctx.fill();
  }
  ctx.restore();

  // Lightning bolt: a faint hint always, flaring bright with a glow on flash.
  ctx.save();
  ctx.strokeStyle = pal.accent;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = flashing ? 2.5 : 1.25;
  ctx.globalAlpha = flashing ? 1 : 0.4;
  if (flashing) {
    ctx.shadowColor = pal.accent;
    ctx.shadowBlur = 12;
  }
  ctx.beginPath();
  storm.bolt.forEach((p, i) => {
    const x = sx + p.x;
    const y = sy + p.y;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();
}

/**
 * Top-down glider silhouette, taken from the Glider.pdf vector asset. The path
 * is in the PDF's own units (40×19, Y up) with the nose at the bottom; we draw
 * it centred on its bounding box and rotated a quarter-turn so the nose points
 * along the heading (+X). Built as a Path2D once (browser only) in the effect.
 */
const GLIDER_PATH_D =
  "M 39.552 13.3644 L 31.166 13.5548 L 20.9528 13.5548 C 20.966 13.6992 20.948 14.4332 20.8756 16.1956 C 20.794 18.1832 19.9772 18.9996 19.9772 18.9996 C 19.9772 18.9996 19.1604 18.1828 19.0788 16.1956 C 19.006 14.4332 18.9876 13.6992 19.0012 13.5548 L 8.7872 13.5548 L 0.402 13.3644 C 0.402 13.3644 0.0208 13.31 0.0208 13.0104 C 0.0208 12.7108 0.0208 12.3024 0.0208 12.3024 L 7.5012 11.6764 L 13.9328 11.3224 C 13.9328 11.3224 18.6556 11.05 18.9152 11.05 C 19.11 11.05 19.1684 10.9248 19.1856 10.7596 L 19.1928 10.5852 L 19.1928 10.5852 C 19.1928 10.5808 19.1928 10.5764 19.1932 10.572 L 19.5092 2.4264 L 16.9548 2.0656 C 16.9548 2.0656 16.5468 1.9296 16.5468 1.6304 C 16.5468 1.3308 16.5468 1.1392 16.5468 1.1392 L 19.5096 0.8396 L 19.7428 1.1824 L 19.9032 0.7096 L 19.9768 0.568 L 20.0504 0.7096 L 20.2104 1.1824 L 20.444 0.84 L 23.4072 1.1396 C 23.4072 1.1396 23.4072 1.3312 23.4072 1.6308 C 23.4072 1.93 22.998 2.066 22.998 2.066 L 20.4448 2.4268 L 20.7608 10.5724 C 20.7612 10.5764 20.7612 10.5808 20.7612 10.5856 L 20.7612 10.5856 L 20.7684 10.76 C 20.7852 10.9252 20.8436 11.0504 21.0384 11.0504 C 21.2976 11.0504 26.0212 11.3228 26.0212 11.3228 L 32.4524 11.6768 L 39.9324 12.3028 C 39.9324 12.3028 39.9324 12.7112 39.9324 13.0108 C 39.9324 13.3096 39.552 13.3644 39.552 13.3644 Z";
/** Bounding-box centre of the path, in PDF units. */
const GLIDER_CX = 19.9766;
const GLIDER_CY = 9.7838;
/** Scale from PDF units to screen px (≈80px wingspan). */
const GLIDER_SCALE = 2.0;

/** Draws the vector glider, centred at (sx,sy) and rotated to the heading. */
function drawGlider(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  heading: number,
  pal: Palette,
  path: Path2D,
) {
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(heading + Math.PI);
  ctx.scale(GLIDER_SCALE, GLIDER_SCALE);
  // Map PDF coords (Y up, nose at bottom) → local (centred, nose at +X).
  ctx.transform(0, 1, -1, 0, GLIDER_CY, -GLIDER_CX);
  ctx.fillStyle = pal.accent;
  ctx.fill(path);
  ctx.restore();
}

export function GlideCanvas({
  locale,
  onEnd,
}: {
  locale: Locale;
  onEnd: (reason: EndReason, km: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let pal = readPalette();
    const fonts: Fonts = readFonts();
    const gliderPath = new Path2D(GLIDER_PATH_D);
    const lowLabel = t(locale, "glideLow");
    const distanceLabel = t(locale, "glideDistance");
    let dims = fitCanvas(canvas, ctx);
    let cameraX = -dims.w * ANCHOR_X;
    const glider: Glider = createGlider(dims.h);
    const world: World = createWorld();
    let active: Thermal | null = null;
    let ended = false;
    let clock = 0;
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
      for (const r of world.rivers) {
        const sx = r.x - cameraX;
        if (sx + r.width < 0 || sx - r.width > dims.w) continue;
        drawRiver(ctx!, r, pal, cameraX, dims.h);
      }
      for (const t of world.thermals) {
        const sx = t.x - cameraX;
        if (sx + t.r < 0 || sx - t.r > dims.w) continue;
        drawThermal(ctx!, sx, t.yFrac * dims.h, t, pal, t === active);
      }
      for (const s of world.storms) {
        const sx = s.x - cameraX;
        if (sx + s.r < 0 || sx - s.r > dims.w) continue;
        drawStorm(ctx!, sx, s.yFrac * dims.h, s, pal, clock);
      }
      drawGlider(ctx!, glider.x - cameraX, glider.y, glider.heading, pal, gliderPath);
      drawInstruments(ctx!, dims.w, dims.h, pal, fonts, {
        altM: altitudeM(glider),
        varioMs: varioMs(glider),
        speedKmh: glider.speed,
        low: glider.alt < LOW_ALT,
        lowLabel,
      });
      drawScore(ctx!, pal, fonts, distanceKm(glider), distanceLabel);
    }

    function frame(now: number) {
      if (ended) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      clock = now / 1000;
      updateWorld(world, cameraX, dims.w);
      const input = readInput();
      const lift = liftAt(world, glider, dims.h, input.turn !== 0);
      active = lift.active;
      stepGlider(glider, input, dt, dims, lift.value - riverSinkAt(world, glider));

      // End the flight on flying into a storm core or landing (no altitude).
      let reason: EndReason | null = null;
      if (stormHit(world, glider, dims.h)) reason = "storm";
      else if (glider.alt <= 0) reason = "land";

      const target = glider.x - dims.w * ANCHOR_X;
      cameraX += (target - cameraX) * (1 - Math.exp(-CAM_EASE * dt));
      paint();

      if (reason) {
        ended = true;
        raf = 0;
        onEnd(reason, distanceKm(glider));
      } else {
        raf = requestAnimationFrame(frame);
      }
    }

    function start() {
      if (raf || ended || reduceQuery.matches) return;
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
  }, [locale, onEnd]);

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full touch-none"
      aria-hidden
    />
  );
}
