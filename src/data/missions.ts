import type { ExperienceLandmark, Mission, MissionId } from "@/types";

/**
 * The journey timeline. Every mission owns a contiguous slice of the global
 * progress value (0..1) that the scroll system drives. Ranges must stay sorted
 * and contiguous — `missionAt()` relies on it.
 */
export const missions: Mission[] = [
  {
    id: "intro",
    index: "00",
    title: "Ignition",
    district: "Departure",
    start: 0,
    end: 0.06,
    xp: 0,
    camera: "cinematic",
  },
  {
    id: "team",
    index: "01",
    title: "The Team",
    district: "Headquarters",
    start: 0.06,
    end: 0.22,
    xp: 240,
    camera: "destination",
  },
  {
    id: "experience",
    index: "02",
    title: "Experience",
    district: "Experience District",
    start: 0.22,
    end: 0.4,
    xp: 320,
    camera: "follow",
  },
  {
    id: "projects",
    index: "03",
    title: "Projects",
    district: "Project District",
    start: 0.4,
    end: 0.66,
    xp: 400,
    camera: "showcase",
  },
  {
    id: "services",
    index: "04",
    title: "Services",
    district: "The Interchange",
    start: 0.66,
    end: 0.8,
    xp: 180,
    camera: "orbit",
  },
  {
    id: "process",
    index: "05",
    title: "How We Work",
    district: "Delivery Route",
    start: 0.8,
    end: 0.93,
    xp: 100,
    camera: "follow",
  },
  {
    id: "final",
    index: "06",
    title: "Start A Project",
    district: "Destination",
    start: 0.93,
    end: 1.0001,
    xp: 0,
    camera: "destination",
  },
];

export const missionById = (id: MissionId): Mission =>
  missions.find((m) => m.id === id) ?? missions[0];

/** Resolve the active mission for a global progress value. */
export function missionAt(progress: number): Mission {
  const p = Math.min(Math.max(progress, 0), 1);
  for (let i = missions.length - 1; i >= 0; i--) {
    if (p >= missions[i].start) return missions[i];
  }
  return missions[0];
}

/** 0..1 progress *within* the given mission. */
export function localProgress(mission: Mission, progress: number): number {
  const span = mission.end - mission.start;
  if (span <= 0) return 0;
  return Math.min(Math.max((progress - mission.start) / span, 0), 1);
}

/** Cumulative XP for every mission entered so far. Cosmetic only. */
export function xpAt(progress: number): number {
  let xp = 0;
  for (const m of missions) {
    if (progress >= m.start) xp += m.xp;
  }
  // Partial credit inside the active mission so the counter keeps moving.
  const active = missionAt(progress);
  const next = missions[missions.indexOf(active) + 1];
  if (next) xp += Math.round(localProgress(active, progress) * next.xp * 0.4);
  return xp;
}

/** Timeline positions where each project case study opens. */
export const projectStops: number[] = [0.435, 0.5, 0.565, 0.63];

/** Timeline positions for the five delivery checkpoints. */
export const processStops: number[] = [0.81, 0.835, 0.86, 0.885, 0.91];

/** Timeline position where the service interchange offers a route choice. */
export const serviceChoiceAt = 0.71;

export const experienceLandmarks: ExperienceLandmark[] = [
  {
    id: "mnc",
    label: "Enterprise",
    detail:
      "Years spent inside large engineering organisations: review processes, compliance constraints and systems with real users attached.",
    accent: "#7DA3FF",
    at: 0.25,
  },
  {
    id: "web3",
    label: "Web3",
    detail:
      "Contracts written, audited and deployed. Indexers, wallets and the operational care that on-chain work demands.",
    accent: "#C9A7FF",
    at: 0.29,
  },
  {
    id: "startup",
    label: "Product",
    detail:
      "Zero-to-one product development under time pressure, where scope decisions matter more than architecture diagrams.",
    accent: "#8FE3C4",
    at: 0.33,
  },
  {
    id: "production",
    label: "Production",
    detail:
      "On-call rotations, incident reviews and migrations run without downtime. We have operated what we built.",
    accent: "#FFC48F",
    at: 0.37,
  },
];
