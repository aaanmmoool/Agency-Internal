"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe, type JourneySnapshot } from "@/lib/journey";

/**
 * Subscribe React to the journey's *discrete* state. This never fires on every
 * frame — see `publish()` in `lib/journey.ts`.
 */
export function useJourney(): JourneySnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
