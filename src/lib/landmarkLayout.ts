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
  SERVICE_CARD_AHEAD,
  type Anchor,
} from "@/config/world";
import {
  experienceLandmarks,
  processStops,
  projectStops,
  serviceHold,
  serviceStops,
} from "@/data/missions";
import { smoothstep } from "./math";
import { ROUTE_LENGTH, headingAt, offsetPoint } from "./route";
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
  /** Each card stands in the road a little ahead of where the car waits for it. */
  serviceCards: serviceStops.map((at) => onRoad({ at, lateral: 0 }, SERVICE_CARD_AHEAD)),
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
  /** The camera never reads this board from closer than this, in metres. */
  minStandOff?: number;
}

export const BOARDS = {
  /** Over the HQ glass core, clear of the entrance canopy. */
  hq: { width: 16, height: 9.6, center: [0, 10.9, 4.96] },
  experience: { width: 6.2, height: 5, center: [0, 4.1, 1.8] },
  /** The lower part of each tower's glass curtain, under the tower's name. */
  project: { width: 9.6, height: 15, center: [0, 11, 5.5] },
  /**
   * A service card standing across the road, facing the car. Read from far
   * enough back that the waiting car stays in the bottom of the shot.
   */
  serviceCard: {
    width: 9.6,
    height: 5.8,
    center: [0, 3.4, -0.14],
    back: true,
    eyeHeight: 4.6,
    minStandOff: SERVICE_CARD_AHEAD * 2,
  },
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

// ---------------------------------------------------------------------------
// Service cards: they rise out of the road before the car arrives, stand in its
// way, and each one sinks back into the road as the visitor scrolls past it.

const SERVICE_SLOT = (serviceHold[1] - serviceHold[0]) / serviceStops.length;
/** Scroll distance over which one card rises out of the road. */
const CARD_RISE = 0.014;
/** Scroll gap between one card starting to rise and the next. */
const CARD_STAGGER = 0.003;
/** Each card behind the front one stands this much higher, so the stack shows. */
const CARD_STEP_UP = 0.4;

/** The board placement of card `index`, raised for its place in the stack. */
export function serviceCardBoard(index: number): BoardPlacement {
  const b = BOARDS.serviceCard;
  return { ...b, center: [b.center[0], b.center[1] + index * CARD_STEP_UP, b.center[2]] };
}

/** 0..1: how far card `index` has risen out of the road at scroll `p`. */
export function serviceCardUp(index: number, p: number): number {
  const lastDone = serviceHold[0] - 0.004;
  const start = lastDone - CARD_RISE - (serviceStops.length - 1 - index) * CARD_STAGGER;
  return smoothstep((p - start) / CARD_RISE);
}

/** 0..1: how far card `index` has sunk away once the visitor scrolls past it. */
export function serviceCardGone(index: number, p: number): number {
  const from = serviceStops[index] + SERVICE_SLOT * 0.15;
  return smoothstep((p - from) / (SERVICE_SLOT * 0.35));
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
  /** Closest the camera may stand to the board. */
  minDistance: number;
  /**
   * Scroll range over which the camera slides from the board's left edge to
   * its right, when the screen is too narrow to show all of it at once.
   */
  slide: [number, number];
  width: number;
  height: number;
}

function view(
  frame: Frame,
  board: BoardPlacement,
  at: number,
  radius: number,
  slide: [number, number] = [at - radius / 2, at + radius / 2],
): Viewpoint {
  const normal = new THREE.Vector3(0, 0, board.back ? -1 : 1).applyAxisAngle(UP, frame.rotationY);
  return {
    at,
    radius,
    target: toWorld(frame, board.center),
    normal,
    across: new THREE.Vector3().crossVectors(normal, UP).negate(),
    lift: board.eyeHeight === undefined ? CAMERA.board.lift : board.eyeHeight - board.center[1],
    minDistance: board.minStandOff ?? 0,
    slide,
    width: board.width,
    height: board.height,
  };
}

export const VIEWPOINTS: Viewpoint[] = [
  view(FRAMES.hq, BOARDS.hq, HQ.at, 0.06),
  ...experienceLandmarks.map((l, i) => view(FRAMES.experience[i], BOARDS.experience, l.at, 0.02)),
  ...projectStops.map((at, i) => view(FRAMES.projects[i], BOARDS.project, at, 0.03)),
  // Each card is read while it stands; the shot moves on as it sinks away.
  ...serviceStops.map((at, i) =>
    view(FRAMES.serviceCards[i], serviceCardBoard(i), at, SERVICE_SLOT, [
      at - SERVICE_SLOT / 2,
      at + SERVICE_SLOT * 0.15,
    ]),
  ),
  ...processStops.map((at, i) => view(FRAMES.checkpoints[i], BOARDS.checkpoint, at, 0.012)),
  view(FRAMES.final, BOARDS.final, FINAL_BUILDING.at, 0.05),
];
