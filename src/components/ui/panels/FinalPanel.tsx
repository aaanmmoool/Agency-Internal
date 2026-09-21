"use client";

import { CONTACT } from "@/config/site";
import { scrollToProgress } from "@/hooks/useScrollJourney";
import { missionStart } from "@/lib/journey";
import { Button, Eyebrow, Panel } from "../primitives";

interface Props {
  /** True once the car has reached the entrance. */
  complete: boolean;
}

/** Final mission — arrival and the call to action. */
export function FinalPanel({ complete }: Props) {
  return (
    <Panel labelledBy="mission-final-heading" className="max-w-lg text-center">
      <Eyebrow className="text-accent">
        {complete ? "Mission Complete" : "Approaching destination"}
      </Eyebrow>

      <h2
        id="mission-final-heading"
        className="mt-3 text-2xl font-medium tracking-display text-balance text-ink sm:text-3xl"
      >
        Got something worth building?
      </h2>

      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
        Tell us what you have in mind. We will come back with a scope, an honest estimate
        and the first thing we would build.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button href={`mailto:${CONTACT.email}`}>Start a project</Button>
        <Button variant="ghost" onClick={() => scrollToProgress(missionStart("projects"))}>
          View our work
        </Button>
      </div>

      <p className="mt-6 font-mono text-[0.68rem] text-ink-faint">{CONTACT.email}</p>
    </Panel>
  );
}
