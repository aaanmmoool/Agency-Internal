import type { MissionId } from "@/types";

/**
 * The road, as plain numbers.
 *
 * `lib/route.ts` turns these into the spline the whole 3D world is built on;
 * the text version draws its route map from the same list without loading
 * Three.js. Edit the waypoints here and both follow.
 */
export const WAYPOINTS: [number, number, number][] = [
  [0, 0, 96],
  [0, 0, 48],
  [1, 0, 12], // Mission 01 — headquarters
  [0, 0, -26],
  [-16, 0, -64], // Mission 02 — experience district
  [-24, 0, -106],
  [-13, 2.6, -144], // bridge rise
  [8, 5.2, -174], // bridge apex
  [32, 2.6, -200],
  [52, 0, -222], // Mission 03 — project district
  [72, 0, -250],
  [80, 0, -286],
  [67, 0, -320],
  [43, 0, -346],
  [15, 0, -362], // Mission 04 — interchange
  [-16, 0, -370],
  [-50, 0, -362], // Mission 05 — delivery route
  [-84, 0, -340],
  [-108, 0, -308],
  [-121, 0, -270],
  [-124, 0, -230],
  [-118, 0, -192], // Final — destination plaza
  [-110, 0, -164],
  [-106, 0, -144],
];

/** The waypoint each mission's district sits at, for the route map. */
export const MISSION_WAYPOINT: Record<Exclude<MissionId, "intro">, number> = {
  team: 2,
  experience: 4,
  projects: 9,
  services: 14,
  process: 16,
  final: 21,
};
