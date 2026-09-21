"use client";

import { team } from "@/data/team";
import { Eyebrow, Panel, Tag, cx } from "../primitives";

interface Props {
  /** 0..1 within the team mission; spotlights members as the car arrives. */
  local: number;
}

/** Mission 01 — the four engineers. */
export function TeamPanel({ local }: Props) {
  // Each member lights up as the car draws level with their marker.
  const spotlight = Math.min(Math.floor(local * team.length * 1.15), team.length - 1);

  return (
    <Panel labelledBy="mission-team-heading" className="max-w-2xl">
      <Eyebrow className="text-ink-faint">Mission 01</Eyebrow>
      <h2
        id="mission-team-heading"
        className="mt-2 text-2xl font-medium tracking-display text-ink sm:text-3xl"
      >
        The Team
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Four engineers. We take on a small number of projects at a time, so the people
        you meet are the people who write the code.
      </p>

      <ul className="mt-6 space-y-3">
        {team.map((member, i) => (
          <li
            key={member.id}
            className={cx(
              "rounded-xl border p-4 transition-colors duration-500",
              i === spotlight ? "border-edge-strong bg-raised" : "border-edge bg-transparent",
            )}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-base font-medium text-ink">{member.name}</h3>
              <span className="shrink-0 font-mono text-[0.66rem] text-ink-faint">
                {member.experience}
              </span>
            </div>
            <p className="mt-1 text-[0.72rem] tracking-label uppercase" style={{ color: member.accent }}>
              {member.role}
            </p>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-muted">{member.bio}</p>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {member.skills.slice(0, 4).map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>

            <details className="group mt-2.5">
              <summary className="cursor-pointer list-none text-[0.68rem] tracking-label text-ink-faint uppercase hover:text-ink-muted">
                Selected work
                <span className="ml-1 inline-block transition-transform group-open:rotate-90">
                  ›
                </span>
              </summary>
              <ul className="mt-2 space-y-1.5">
                {member.achievements.map((item) => (
                  <li key={item} className="text-[0.8rem] leading-relaxed text-ink-muted">
                    — {item}
                  </li>
                ))}
              </ul>
            </details>

            {member.socials.length > 0 && (
              <div className="mt-2.5 flex gap-3">
                {member.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[0.68rem] tracking-label text-ink-faint uppercase hover:text-ink"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
