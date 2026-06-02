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
 *
 * Two hazards share the same left-to-right generator: sink rivers (meandering
 * vertical bands of strong sink) and thunderstorms (big dark clouds that end
 * the flight on contact). Each spawn point rolls a type by the configured
 * storm/river chances, defaulting to a thermal.
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

/** A sink river: a near-vertical band whose centre meanders with screen Y. */
export type River = {
  /** Base world X of the band centre in px. */
  x: number;
  /** Full band width in px. */
  width: number;
  /** Phase offset so each river meanders independently. */
  phase: number;
};

/** A thunderstorm: a big dark cloud; entering its core ends the flight. */
export type Storm = {
  /** World X in px. */
  x: number;
  /** Centre Y as a fraction of viewport height. */
  yFrac: number;
  /** Radius in px. */
  r: number;
  /** Per-storm offset so lightning flashes are out of sync. */
  flashOffset: number;
  /** Pre-generated jagged bolt, points relative to the storm centre. */
  bolt: { x: number; y: number }[];
};

export type World = {
  thermals: Thermal[];
  rivers: River[];
  storms: Storm[];
  /** World X at which the next feature will be placed. */
  nextX: number;
};

/** The lift sampled this frame plus the thermal responsible (for rendering). */
export type Lift = { value: number; active: Thermal | null };

/** Pre-spawn / cull margin beyond the viewport, in px. */
const SPAWN_BUFFER = 600;
/** Altitude band over which climb tapers to zero approaching a thermal's top. */
const TAPER_BAND = 0.1;
/** Sink-river band width in px. */
const RIVER_WIDTH = 72;
/** River meander frequency, in radians per px of screen Y. */
const RIVER_FREQ = 0.012;
/** Fraction of a storm's radius that counts as a fatal hit. */
const STORM_HIT = 0.82;

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

function spawnRiver(x: number): River {
  return { x, width: RIVER_WIDTH, phase: Math.random() * Math.PI * 2 };
}

/** Builds a jagged top-to-bottom bolt within the storm's radius. */
function spawnBolt(r: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    pts.push({
      x: (Math.random() - 0.5) * r * 0.5,
      y: -r * 0.55 + f * r * 1.15,
    });
  }
  return pts;
}

function spawnStorm(x: number): Storm {
  const s = GLIDE.spawn;
  const r = (s.radiusBase + Math.random() * s.radiusRand) * 1.15;
  return {
    x,
    yFrac: 0.2 + Math.random() * 0.6,
    r,
    flashOffset: Math.random() * 2,
    bolt: spawnBolt(r),
  };
}

/** Fresh world with the first thermal a short way ahead of the launch point. */
export function createWorld(): World {
  return { thermals: [], rivers: [], storms: [], nextX: 300 };
}

/** Spawns features up to the look-ahead horizon and culls those left behind.
 *  Each spawn point rolls a type: storm, then river, else thermal. */
export function updateWorld(world: World, cameraX: number, viewW: number): void {
  const right = cameraX + viewW + SPAWN_BUFFER;
  const { spawn } = GLIDE;
  while (world.nextX < right) {
    const roll = Math.random();
    if (roll < spawn.stormChance) {
      world.storms.push(spawnStorm(world.nextX));
    } else if (roll < spawn.stormChance + spawn.riverChance) {
      world.rivers.push(spawnRiver(world.nextX));
    } else {
      world.thermals.push(spawnThermal(world.nextX));
    }
    world.nextX += spawn.gapBase + Math.random() * spawn.gapRand;
  }

  const left = cameraX - SPAWN_BUFFER;
  if (world.thermals.length && world.thermals[0].x < left) {
    world.thermals = world.thermals.filter((t) => t.x > left);
  }
  if (world.rivers.length && world.rivers[0].x + world.rivers[0].width < left) {
    world.rivers = world.rivers.filter((r) => r.x + r.width > left);
  }
  if (world.storms.length && world.storms[0].x + world.storms[0].r < left) {
    world.storms = world.storms.filter((s) => s.x + s.r > left);
  }
}

/** World X of a river's meandering centre at a given screen Y. */
export function riverCenterX(river: River, y: number): number {
  return river.x + GLIDE.RIVER_AMP * Math.sin(y * RIVER_FREQ + river.phase);
}

/** Total extra sink (alt-units/second) from any rivers the glider is inside. */
export function riverSinkAt(world: World, g: Glider): number {
  let sink = 0;
  for (const r of world.rivers) {
    if (Math.abs(g.x - riverCenterX(r, g.y)) < r.width / 2) {
      sink += GLIDE.RIVER_SINK;
    }
  }
  return sink;
}

/** True if the glider has entered a thunderstorm's fatal core. */
export function stormHit(world: World, g: Glider, viewH: number): boolean {
  for (const s of world.storms) {
    const sy = s.yFrac * viewH;
    if (Math.hypot(g.x - s.x, g.y - sy) < s.r * STORM_HIT) return true;
  }
  return false;
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
