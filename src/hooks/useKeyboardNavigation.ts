"use client";

import { useEffect, useRef } from "react";
import { missionAt, missions } from "@/data/missions";
import { missionStart, mutable } from "@/lib/journey";
import { scrollToProgress } from "./useScrollJourney";

/** How long a keyboard request stays authoritative over the live position. */
const CHAIN_WINDOW_MS = 900;

/**
 * Left/right arrows jump between missions.
 *
 * Up/down and space are deliberately left alone so the page scrolls the way
 * every other page does — the journey is driven by that same scroll.
 */
export function useKeyboardNavigation(enabled: boolean): void {
  // Smooth scrolling means the journey has not moved yet when a second key
  // arrives. Without this, holding the arrow key would jump one mission and
  // then keep re-requesting the same one.
  const pending = useRef<{ index: number; at: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      // Never steal keys from a control the visitor is actually using.
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      const fresh =
        pending.current && performance.now() - pending.current.at < CHAIN_WINDOW_MS;
      const current = fresh
        ? pending.current!.index
        : missions.indexOf(missionAt(mutable.smooth));

      let next: number;
      if (event.key === "ArrowRight") next = Math.min(current + 1, missions.length - 1);
      else if (event.key === "ArrowLeft") next = Math.max(current - 1, 0);
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = missions.length - 1;
      else return;

      event.preventDefault();
      pending.current = { index: next, at: performance.now() };

      const mission = missions[next];
      scrollToProgress(mission.id === "final" ? 1 : missionStart(mission.id));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
