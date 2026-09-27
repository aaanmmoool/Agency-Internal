import { experienceLandmarks, processStops, projectStops, serviceChoiceAt } from "@/data/missions";
import { clamp } from "./math";

/**
 * Maps scroll progress to position along the route.
 *
 * Scroll is linear, but the car should ease off at each destination. Instead of
 * tweening speed ad hoc (which desynchronises the world from the timeline), we
 * define a speed profile over the whole journey and integrate it once into a
 * lookup table. Everything that needs a world position — car, camera, buildings,
 * markers — calls `routeT()`, so the world stays perfectly consistent.
 */

/** Points where the car eases off, with the strength and width of each slowdown. */
const SLOWDOWNS: { at: number; strength: number; width: number }[] = [
  { at: 0.13, strength: 0.62, width: 0.03 }, // headquarters
  ...experienceLandmarks.map((l) => ({ at: l.at, strength: 0.5, width: 0.012 })),
  ...projectStops.map((at) => ({ at, strength: 0.7, width: 0.02 })),
  { at: serviceChoiceAt, strength: 0.68, width: 0.028 }, // interchange
  ...processStops.map((at) => ({ at, strength: 0.4, width: 0.009 })),
  { at: 0.978, strength: 0.8, width: 0.024 }, // final destination
];

const SAMPLES = 1024;
const MIN_SPEED = 0.22;

/** Relative travel speed at scroll position `p`, in 0..1. */
export function speedProfile(p: number): number {
  let speed = 1;
  for (const s of SLOWDOWNS) {
    const d = (p - s.at) / s.width;
    speed -= s.strength * Math.exp(-d * d);
  }
  return Math.max(speed, MIN_SPEED);
}

const AVERAGE_SPEED = (() => {
  let total = 0;
  for (let i = 0; i < SAMPLES; i++) total += speedProfile((i + 0.5) / SAMPLES);
  return total / SAMPLES;
})();

/** Cumulative integral of the speed profile, normalised to 0..1. */
const table = (() => {
  const cumulative = new Float32Array(SAMPLES + 1);
  let total = 0;
  for (let i = 0; i < SAMPLES; i++) {
    total += speedProfile((i + 0.5) / SAMPLES);
    cumulative[i + 1] = total;
  }
  for (let i = 0; i <= SAMPLES; i++) cumulative[i] /= total;
  return cumulative;
})();

/** Scroll progress -> normalised distance along the route. */
export function routeT(progress: number): number {
  const p = clamp(progress) * SAMPLES;
  const i = Math.min(Math.floor(p), SAMPLES - 1);
  const f = p - i;
  return table[i] + (table[i + 1] - table[i]) * f;
}

/**
 * Derivative of `routeT` at `p`: how fast the car actually moves for a given
 * scroll rate. 1 is cruising speed, near 0 is a full stop at a destination.
 */
export function routeSpeed(progress: number): number {
  return speedProfile(clamp(progress)) / AVERAGE_SPEED;
}
