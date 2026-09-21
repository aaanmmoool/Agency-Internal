"use client";

import { experienceLandmarks } from "@/data/missions";
import { Eyebrow, Panel, cx } from "../primitives";

interface Props {
  /** Id of the landmark the car is currently level with, or null between them. */
  activeId: string | null;
}

/** Mission 02 — the experience district. */
export function ExperiencePanel({ activeId }: Props) {
  const active = experienceLandmarks.find((l) => l.id === activeId);

  return (
    <Panel labelledBy="mission-experience-heading" className="max-w-lg">
      <Eyebrow className="text-ink-faint">Mission 02</Eyebrow>
      <h2
        id="mission-experience-heading"
        className="mt-2 text-2xl font-medium tracking-display text-ink sm:text-3xl"
      >
        Experience
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Where the four of us learned this, before the studio existed.
      </p>

      <ul className="mt-6 space-y-3">
        {experienceLandmarks.map((landmark) => {
          const isActive = landmark.id === activeId;
          return (
            <li key={landmark.id}>
              <div className="flex items-center gap-3">
                <span
                  className="block h-px transition-all duration-500"
                  style={{
                    width: isActive ? 28 : 12,
                    backgroundColor: isActive ? landmark.accent : "var(--color-edge-strong)",
                  }}
                />
                <span
                  className={cx(
                    "text-[0.72rem] tracking-label uppercase transition-colors duration-500",
                    isActive ? "text-ink" : "text-ink-faint",
                  )}
                >
                  {landmark.label}
                </span>
              </div>
              {/*
                Kept in the DOM at all times so the content stays crawlable and
                screen-reader accessible; only the presentation collapses.
              */}
              <div
                className={cx(
                  "grid transition-all duration-500 ease-[var(--ease-out-expo)]",
                  isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <p className="overflow-hidden pt-2 pl-10 text-[0.84rem] leading-relaxed text-ink-muted">
                  {landmark.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {!active && (
        <p className="mt-5 text-[0.72rem] tracking-label text-ink-faint uppercase">
          Keep scrolling
        </p>
      )}
    </Panel>
  );
}
