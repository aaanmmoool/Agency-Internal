import * as THREE from "three";
import type { QualitySettings } from "@/config/quality";
import {
  BRIDGE_RANGE,
  CHECKPOINT_ANCHORS,
  DISTRICT_BANDS,
  FINAL_BUILDING,
  HQ,
  INTERCHANGE,
  PROJECT_ANCHORS,
  type Anchor,
} from "@/config/world";
import { ROAD_HALF_WIDTH, SIDEWALK_WIDTH, headingAt, offsetPoint, pointAt } from "./route";
import { routeT } from "./timeline";
import { seeded } from "./math";

/**
 * Deterministic world layout.
 *
 * Runs once per quality tier and returns plain transform arrays that feed
 * InstancedMesh. Nothing here allocates during the render loop, and the seed
 * keeps the city identical between reloads.
 */

export interface Transform {
  position: THREE.Vector3;
  rotationY: number;
  scale: THREE.Vector3;
}

export interface WorldData {
  buildings: Transform[];
  windows: Transform[];
  trees: Transform[];
  streetLights: Transform[];
  signs: Transform[];
  barriers: Transform[];
}

const EDGE = ROAD_HALF_WIDTH + SIDEWALK_WIDTH;
/** Anchors that own their patch of ground — generated buildings keep clear. */
const RESERVED: Anchor[] = [HQ, ...PROJECT_ANCHORS, INTERCHANGE, FINAL_BUILDING];

function isReserved(t: number, lateral: number): boolean {
  for (const r of RESERVED) {
    if (Math.abs(t - r.at) < 0.028 && Math.sign(r.lateral || 1) === Math.sign(lateral)) {
      return true;
    }
  }
  // Keep the bridge span and the checkpoint gantries clear of clutter.
  if (t > BRIDGE_RANGE[0] - 0.012 && t < BRIDGE_RANGE[1] + 0.012) return true;
  for (const c of CHECKPOINT_ANCHORS) {
    if (Math.abs(t - c.at) < 0.006) return true;
  }
  return false;
}

/** Pick a scroll position weighted by the district density table. */
function sampleT(rand: () => number): number {
  for (let attempt = 0; attempt < 8; attempt++) {
    const t = rand();
    const band = DISTRICT_BANDS.find((b) => t >= b.from && t < b.to);
    if (!band || rand() < band.density) return t;
  }
  return rand();
}

export function generateWorld(quality: QualitySettings): WorldData {
  const rand = seeded(20260920);
  const { counts } = quality;

  const buildings: Transform[] = [];
  const windows: Transform[] = [];
  const trees: Transform[] = [];
  const streetLights: Transform[] = [];
  const signs: Transform[] = [];
  const barriers: Transform[] = [];

  // --- Buildings ----------------------------------------------------------
  let guard = 0;
  while (buildings.length < counts.buildings && guard++ < counts.buildings * 12) {
    const t = sampleT(rand);
    const side = rand() < 0.5 ? -1 : 1;
    const depthOut = 7 + rand() * 34;
    const lateral = side * (EDGE + 4 + depthOut);
    if (isReserved(t, lateral)) continue;

    const width = 5 + rand() * 11;
    const depth = 5 + rand() * 11;
    // Taller towers cluster in the project and headquarters districts.
    const districtBoost = t > 0.4 && t < 0.66 ? 1.5 : t < 0.22 ? 1.25 : 1;
    const height = (5 + Math.pow(rand(), 1.9) * 34) * districtBoost;

    const rt = routeT(t);
    const position = offsetPoint(rt, lateral, height / 2);
    const rotationY = headingAt(rt) + (rand() - 0.5) * 0.24;

    buildings.push({
      position,
      rotationY,
      scale: new THREE.Vector3(width, height, depth),
    });

    // --- Windows: a grid on the road-facing wall of some buildings ---------
    if (windows.length >= counts.windows || rand() > 0.52) continue;

    const cols = Math.max(2, Math.floor(width / 2.4));
    const rows = Math.max(2, Math.floor(height / 3.1));
    const faceSign = -side; // the wall that looks back at the road
    const forward = new THREE.Vector3(Math.sin(rotationY), 0, Math.cos(rotationY));
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));

    for (let r = 0; r < rows && windows.length < counts.windows; r++) {
      for (let c = 0; c < cols && windows.length < counts.windows; c++) {
        if (rand() > 0.34) continue; // most windows stay dark
        const u = (c + 0.5) / cols - 0.5;
        const vY = (r + 0.5) / rows - 0.5;
        const p = position
          .clone()
          .addScaledVector(right, u * width * 0.82)
          .addScaledVector(forward, (faceSign * depth) / 2 + faceSign * 0.06);
        p.y += vY * height * 0.86;
        windows.push({
          position: p,
          rotationY: rotationY + (faceSign > 0 ? 0 : Math.PI),
          scale: new THREE.Vector3(1.0 + rand() * 0.5, 0.62 + rand() * 0.3, 1),
        });
      }
    }
  }

  // --- Trees --------------------------------------------------------------
  for (let i = 0; i < counts.trees; i++) {
    const t = (i + 0.5) / counts.trees;
    const side = i % 2 === 0 ? 1 : -1;
    if (t > BRIDGE_RANGE[0] && t < BRIDGE_RANGE[1]) continue;
    const jitter = (rand() - 0.5) * 0.004;
    const rt = routeT(Math.min(Math.max(t + jitter, 0), 1));
    const scale = 0.8 + rand() * 0.6;
    trees.push({
      position: offsetPoint(rt, side * (EDGE + 1.1 + rand() * 1.4), 0),
      rotationY: rand() * Math.PI * 2,
      scale: new THREE.Vector3(scale, scale * (0.85 + rand() * 0.4), scale),
    });
  }

  // --- Street lights ------------------------------------------------------
  for (let i = 0; i < counts.streetLights; i++) {
    const t = (i + 0.5) / counts.streetLights;
    const side = i % 2 === 0 ? -1 : 1;
    const rt = routeT(t);
    streetLights.push({
      position: offsetPoint(rt, side * (ROAD_HALF_WIDTH + SIDEWALK_WIDTH - 0.5), 0),
      // The arm reaches over the carriageway, so lights mirror by side.
      rotationY: headingAt(rt) + (side < 0 ? 0 : Math.PI),
      scale: new THREE.Vector3(1, 1, 1),
    });
  }

  // --- Signs --------------------------------------------------------------
  for (let i = 0; i < counts.signs; i++) {
    const t = (i + 0.5) / counts.signs;
    const side = rand() < 0.5 ? -1 : 1;
    const rt = routeT(t);
    signs.push({
      position: offsetPoint(rt, side * (EDGE + 0.6), 0),
      // Panel faces back across the carriageway.
      rotationY: headingAt(rt) + (side < 0 ? -Math.PI / 2 : Math.PI / 2),
      scale: new THREE.Vector3(1, 0.9 + rand() * 0.3, 1),
    });
  }

  // --- Bridge barriers ----------------------------------------------------
  if (counts.barriers > 0) {
    const [from, to] = BRIDGE_RANGE;
    for (let i = 0; i < counts.barriers; i++) {
      const f = i / (counts.barriers - 1);
      const t = from + f * (to - from);
      const side = i % 2 === 0 ? -1 : 1;
      const rt = routeT(t);
      barriers.push({
        position: offsetPoint(rt, side * (ROAD_HALF_WIDTH + 0.5), 0.45),
        rotationY: headingAt(rt),
        scale: new THREE.Vector3(1, 1, 1),
      });
    }
  }

  return { buildings, windows, trees, streetLights, signs, barriers };
}

/** Bridge pillar positions, spaced along the elevated span. */
export function bridgePillars(count = 7): { position: THREE.Vector3; height: number }[] {
  const [from, to] = BRIDGE_RANGE;
  const out: { position: THREE.Vector3; height: number }[] = [];
  const p = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const t = from + ((i + 0.5) / count) * (to - from);
    const rt = routeT(t);
    pointAt(rt, p);
    if (p.y < 0.6) continue;
    out.push({ position: p.clone(), height: p.y });
  }
  return out;
}
