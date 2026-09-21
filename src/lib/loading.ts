/**
 * Loading progress, driven by real readiness signals.
 *
 * Each scene chunk calls `markReady` when it has mounted and its GPU resources
 * exist. The loading screen reflects actual state rather than a timer, so it
 * never claims to be finished before the world is there — or lingers after.
 */

export type LoadStep = "environment" | "world" | "car" | "projects";

export const LOAD_STEPS: { id: LoadStep; label: string }[] = [
  { id: "environment", label: "ENVIRONMENT" },
  { id: "world", label: "WORLD" },
  { id: "car", label: "CAR" },
  { id: "projects", label: "PROJECTS" },
];

/** Steps needed before the experience is usable; `projects` streams in after. */
const CRITICAL: LoadStep[] = ["environment", "world", "car"];

const done = new Set<LoadStep>();
const listeners = new Set<() => void>();

export interface LoadSnapshot {
  ready: LoadStep[];
  /** 0..1 across every step. */
  progress: number;
  /** True once the critical steps are done and the world can be entered. */
  interactive: boolean;
}

let snapshot: LoadSnapshot = { ready: [], progress: 0, interactive: false };

function rebuild(): void {
  const ready = LOAD_STEPS.map((s) => s.id).filter((id) => done.has(id));
  snapshot = {
    ready,
    progress: ready.length / LOAD_STEPS.length,
    interactive: CRITICAL.every((id) => done.has(id)),
  };
  for (const fn of listeners) fn();
}

export function markReady(step: LoadStep): void {
  if (done.has(step)) return;
  done.add(step);
  rebuild();
}

export const subscribeLoading = (fn: () => void): (() => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const getLoadSnapshot = (): LoadSnapshot => snapshot;

const serverSnapshot: LoadSnapshot = { ready: [], progress: 0, interactive: false };
export const getLoadServerSnapshot = (): LoadSnapshot => serverSnapshot;

/** Reset between hot reloads so the loader does not report stale completion. */
export function resetLoading(): void {
  done.clear();
  rebuild();
}
