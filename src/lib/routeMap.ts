import { MISSION_WAYPOINT, WAYPOINTS } from "@/config/waypoints";
import type { MissionId } from "@/types";

/**
 * A top-down drawing of the road, for the text version.
 *
 * Pure arithmetic over the same waypoints the 3D world is built from, with no
 * Three.js, so the static document stays light. The journey runs left to
 * right: world -Z becomes map X and world X becomes map Y.
 */

const PAD = 18;
const round = (n: number) => Math.round(n * 10) / 10;

const points = WAYPOINTS.map(([x, , z]) => [-z, x] as const);

const xs = points.map((p) => p[0]);
const ys = points.map((p) => p[1]);
const minX = Math.min(...xs) - PAD;
const minY = Math.min(...ys) - PAD;
const width = Math.max(...xs) + PAD - minX;
const height = Math.max(...ys) + PAD - minY;

export const ROUTE_MAP_VIEWBOX = `${round(minX)} ${round(minY)} ${round(width)} ${round(height)}`;

/** A Catmull-Rom curve through every waypoint, written as cubic Béziers. */
export const ROUTE_MAP_PATH = (() => {
  const at = (i: number) => points[Math.min(Math.max(i, 0), points.length - 1)];
  let d = `M ${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2[0])} ${round(p2[1])}`;
  }
  return d;
})();

export const ROUTE_MAP_START = { x: round(points[0][0]), y: round(points[0][1]) };

/** Where each mission's stop sits on the map. */
export function routeMapStop(id: Exclude<MissionId, "intro">): { x: number; y: number } {
  const [x, y] = points[MISSION_WAYPOINT[id]];
  return { x: round(x), y: round(y) };
}
