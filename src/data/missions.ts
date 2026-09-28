import type { ExperienceLandmark, Mission, MissionId } from "@/types";
import { services } from "./services";

const SERVICE_COUNT = services.length;

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
    camera: "follow",
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

/**
 * Scroll range where the service cards hold the car. The cards rise out of the
 * road on the approach, and the car only creeps while they stand in its way.
 */
export const serviceHold: [number, number] = [0.682, 0.782];

/** Where the car rests in front of each service card, one per service. */
export const serviceStops: number[] = Array.from({ length: SERVICE_COUNT }, (_, i) => {
  const [from, to] = serviceHold;
  return from + ((i + 0.5) * (to - from)) / SERVICE_COUNT;
});

export const experienceLandmarks: ExperienceLandmark[] = [
  {
    id: "mnc",
    label: "Enterprise",
    detail:
      "Two years inside FischerJordan and Highspot: code review, larger codebases and systems with real customers on them.",
    accent: "#7DA3FF",
    at: 0.25,
  },
  {
    id: "web3",
    label: "Web3",
    detail:
      "Escrow and sale contracts, Sign-In with Ethereum and encrypted delivery for an on-chain data marketplace, tested on Sepolia.",
    accent: "#C9A7FF",
    at: 0.29,
  },
  {
    id: "startup",
    label: "Product",
    detail:
      "Product work at a Europe-based startup, under time pressure, where scope decisions matter more than architecture diagrams.",
    accent: "#8FE3C4",
    at: 0.33,
  },
  {
    id: "production",
    label: "Production",
    detail:
      "Edunex runs in production for a school. We ship its deploys, run its migrations and fix what breaks. We operate what we build.",
    accent: "#FFC48F",
    at: 0.37,
  },
];
