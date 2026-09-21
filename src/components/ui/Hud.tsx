"use client";

import { missions } from "@/data/missions";
import { useJourney } from "@/hooks/useJourney";
import { missionStart } from "@/lib/journey";
import { scrollToProgress } from "@/hooks/useScrollJourney";
import { cx } from "./primitives";

/**
 * The heads-up display.
 *
 * Re-renders only when a discrete journey value changes — the mission, the
 * whole-percent progress or the XP total — which is a handful of updates per
 * journey rather than one per frame.
 */
export function Hud() {
  const journey = useJourney();
  const visible = journey.phase === "driving";

  return (
    <div
      className={cx(
        "pointer-events-none fixed inset-0 z-30 transition-opacity duration-700",
        visible ? "opacity-100" : "opacity-0",
      )}
      aria-hidden={!visible}
    >
      {/* Top-left: current mission */}
      <div className="absolute top-5 left-5 sm:top-7 sm:left-8">
        <p className="text-[0.62rem] tracking-label text-ink-faint uppercase">
          Mission {journey.missionIndex}
        </p>
        <p className="mt-1 text-sm font-medium tracking-label text-ink uppercase sm:text-base">
          {journey.district}
        </p>
      </div>

      {/* Top-right: XP */}
      <div className="absolute top-5 right-5 text-right sm:top-7 sm:right-8">
        <p className="text-[0.62rem] tracking-label text-ink-faint uppercase">XP</p>
        {/*
          No tween: `xpAt` already includes a partial term for the mission in
          progress, so the total counts up on its own as the journey advances.
        */}
        <p className="mt-1 font-mono text-sm tabular-nums text-ink sm:text-base">
          {journey.xp}
        </p>
      </div>

      {/* Right edge: mission progress rail (desktop) */}
      <nav
        aria-label="Mission progress"
        className="pointer-events-auto absolute top-1/2 right-6 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
      >
        {missions
          .filter((m) => m.id !== "intro")
          .map((mission) => {
            const active = mission.id === journey.missionId;
            const passed = journey.percent / 100 >= mission.end;
            return (
              <button
                key={mission.id}
                type="button"
                onClick={() => scrollToProgress(missionStart(mission.id))}
                className="group flex items-center gap-3"
                aria-current={active ? "step" : undefined}
              >
                <span
                  className={cx(
                    "text-[0.62rem] tracking-label uppercase transition-all duration-300",
                    active
                      ? "text-ink opacity-100"
                      : "text-ink-faint opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                  )}
                >
                  {mission.title}
                </span>
                <span
                  className={cx(
                    "block h-px transition-all duration-500",
                    active
                      ? "w-8 bg-accent"
                      : passed
                        ? "w-4 bg-ink-faint"
                        : "w-4 bg-edge-strong group-hover:w-6",
                  )}
                />
              </button>
            );
          })}
      </nav>

      {/* Bottom: linear progress */}
      <div className="absolute right-5 bottom-5 left-5 sm:right-8 sm:bottom-7 sm:left-8">
        <div className="flex items-end justify-between gap-4">
          <p className="text-[0.62rem] tracking-label text-ink-faint uppercase">
            {journey.missionTitle}
          </p>
          <p className="font-mono text-[0.62rem] tabular-nums text-ink-faint">
            {String(journey.percent).padStart(2, "0")}%
          </p>
        </div>
        <div
          className="mt-2 h-px w-full bg-edge"
          role="progressbar"
          aria-label="Journey progress"
          aria-valuenow={journey.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-px bg-accent transition-[width] duration-200 ease-linear"
            style={{ width: `${journey.percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
