/**
 * Procedural world for Glide — currently the thermals that provide lift.
 *
 * Features are laid down left-to-right ahead of the camera and culled once
 * well behind it, so the world is effectively endless at constant memory.
 * Thermals are stored with a fractional Y (0..1 of viewport height) so they
 * keep their relative position across window resizes; the absolute screen Y is
 * derived at use time.
 *
 * Lift model: while circling (turning) within a thermal's radius and below its
 * top, climb is the reliable `strength × taper`. Flying straight through gives
 * only a weaker, core-weighted gaussian (× 0.6), so steady circling pays off.
 * Rivers and thunderstorms slot into this generator in a later step.
 */
import { GLIDE } from "./config";
import type { Glider } from "./engine";

export type Thermal = {
  /** World X in px. */
  x: number;
  /** Centre Y as a fraction of viewport height. */
  yFrac: number;
  /** Radius in px. */
  r: number;
  /** Core climb in alt-units/second. */
  strength: number;
  /** Altitude fraction the climb tapers out at. */
  top: number;
};

export type World = {
  thermals: Thermal[];
  /** World X at which the next feature will be placed. */
  nextX: number;
};

/** The lift sampled this frame plus the thermal responsible (for rendering). */
export type Lift = { value: number; active: Thermal | null };

/** Pre-spawn / cull margin beyond the viewport, in px. */
const SPAWN_BUFFER = 600;
/** Altitude band over which climb tapers to zero approaching a thermal's top. */
const TAPER_BAND = 0.1;

function spawnThermal(x: number): Thermal {
  const s = GLIDE.spawn;
  return {
    x,
    yFrac: 0.15 + Math.random() * 0.7,
    r: s.radiusBase + Math.random() * s.radiusRand,
    strength: s.strengthBase + Math.random() * s.strengthRand,
    top: s.topBase + Math.random() * s.topRand,
  };
}

/** Fresh world with the first thermal a short way ahead of the launch point. */
export function createWorld(): World {
  return { thermals: [], nextX: 300 };
}

/** Spawns features up to the look-ahead horizon and culls those left behind. */
export function updateWorld(world: World, cameraX: number, viewW: number): void {
  const right = cameraX + viewW + SPAWN_BUFFER;
  while (world.nextX < right) {
    world.thermals.push(spawnThermal(world.nextX));
    world.nextX += GLIDE.spawn.gapBase + Math.random() * GLIDE.spawn.gapRand;
  }
  const left = cameraX - SPAWN_BUFFER;
  if (world.thermals.length && world.thermals[0].x < left) {
    world.thermals = world.thermals.filter((t) => t.x > left);
  }
}

/**
 * Samples lift at the glider's position. Returns the strongest-placed (nearest)
 * qualifying thermal as `active` for the ring/core-dot overlay.
 *
 * @param turning Whether the glider is turning this frame (enables full climb).
 */
export function liftAt(
  world: World,
  g: Glider,
  viewH: number,
  turning: boolean,
): Lift {
  let active: Thermal | null = null;
  let value = 0;
  let bestDist = Infinity;

  for (const t of world.thermals) {
    if (g.alt >= t.top) continue;
    const ty = t.yFrac * viewH;
    const dist = Math.hypot(g.x - t.x, g.y - ty);
    if (dist > t.r) continue;

    const taper = Math.min(1, (t.top - g.alt) / TAPER_BAND);
    let lift: number;
    if (turning) {
      lift = t.strength * taper;
    } else {
      const sigma = t.r * 0.5;
      const gauss = Math.exp(-(dist * dist) / (2 * sigma * sigma));
      lift = t.strength * taper * gauss * 0.6;
    }

    if (dist < bestDist) {
      bestDist = dist;
      active = t;
      value = lift;
    }
  }

  return { value, active };
}
