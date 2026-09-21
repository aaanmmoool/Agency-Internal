"use client";

import { useSyncExternalStore } from "react";
import { QUALITY, detectTier, type QualitySettings } from "@/config/quality";
import type { QualityTier } from "@/types";
import { noopSubscribe } from "./useHydrated";

/**
 * Resolves the device tier once, on the client.
 *
 * Server rendering reports "medium" so the markup matches; the real tier is
 * detected and cached on the first client read. The tier never changes after
 * that, so the subscription is a no-op.
 */
let cached: QualityTier | null = null;

const getTier = (): QualityTier => (cached ??= detectTier());
const getServerTier = (): QualityTier => "medium";

export function useQuality(): { settings: QualitySettings; tier: QualityTier } {
  const tier = useSyncExternalStore(noopSubscribe, getTier, getServerTier);
  return { settings: QUALITY[tier], tier };
}
