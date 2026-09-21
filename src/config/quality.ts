import type { QualityTier } from "@/types";

/**
 * Per-tier scene budget. Every count below feeds an InstancedMesh, so lowering
 * a number removes instances rather than React components or draw calls.
 */
export interface QualitySettings {
  tier: QualityTier;
  dpr: [number, number];
  antialias: boolean;
  shadows: boolean;
  shadowMapSize: number;
  /** Camera far plane, paired with fog for a clean horizon cutoff. */
  far: number;
  fogNear: number;
  fogFar: number;
  counts: {
    buildings: number;
    trees: number;
    streetLights: number;
    signs: number;
    barriers: number;
    windows: number;
  };
  /** Segments used for the road ribbon — the single biggest static mesh. */
  roadSegments: number;
  /** Enable the cheap additive headlight cone + brake glow sprites. */
  carEffects: boolean;
}

const HIGH: QualitySettings = {
  tier: "high",
  dpr: [1, 1.75],
  antialias: true,
  shadows: true,
  shadowMapSize: 1024,
  far: 420,
  fogNear: 90,
  fogFar: 340,
  counts: { buildings: 150, trees: 160, streetLights: 84, signs: 26, barriers: 190, windows: 900 },
  roadSegments: 900,
  carEffects: true,
};

const MEDIUM: QualitySettings = {
  tier: "medium",
  dpr: [1, 1.4],
  antialias: true,
  shadows: false,
  shadowMapSize: 512,
  far: 320,
  fogNear: 70,
  fogFar: 250,
  counts: { buildings: 96, trees: 90, streetLights: 52, signs: 22, barriers: 110, windows: 420 },
  roadSegments: 560,
  carEffects: true,
};

const LOW: QualitySettings = {
  tier: "low",
  dpr: [1, 1.15],
  antialias: false,
  shadows: false,
  shadowMapSize: 512,
  far: 230,
  fogNear: 45,
  fogFar: 180,
  counts: { buildings: 54, trees: 44, streetLights: 28, signs: 16, barriers: 0, windows: 0 },
  roadSegments: 320,
  carEffects: false,
};

export const QUALITY: Record<QualityTier, QualitySettings> = {
  high: HIGH,
  medium: MEDIUM,
  low: LOW,
};

/**
 * Resolve a tier from device signals. Runs once on mount; there is no reliable
 * synchronous GPU query, so this is intentionally conservative.
 */
export function detectTier(): QualityTier {
  if (typeof window === "undefined") return "medium";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 900;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const saveData = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection?.saveData;

  if (saveData) return "low";
  if (coarse && narrow) return "low";
  if (cores <= 4 || memory <= 4) return "medium";
  if (narrow) return "medium";
  return "high";
}
