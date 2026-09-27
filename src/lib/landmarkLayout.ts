import * as THREE from "three";
import { CAMERA } from "@/config/scene";
import {
  CHECKPOINT_ANCHORS,
  CHECKPOINT_LEAD,
  FINAL_BUILDING,
  HQ,
  INTERCHANGE,
  LANDMARK_ANCHORS,
  PROJECT_ANCHORS,
  SERVICE_GATE_AHEAD,
  SERVICE_SPREAD,
  type Anchor,
} from "@/config/world";
import { experienceLandmarks, processStops, projectStops, serviceChoiceAt } from "@/data/missions";
import { ROUTE_LENGTH, headingAt, offsetPoint, tangentAt } from "./route";
import { routeT } from "./timeline";

/**
 * Where every landmark and every facade board sits, resolved once.
 *
 * The buildings are drawn from these frames and the camera frames the boards
 * from the same numbers, so a board can never be moved without the shot that
 * reads it moving too.
 */

const UP = new THREE.Vector3(0, 1, 0);

export interface Frame {
  position: THREE.Vector3;
  rotationY: number;
}

/**
 * Rotation that turns a structure's +Z face towards the carriageway.
 *
 * A heading rotation points local +Z along the direction of travel, so a
 * structure on the right turns a quarter anticlockwise to look back across the
 * road, and one on the left turns clockwise.
 */
export function facingRoad(heading: number, lateral: number): number {
  return heading + (lateral < 0 ? -Math.PI / 2 : Math.PI / 2);
}

/**
 * A roadside structure facing the road. `turn` swings it further round to face
 * oncoming traffic, which is what makes a facade readable on the approach.
 */
function roadside(anchor: Anchor, turn = 0): Frame {
  const rt = routeT(anchor.at);
  return {
    position: offsetPoint(rt, anchor.lateral, 0),
    rotationY: facingRoad(headingAt(rt), anchor.lateral) + Math.sign(anchor.lateral) * turn,
  };
}

/** A structure on the road itself, aligned with travel. `lead` is in metres. */
function onRoad(anchor: Anchor, lead = 0): Frame {
  const rt = Math.min(routeT(anchor.at) + lead / ROUTE_LENGTH, 1);
  return { position: offsetPoint(rt, 0, 0), rotationY: headingAt(rt) };
}

/** A point in a frame's local space, in world space. */
export function toWorld(
  frame: Frame,
  local: readonly [number, number, number],
  target = new THREE.Vector3(),
): THREE.Vector3 {
  return target.set(local[0], local[1], local[2]).applyAxisAngle(UP, frame.rotationY).add(frame.position);
}

// ---------------------------------------------------------------------------
// Frames

/** How far the experience monoliths turn from the road towards oncoming traffic. */
const EXPERIENCE_TURN = 0.55;

export const FRAMES = {
  hq: roadside(HQ),
  experience: LANDMARK_ANCHORS.map((a) => roadside(a, EXPERIENCE_TURN)),
  projects: PROJECT_ANCHORS.map((a) => roadside(a)),
  interchange: onRoad(INTERCHANGE),
  checkpoints: CHECKPOINT_ANCHORS.map((a) => onRoad(a, CHECKPOINT_LEAD)),
  final: roadside(FINAL_BUILDING),
};

// ---------------------------------------------------------------------------
// Boards: size, and centre in the owning structure's local frame. A board faces
// local +Z unless `back` is set, in which case it faces -Z.

export interface BoardPlacement {
  width: number;
  height: number;
  center: readonly [number, number, number];
  back?: boolean;
  /**
   * Camera height, above the structure's base, for reading this board. Set it
   * where the chase camera has to pass the structure without meeting the
   * board; otherwise the camera sits just above the board's centre.
   */
  eyeHeight?: number;
}

export const BOARDS = {
  /** Over the HQ glass core, clear of the entrance canopy. */
  hq: { width: 16, height: 9.6, center: [0, 10.9, 4.96] },
  experience: { width: 6.2, height: 5, center: [0, 4.1, 1.8] },
  /** The lower part of each tower's glass curtain, under the tower's name. */
  project: { width: 9.6, height: 15, center: [0, 11, 5.5] },
  /**
   * Carried high over each service gate, facing the approach, so the chase
   * camera passes beneath it on the way through. Local to the gate.
   */
  service: { width: 9.6, height: 5.8, center: [0, 18.9, -0.18], back: true },
  /** Hung from each gantry, facing the approach, read from the chase camera's height. */
  checkpoint: {
    width: 12.4,
    height: 3.3,
    center: [0, 7, -0.3],
    back: true,
    eyeHeight: CAMERA.follow.up,
  },
  /** Over the destination entrance. */
  final: { width: 12.2, height: 8.4, center: [0, 9.2, 6.1] },
} satisfies Record<string, BoardPlacement>;

/**
 * A service gate's frame: across the interchange apron at the same signed
 * lateral offset the car steers to when that route is picked, ahead of centre.
 */
export function gateFrame(index: number): Frame {
  const rt = routeT(INTERCHANGE.at);
  const position = offsetPoint(rt, SERVICE_SPREAD[index], 0);
  position.addScaledVector(tangentAt(rt, new THREE.Vector3()), SERVICE_GATE_AHEAD);
  return { position, rotationY: FRAMES.interchange.rotationY };
}

// ---------------------------------------------------------------------------
// Viewpoints: where the camera stands to read each board.

export interface Viewpoint {
  /** Scroll position at which the shot is fully held. */
  at: number;
  /** Scroll distance over which the shot eases in and out. */
  radius: number;
  /** Board centre, world space. */
  target: THREE.Vector3;
  /** Unit vector from the board towards its reader. */
  normal: THREE.Vector3;
  /** Unit vector along the board, left to right as its reader sees it. */
  across: THREE.Vector3;
  /** Camera height relative to the board's centre. */
  lift: number;
  width: number;
  height: number;
}

function view(frame: Frame, board: BoardPlacement, at: number, radius: number): Viewpoint {
  const normal = new THREE.Vector3(0, 0, board.back ? -1 : 1).applyAxisAngle(UP, frame.rotationY);
  return {
    at,
    radius,
    target: toWorld(frame, board.center),
    normal,
    across: new THREE.Vector3().crossVectors(normal, UP).negate(),
    lift: board.eyeHeight === undefined ? CAMERA.board.lift : board.eyeHeight - board.center[1],
    width: board.width,
    height: board.height,
  };
}

/** Service boards are read one after another, panning across the interchange. */
const SERVICE_PAN_STEP = 0.009;

export const VIEWPOINTS: Viewpoint[] = [
  view(FRAMES.hq, BOARDS.hq, HQ.at, 0.06),
  ...experienceLandmarks.map((l, i) => view(FRAMES.experience[i], BOARDS.experience, l.at, 0.02)),
  ...projectStops.map((at, i) => view(FRAMES.projects[i], BOARDS.project, at, 0.03)),
  ...SERVICE_SPREAD.map((_, i) =>
    view(
      gateFrame(i),
      BOARDS.service,
      serviceChoiceAt + (i - (SERVICE_SPREAD.length - 1) / 2) * SERVICE_PAN_STEP,
      SERVICE_PAN_STEP * 1.25,
    ),
  ),
  ...processStops.map((at, i) => view(FRAMES.checkpoints[i], BOARDS.checkpoint, at, 0.012)),
  view(FRAMES.final, BOARDS.final, FINAL_BUILDING.at, 0.05),
];
