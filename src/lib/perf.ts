/**
 * Development-only performance telemetry.
 *
 * The sampler lives inside the render loop; the overlay is plain DOM outside
 * the canvas. They talk through this store so reading the numbers never causes
 * a React render inside the 3D tree. Excluded from production builds by a
 * `NODE_ENV` guard at both call sites.
 */

export interface PerfSample {
  fps: number;
  frameMs: number;
  drawCalls: number;
  triangles: number;
  programs: number;
  geometries: number;
  textures: number;
  /** Rough texture memory estimate in MB, when the renderer exposes it. */
  textureMB: number;
  /** Milliseconds from navigation start to the world becoming interactive. */
  loadMs: number;
}

const empty: PerfSample = {
  fps: 0,
  frameMs: 0,
  drawCalls: 0,
  triangles: 0,
  programs: 0,
  geometries: 0,
  textures: 0,
  textureMB: 0,
  loadMs: 0,
};

let sample: PerfSample = empty;
const listeners = new Set<() => void>();

export function pushSample(next: PerfSample): void {
  sample = next;
  for (const fn of listeners) fn();
}

export const subscribePerf = (fn: () => void): (() => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const getPerfSample = (): PerfSample => sample;
export const getPerfServerSample = (): PerfSample => empty;

let loadMs = 0;
/** Called once when the world first becomes interactive. */
export function recordLoadTime(): void {
  if (loadMs > 0 || typeof performance === "undefined") return;
  loadMs = Math.round(performance.now());
}
export const getLoadMs = (): number => loadMs;
