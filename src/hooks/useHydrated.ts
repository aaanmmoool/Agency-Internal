"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * False during server rendering and the hydrating render, true afterwards.
 *
 * Lets client-only capability checks run without a hydration mismatch and
 * without a cascading `setState` inside an effect.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, onClient, onServer);
}

export { noopSubscribe };
