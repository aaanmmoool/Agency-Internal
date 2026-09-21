import type { MissionId } from "@/types";
import { experienceLandmarks, missionAt, missions, processStops, projectStops, serviceChoiceAt, xpAt } from "@/data/missions";
import { clamp } from "./math";

/**
 * Centralised journey state.
 *
 * `mutable` is read every frame inside the render loop and is deliberately NOT
 * React state — writing to it never re-renders anything. React subscribes to
 * `snapshot`, which is only republished when a *discrete* value changes
 * (mission, open panel, rounded XP), so the HUD updates a few times per journey
 * rather than sixty times per second.
 */

export type Phase = "loading" | "landing" | "driving";

export interface JourneyMutable {
  /** Raw scroll-driven target, 0..1. */
  target: number;
  /** Damped value the 3D world actually follows. */
  smooth: number;
  /** d(smooth)/dt, normalised — drives wheel spin, brake lights and camera lag. */
  velocity: number;
  /** True while the journey is meaningfully in motion. */
  moving: boolean;
  phase: Phase;
  /** Set when a service route is picked at the interchange. */
  selectedService: string | null;
  /** Elapsed seconds since the mission started; used for ambient motion. */
  elapsed: number;
}

export const mutable: JourneyMutable = {
  target: 0,
  smooth: 0,
  velocity: 0,
  moving: false,
  phase: "loading",
  selectedService: null,
  elapsed: 0,
};

/**
 * XP is quantised before it reaches React. Left raw it would change on every
 * frame of a scroll and re-render the HUD sixty times a second; rounded, the
 * counter still climbs visibly but publishes a couple of hundred times across
 * the whole journey.
 */
const XP_STEP = 10;

export interface JourneySnapshot {
  phase: Phase;
  missionId: MissionId;
  missionIndex: string;
  missionTitle: string;
  district: string;
  /** Rounded to whole percent — this is what the HUD renders. */
  percent: number;
  xp: number;
  /** Index into `projects`, or -1 when no case study is open. */
  activeProject: number;
  /** Index into `processSteps`, or -1. */
  activeStep: number;
  /** Id from `experienceLandmarks`, or null. */
  activeLandmark: string | null;
  serviceChoiceOpen: boolean;
  selectedService: string | null;
  complete: boolean;
}

const PROJECT_WINDOW = 0.026;
const PROCESS_WINDOW = 0.014;
const LANDMARK_WINDOW = 0.022;
const SERVICE_WINDOW = 0.05;

function nearestIndex(p: number, stops: number[], window: number): number {
  let best = -1;
  let bestD = window;
  for (let i = 0; i < stops.length; i++) {
    const d = Math.abs(p - stops[i]);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

function computeSnapshot(): JourneySnapshot {
  const p = clamp(mutable.smooth);
  const mission = missionAt(p);
  const landmark = experienceLandmarks.find((l) => Math.abs(p - l.at) < LANDMARK_WINDOW);
  return {
    phase: mutable.phase,
    missionId: mission.id,
    missionIndex: mission.index,
    missionTitle: mission.title,
    district: mission.district,
    percent: Math.round(p * 100),
    xp: Math.round(xpAt(p) / XP_STEP) * XP_STEP,
    activeProject: mission.id === "projects" ? nearestIndex(p, projectStops, PROJECT_WINDOW) : -1,
    activeStep: mission.id === "process" ? nearestIndex(p, processStops, PROCESS_WINDOW) : -1,
    activeLandmark: mission.id === "experience" && landmark ? landmark.id : null,
    serviceChoiceOpen: Math.abs(p - serviceChoiceAt) < SERVICE_WINDOW,
    selectedService: mutable.selectedService,
    complete: p > 0.985,
  };
}

let snapshot: JourneySnapshot = computeSnapshot();
const listeners = new Set<() => void>();

function changed(a: JourneySnapshot, b: JourneySnapshot): boolean {
  return (
    a.phase !== b.phase ||
    a.missionId !== b.missionId ||
    a.percent !== b.percent ||
    a.xp !== b.xp ||
    a.activeProject !== b.activeProject ||
    a.activeStep !== b.activeStep ||
    a.activeLandmark !== b.activeLandmark ||
    a.serviceChoiceOpen !== b.serviceChoiceOpen ||
    a.selectedService !== b.selectedService ||
    a.complete !== b.complete
  );
}

/** Recompute and notify React only if something discrete actually moved. */
export function publish(): void {
  const next = computeSnapshot();
  if (!changed(snapshot, next)) return;
  snapshot = next;
  for (const fn of listeners) fn();
}

export const subscribe = (fn: () => void): (() => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const getSnapshot = (): JourneySnapshot => snapshot;

/** Server render uses the pristine first frame — no scroll has happened yet. */
const serverSnapshot: JourneySnapshot = computeSnapshot();
export const getServerSnapshot = (): JourneySnapshot => serverSnapshot;

export function setPhase(phase: Phase): void {
  if (mutable.phase === phase) return;
  mutable.phase = phase;
  publish();
}

export function setSelectedService(id: string | null): void {
  mutable.selectedService = id;
  publish();
}

/** Jump the journey to a timeline position (used by keyboard and skip links). */
export function requestProgress(t: number): void {
  mutable.target = clamp(t);
}

/** Timeline position at the start of a mission, for keyboard navigation. */
export function missionStart(id: MissionId): number {
  const m = missions.find((x) => x.id === id);
  // Nudge past the boundary so the mission reads as active immediately.
  return m ? clamp(m.start + 0.004) : 0;
}

export function resetJourney(): void {
  mutable.target = 0;
  mutable.smooth = 0;
  mutable.velocity = 0;
  mutable.moving = false;
  mutable.selectedService = null;
  mutable.elapsed = 0;
  publish();
}
