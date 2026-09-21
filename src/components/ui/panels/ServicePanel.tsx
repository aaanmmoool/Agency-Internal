"use client";

import { services } from "@/data/services";
import { setSelectedService } from "@/lib/journey";
import { Eyebrow, Panel, Tag, cx } from "../primitives";

interface Props {
  selected: string | null;
}

/**
 * Mission 04 — the interchange.
 *
 * Choosing a route writes to the journey store, which the 3D world reads to
 * steer the car towards the matching gate.
 */
export function ServicePanel({ selected }: Props) {
  const active = services.find((s) => s.id === selected);

  return (
    <Panel labelledBy="mission-services-heading" className="max-w-2xl">
      <Eyebrow className="text-ink-faint">Mission 04</Eyebrow>
      <h2
        id="mission-services-heading"
        className="mt-2 text-2xl font-medium tracking-display text-ink sm:text-3xl"
      >
        Services
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
        The road splits here. Pick a route to see what that work looks like.
      </p>

      <div
        role="radiogroup"
        aria-label="Service routes"
        className="mt-6 flex flex-wrap gap-2"
      >
        {services.map((service) => {
          const isActive = service.id === selected;
          return (
            <button
              key={service.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setSelectedService(isActive ? null : service.id)}
              className={cx(
                "rounded-full border px-4 py-2 text-[0.72rem] tracking-label uppercase transition-colors duration-300",
                isActive
                  ? "border-transparent bg-ink text-void"
                  : "border-edge-strong text-ink-muted hover:border-ink-muted hover:text-ink",
              )}
              style={isActive ? undefined : { borderColor: `${service.accent}33` }}
            >
              {service.title}
            </button>
          );
        })}
      </div>

      {active ? (
        <div key={active.id} className="animate-fade-in mt-7 border-t border-edge pt-6">
          <h3 className="text-lg font-medium text-ink">{active.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{active.summary}</p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <Eyebrow className="text-ink-faint">What you get</Eyebrow>
              <ul className="mt-2 space-y-1.5">
                {active.deliverables.map((item) => (
                  <li key={item} className="text-[0.82rem] leading-relaxed text-ink-muted">
                    — {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Eyebrow className="text-ink-faint">Typical stack</Eyebrow>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {active.stack.map((tech) => (
                  <Tag key={tech} color={active.accent}>
                    {tech}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-7 text-[0.72rem] tracking-label text-ink-faint uppercase">
          Select a route
        </p>
      )}
    </Panel>
  );
}
