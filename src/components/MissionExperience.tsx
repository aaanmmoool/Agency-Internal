"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { StaticContent } from "@/components/sections/StaticContent";
import { Hud } from "@/components/ui/Hud";
import { LandingScreen } from "@/components/ui/LandingScreen";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { PerfOverlay } from "@/components/ui/PerfOverlay";
import { useHydrated } from "@/hooks/useHydrated";
import { useJourney } from "@/hooks/useJourney";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useQuality } from "@/hooks/useQuality";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SCROLL_SCREENS, scrollToProgress, useScrollJourney } from "@/hooks/useScrollJourney";
import { resetJourney, setPhase } from "@/lib/journey";
import { getLoadServerSnapshot, getLoadSnapshot, subscribeLoading } from "@/lib/loading";
import { recordLoadTime } from "@/lib/perf";
import { supportsWebGL } from "@/lib/webgl";

/**
 * The 3D canvas is client-only and code-split, so a visitor who ends up on the
 * static document never downloads Three.js.
 */
const Experience = dynamic(
  () => import("@/components/three/Experience").then((m) => m.Experience),
  { ssr: false },
);

/** `deciding` is the server and hydrating state, before WebGL is probed. */
type Mode = "deciding" | "document" | "world";

/** What the visitor has asked for, independent of what the device can do. */
type Preference = "auto" | "document";

/**
 * Top-level orchestrator.
 *
 * The server renders the static document. On the client, if WebGL is available
 * and the visitor has not asked for the plain version, the 3D world is layered
 * over it and the document is moved aside. That ordering is what keeps the
 * crawlable HTML authoritative rather than an afterthought.
 */
export function MissionExperience() {
  const [preference, setPreference] = useState<Preference>("auto");
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  const hydrated = useHydrated();
  const { settings: quality, tier } = useQuality();
  const reducedMotion = useReducedMotion();
  const journey = useJourney();
  const loading = useSyncExternalStore(subscribeLoading, getLoadSnapshot, getLoadServerSnapshot);

  const scrollTrack = useRef<HTMLDivElement>(null);

  // Derived, not stored: the server cannot know whether WebGL exists, so the
  // decision is made during the first post-hydration render instead of in an
  // effect that would cause a second pass.
  const mode: Mode = !hydrated
    ? "deciding"
    : failed || preference === "document" || !supportsWebGL()
      ? "document"
      : "world";

  useEffect(() => {
    if (loading.interactive) recordLoadTime();
  }, [loading.interactive]);

  const worldMode = mode === "world";

  useScrollJourney({
    container: scrollTrack,
    enabled: worldMode && started,
    reducedMotion,
  });

  useKeyboardNavigation(worldMode && started);

  const startMission = useCallback(() => {
    setStarted(true);
    setPhase("driving");
    // Always begin at the top of the track, whatever scroll was restored.
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const leaveWorld = useCallback(() => {
    setPreference("document");
    setStarted(false);
    setPhase("landing");
    resetJourney();
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const enterWorld = useCallback(() => {
    if (!supportsWebGL()) return;
    setPreference("auto");
    setPhase("landing");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const handleFailure = useCallback(() => {
    setFailed(true);
    setPhase("landing");
  }, []);

  // The loader stays up until the mode is settled and, in world mode, the
  // critical scene chunks exist. It is server-rendered so there is no flash.
  const loaderDone = mode === "document" || (worldMode && loading.interactive);

  return (
    <>
      {worldMode ? (
        <button type="button" onClick={leaveWorld} className="skip-link visually-hidden">
          Skip the 3D world and read the text version
        </button>
      ) : (
        <a href="#content" className="skip-link visually-hidden">
          Skip to content
        </a>
      )}

      {worldMode && (
        <>
          {/*
            The scroll track. Its height is the entire journey and the canvas is
            fixed behind it: one element, one ScrollTrigger, one progress value.
          */}
          <div
            ref={scrollTrack}
            style={{ height: started ? `${SCROLL_SCREENS[tier] * 100}svh` : "100svh" }}
            aria-hidden="true"
          />

          <div className="fixed inset-0 z-0">
            <ErrorBoundary fallback={null} onError={handleFailure}>
              <Experience quality={quality} reducedMotion={reducedMotion} />
            </ErrorBoundary>
          </div>

          <Hud />

          <LandingScreen
            visible={!started}
            ready={loading.interactive}
            onStart={startMission}
            onSkipTo3D={leaveWorld}
          />

          {started && (
            <button
              type="button"
              onClick={leaveWorld}
              className="fixed top-5 left-1/2 z-40 -translate-x-1/2 rounded-full border border-edge bg-surface/80 px-4 py-1.5 text-[0.62rem] tracking-label text-ink-faint uppercase backdrop-blur-md transition-colors hover:text-ink"
            >
              Text version
            </button>
          )}

          {journey.complete && (
            <button
              type="button"
              onClick={() => scrollToProgress(0, false)}
              className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 text-[0.62rem] tracking-label text-ink-faint uppercase transition-colors hover:text-ink sm:bottom-24"
            >
              Restart the mission
            </button>
          )}
        </>
      )}

      {/*
        The document: present in every render, visually replaced — never
        removed — while the 3D world is on screen.
      */}
      <main
        id="content"
        className={worldMode ? "visually-hidden" : ""}
        aria-hidden={worldMode || undefined}
        inert={worldMode || undefined}
      >
        <StaticContent onEnterWorld={failed || mode === "deciding" ? undefined : enterWorld} />
      </main>

      <LoadingScreen done={loaderDone} />
      {/* Without JavaScript there is nothing to load — hide the loader outright. */}
      <noscript>
        <style>{`#world-loader{display:none!important}`}</style>
      </noscript>

      {process.env.NODE_ENV === "development" && worldMode && (
        <PerfOverlay tier={tier} />
      )}
    </>
  );
}
