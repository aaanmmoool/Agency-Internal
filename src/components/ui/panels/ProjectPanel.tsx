"use client";

import Image from "next/image";
import type { Project } from "@/types";
import { Button, Eyebrow, Field, Panel, Tag } from "../primitives";

interface Props {
  project: Project;
}

/** Mission 03 — a single case study, shown when the car reaches its building. */
export function ProjectPanel({ project }: Props) {
  const headingId = `project-${project.id}-heading`;

  return (
    <Panel labelledBy={headingId} className="max-w-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Eyebrow color={project.accent}>Project {project.index}</Eyebrow>
          <h2
            id={headingId}
            className="mt-2 text-2xl font-medium tracking-display text-ink sm:text-3xl"
          >
            {project.title}
          </h2>
        </div>
        <span className="mt-1 shrink-0 rounded-full border border-edge px-3 py-1 text-[0.64rem] tracking-label text-ink-faint uppercase">
          {project.category}
        </span>
      </div>

      <ProjectImage project={project} />

      <p className="mt-5 text-sm leading-relaxed text-ink-muted">{project.description}</p>

      <div className="mt-6 space-y-5">
        <Field label="Problem">{project.problem}</Field>
        <Field label="Solution">{project.solution}</Field>
        <Field label="Our contribution">{project.contribution}</Field>
      </div>

      <div className="mt-6">
        <Eyebrow className="text-ink-faint">Technology</Eyebrow>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <Tag key={tech}>{tech}</Tag>
          ))}
        </div>
      </div>

      {(project.liveUrl || project.githubUrl) && (
        <div className="mt-7 flex flex-wrap gap-3">
          {project.liveUrl && (
            <Button href={project.liveUrl} variant="ghost">
              Live demo
            </Button>
          )}
          {project.githubUrl && (
            <Button href={project.githubUrl} variant="quiet">
              Source
            </Button>
          )}
        </div>
      )}
    </Panel>
  );
}

/**
 * The case-study screenshot.
 *
 * Falls back to a generated plate when no image is supplied, so a project
 * without a screenshot still looks deliberate rather than broken. Real images
 * go through `next/image`, which emits AVIF/WebP automatically.
 */
function ProjectImage({ project }: { project: Project }) {
  if (!project.image) {
    return (
      <div
        className="mt-6 flex aspect-[16/9] w-full items-end overflow-hidden rounded-xl border border-edge p-5"
        style={{
          background: `linear-gradient(140deg, ${project.accent}18 0%, transparent 55%), var(--color-raised)`,
        }}
        role="img"
        aria-label={`Placeholder artwork for ${project.title}`}
      >
        <span
          className="font-mono text-5xl leading-none opacity-25"
          style={{ color: project.accent }}
        >
          {project.index}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-6 aspect-[16/9] w-full overflow-hidden rounded-xl border border-edge">
      <Image
        src={project.image}
        alt={`Screenshot of ${project.title}`}
        width={1280}
        height={720}
        className="h-full w-full object-cover"
        sizes="(max-width: 640px) 100vw, 560px"
      />
    </div>
  );
}
