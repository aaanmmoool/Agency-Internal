"use client";

import { missionById, localProgress } from "@/data/missions";
import { projects } from "@/data/projects";
import { useJourney } from "@/hooks/useJourney";
import { ExperiencePanel } from "./panels/ExperiencePanel";
import { FinalPanel } from "./panels/FinalPanel";
import { ProcessPanel } from "./panels/ProcessPanel";
import { ProjectPanel } from "./panels/ProjectPanel";
import { ServicePanel } from "./panels/ServicePanel";
import { TeamPanel } from "./panels/TeamPanel";
import { cx } from "./primitives";

/**
 * The HTML layer that sits over the 3D world.
 *
 * One panel is mounted at a time, keyed on what the journey says is in view.
 * The panel content is also present in the static fallback document, so nothing
 * here is the only copy of anything.
 */
export function MissionOverlay() {
  const journey = useJourney();

  if (journey.phase !== "driving") return null;

  const progress = journey.percent / 100;
  const panel = renderPanel(journey, progress);
  if (!panel) return null;

  return (
    <div
      className={cx(
        "pointer-events-none fixed inset-x-0 bottom-0 z-20",
        // Bottom sheet on small screens, a left column on desktop.
        "flex justify-center px-4 pb-16 sm:px-6",
        "lg:inset-y-0 lg:right-auto lg:left-0 lg:w-[min(34rem,42vw)] lg:items-center lg:justify-start lg:px-10 lg:pb-0",
      )}
    >
      <div
        key={panelKey(journey)}
        className="pointer-events-auto max-h-[58vh] w-full overflow-y-auto overscroll-contain lg:max-h-[78vh]"
      >
        {panel}
      </div>
    </div>
  );
}

type Journey = ReturnType<typeof useJourney>;

/** A stable identity per distinct panel, so React remounts on a real change. */
function panelKey(journey: Journey): string {
  if (journey.activeProject >= 0) return `project-${journey.activeProject}`;
  return journey.missionId;
}

function renderPanel(journey: Journey, progress: number) {
  switch (journey.missionId) {
    case "team":
      return <TeamPanel local={localProgress(missionById("team"), progress)} />;

    case "experience":
      return <ExperiencePanel activeId={journey.activeLandmark} />;

    case "projects": {
      const project = projects[journey.activeProject];
      // Between buildings there is nothing to show — let the world breathe.
      return project ? <ProjectPanel project={project} /> : null;
    }

    case "services":
      return journey.serviceChoiceOpen || journey.selectedService ? (
        <ServicePanel selected={journey.selectedService} />
      ) : null;

    case "process":
      return <ProcessPanel activeIndex={journey.activeStep} />;

    case "final":
      return <FinalPanel complete={journey.complete} />;

    default:
      return null;
  }
}
