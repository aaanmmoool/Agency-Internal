import { BOARD, COLORS } from "@/config/scene";
import { CONTACT } from "@/config/site";
import { experienceLandmarks, missionById } from "@/data/missions";
import { processSteps } from "@/data/process";
import type { BoardSpec } from "@/lib/boardTexture";
import type { ExperienceLandmark, ProcessStep, Project, Service } from "@/types";
import { services } from "@/data/services";
import { team } from "@/data/team";

/**
 * What each building says.
 *
 * The content is the same the text version of the site shows; these builders
 * only decide how it is arranged on a facade. Surface sizes come from the
 * geometry in `Landmarks.tsx`, and body sizes are chosen for the distance the
 * camera holds from that building when the car stops beside it.
 */

type Size = { width: number; height: number };

const missionLabel = (id: Parameters<typeof missionById>[0]) => {
  const m = missionById(id);
  return `Mission ${m.index} · ${m.title}`;
};

export function teamBoard({ width, height }: Size): BoardSpec {
  const cell = (member: (typeof team)[number]) => [
    { kind: "heading" as const, text: member.name, scale: 0.5, aside: member.experience },
    { kind: "eyebrow" as const, text: member.role, color: member.accent },
    { kind: "text" as const, text: member.bio },
    ...(member.skills.length ? [{ kind: "tags" as const, items: member.skills.slice(0, 4) }] : []),
  ];

  const rows = [];
  for (let i = 0; i < team.length; i += 2) {
    rows.push({ kind: "columns" as const, columns: team.slice(i, i + 2).map(cell) });
  }

  return {
    width,
    height,
    unit: 0.36,
    valign: "middle",
    blocks: [
      { kind: "eyebrow", text: missionLabel("team") },
      { kind: "heading", text: "The Team", scale: 0.95 },
      {
        kind: "text",
        text: "Two engineers. We take on a small number of projects at a time, so the people you meet are the people who write the code.",
      },
      ...rows,
    ],
  };
}

export function experienceBoard(landmark: ExperienceLandmark, { width, height }: Size): BoardSpec {
  const first = landmark.id === experienceLandmarks[0].id;
  const position = experienceLandmarks.indexOf(landmark) + 1;

  return {
    width,
    height,
    unit: 0.27,
    valign: "middle",
    blocks: [
      {
        kind: "eyebrow",
        text: `${missionById("experience").title} · ${String(position).padStart(2, "0")}/${String(experienceLandmarks.length).padStart(2, "0")}`,
      },
      ...(first
        ? [
            {
              kind: "text" as const,
              text: "Where the two of us learned this, before the studio existed.",
              scale: 0.9,
            },
          ]
        : []),
      { kind: "heading", text: landmark.label, scale: 0.9, color: landmark.accent },
      { kind: "text", text: landmark.detail, scale: 1.08 },
    ],
  };
}

export function projectBoard(project: Project, { width, height }: Size): BoardSpec {
  const links = [project.liveUrl, project.githubUrl].filter(Boolean) as string[];

  return {
    width,
    height,
    unit: 0.37,
    blocks: [
      { kind: "eyebrow", text: `Project ${project.index} · ${project.category}`, color: project.accent },
      { kind: "heading", text: project.title, scale: 0.9 },
      { kind: "text", text: project.description, color: BOARD.ink },
      { kind: "field", label: "Problem", text: project.problem },
      { kind: "field", label: "Solution", text: project.solution },
      { kind: "field", label: "Our contribution", text: project.contribution },
      { kind: "eyebrow", text: "Technology" },
      { kind: "tags", items: project.technologies },
      ...(links.length
        ? [{ kind: "eyebrow" as const, text: `Select to open · ${links[0].replace(/^https?:\/\//, "")}` }]
        : []),
    ],
  };
}

export function serviceBoard(service: Service, { width, height }: Size): BoardSpec {
  const position = services.indexOf(service) + 1;

  return {
    width,
    height,
    unit: 0.3,
    padding: 1.5,
    blocks: [
      {
        kind: "eyebrow",
        text: `${missionLabel("services")} · ${String(position).padStart(2, "0")}/${String(services.length).padStart(2, "0")}`,
        color: service.accent,
      },
      { kind: "heading", text: service.title, scale: 0.72 },
      { kind: "text", text: service.summary },
      { kind: "eyebrow", text: "What you get" },
      { kind: "list", items: service.deliverables },
      { kind: "tags", items: service.stack, color: service.accent },
      { kind: "gap", size: 0.3 },
      {
        kind: "eyebrow",
        text: position < services.length ? "Scroll to clear the road" : "Scroll on to drive",
      },
    ],
  };
}

export function processBoard(step: ProcessStep, { width, height }: Size): BoardSpec {
  return {
    width,
    height,
    unit: 0.3,
    padding: 1.3,
    blocks: [
      {
        kind: "heading",
        text: `${step.index}  ${step.title}`,
        scale: 0.62,
        aside: `${missionById("process").title} · ${step.index}/${String(processSteps.length).padStart(2, "0")}`,
      },
      { kind: "text", text: step.description },
      { kind: "text", text: `Output — ${step.output}`, scale: 0.92, color: BOARD.faint },
    ],
  };
}

export function finalBoard({ width, height }: Size): BoardSpec {
  return {
    width,
    height,
    unit: 0.42,
    align: "center",
    blocks: [
      { kind: "eyebrow", text: missionById("final").title, color: COLORS.accent },
      { kind: "heading", text: "Got something worth building?", scale: 0.95 },
      {
        kind: "text",
        text: "Tell us what you have in mind. We will come back with a scope, an honest estimate and the first thing we would build.",
      },
      { kind: "heading", text: CONTACT.email, scale: 0.46, color: COLORS.accent },
      { kind: "eyebrow", text: "Select to email us" },
    ],
  };
}
