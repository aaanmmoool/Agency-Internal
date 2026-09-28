import Image from "next/image";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/primitives";
import { CONTACT, LANDING, SITE, SOCIALS } from "@/config/site";
import { experienceLandmarks, missionById } from "@/data/missions";
import { processSteps } from "@/data/process";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { team } from "@/data/team";
import {
  ROUTE_MAP_PATH,
  ROUTE_MAP_START,
  ROUTE_MAP_VIEWBOX,
  routeMapStop,
} from "@/lib/routeMap";
import type { MissionId } from "@/types";

interface Props {
  /** Rendered by the client when it can offer the interactive route. */
  onEnterWorld?: () => void;
}

type StopId = Exclude<MissionId, "intro">;

/** Where each stop links to in this document. The last stop is the contact section. */
const STOPS: { id: StopId; anchor: string; accent: string }[] = [
  { id: "team", anchor: "team", accent: "var(--color-accent)" },
  { id: "experience", anchor: "experience", accent: "var(--color-violet)" },
  { id: "projects", anchor: "projects", accent: "var(--color-mint)" },
  { id: "services", anchor: "services", accent: "var(--color-sky)" },
  { id: "process", anchor: "process", accent: "var(--color-warm)" },
  { id: "final", anchor: "contact", accent: "var(--color-ink)" },
];

const stop = (id: StopId) => STOPS.find((s) => s.id === id)!;

/**
 * The complete site as ordinary HTML.
 *
 * This is what the server sends, what a crawler reads, and what anyone without
 * JavaScript or WebGL gets. Every word shown inside the 3D experience also
 * appears here — the world is an enhancement over this document, not a
 * replacement for it. It is laid out as the same route the world drives: a map
 * up front, then one stop per section.
 */
export function StaticContent({ onEnterWorld }: Props) {
  return (
    <div id="top" className="min-h-svh">
      <TopBar onEnterWorld={onEnterWorld} />
      <Hero onEnterWorld={onEnterWorld} />
      <RouteMap />

      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        {/* --- Team -------------------------------------------------------- */}
        <Section
          stop="team"
          intro="Two engineers. We take on a small number of projects at a time, so the people you meet are the people who write the code."
        >
          <ul className="grid gap-4 md:grid-cols-2">
            {team.map((member) => (
              <li
                key={member.id}
                className="relative flex flex-col rounded-2xl border border-edge bg-surface p-6 sm:p-7"
              >
                <AccentEdge color={member.accent} />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-ink">{member.name}</h3>
                    <p
                      className="mt-1 text-[0.7rem] tracking-label uppercase"
                      style={{ color: member.accent }}
                    >
                      {member.role}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-edge px-2.5 py-1 font-mono text-[0.66rem] text-ink-faint">
                    {member.experience}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-ink-muted">{member.bio}</p>
                {member.skills.length > 0 && <Chips items={member.skills} className="mt-5" />}

                <h4 className="mt-7 text-[0.66rem] tracking-label text-ink-faint uppercase">
                  Selected work
                </h4>
                <ul className="mt-3 space-y-2.5">
                  {member.achievements.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                      <span
                        aria-hidden="true"
                        className="mt-[0.7em] h-px w-3 shrink-0"
                        style={{ backgroundColor: member.accent }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                {member.socials.length > 0 && (
                  <p className="mt-auto flex gap-5 pt-7">
                    {member.socials.map((social) => (
                      <ExternalLink key={social.label} href={social.url}>
                        {social.label}
                      </ExternalLink>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Section>

        {/* --- Experience -------------------------------------------------- */}
        <Section stop="experience" intro="Where the two of us learned this, before the studio existed.">
          <dl className="grid gap-4 sm:grid-cols-2">
            {experienceLandmarks.map((landmark, i) => (
              <div
                key={landmark.id}
                className="relative rounded-2xl border border-edge bg-surface p-6 sm:p-7"
              >
                <AccentEdge color={landmark.accent} />
                <dt className="flex items-baseline justify-between gap-4">
                  <span
                    className="text-2xl font-medium tracking-display"
                    style={{ color: landmark.accent }}
                  >
                    {landmark.label}
                  </span>
                  <span className="font-mono text-[0.66rem] text-ink-faint">
                    {String(i + 1).padStart(2, "0")}/{String(experienceLandmarks.length).padStart(2, "0")}
                  </span>
                </dt>
                <dd className="mt-3 text-sm leading-relaxed text-ink-muted">{landmark.detail}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* --- Projects ---------------------------------------------------- */}
        <Section
          stop="projects"
          intro="Each case study is the problem as we found it, what we built, and the part of it that was ours."
        >
          <ul className="space-y-5">
            {projects.map((project) => (
              <li key={project.id}>
                <article
                  aria-labelledby={`project-${project.id}-heading`}
                  className="overflow-hidden rounded-3xl border border-edge bg-surface lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
                >
                  <div
                    className="relative flex flex-col p-7 sm:p-9"
                    style={{
                      background: `radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, ${project.accent} 14%, transparent), transparent 62%)`,
                    }}
                  >
                    <div className="mb-7 flex items-start justify-between gap-4">
                      <span
                        aria-hidden="true"
                        className="font-mono text-5xl leading-none"
                        style={{ color: project.accent }}
                      >
                        {project.index}
                      </span>
                      <span className="rounded-full border border-edge px-3 py-1 text-[0.62rem] tracking-label text-ink-faint uppercase">
                        {project.category}
                      </span>
                    </div>

                    {project.image && (
                      <div className="mb-7 aspect-[16/9] overflow-hidden rounded-xl border border-edge">
                        <Image
                          src={project.image}
                          alt={`Screenshot of ${project.title}`}
                          width={1280}
                          height={720}
                          className="h-full w-full object-cover"
                          sizes="(max-width: 1024px) 100vw, 520px"
                        />
                      </div>
                    )}

                    <p className="sr-only">
                      Project {project.index} · {project.category}
                    </p>
                    <h3
                      id={`project-${project.id}-heading`}
                      className="max-w-md text-2xl font-medium tracking-display text-balance text-ink sm:text-3xl"
                    >
                      {project.title}
                    </h3>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
                      {project.description}
                    </p>

                    <div className="mt-auto pt-8">
                      <p className="text-[0.66rem] tracking-label text-ink-faint uppercase">
                        Technology
                      </p>
                      <Chips items={project.technologies} className="mt-2.5" />
                      {(project.liveUrl || project.githubUrl) && (
                        <p className="mt-6 flex gap-5">
                          {project.liveUrl && (
                            <ExternalLink href={project.liveUrl} strong>
                              Live demo
                            </ExternalLink>
                          )}
                          {project.githubUrl && (
                            <ExternalLink href={project.githubUrl}>Source</ExternalLink>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <dl className="divide-y divide-edge border-t border-edge lg:border-t-0 lg:border-l">
                    {(
                      [
                        ["Problem", project.problem],
                        ["Solution", project.solution],
                        ["Our contribution", project.contribution],
                      ] as const
                    ).map(([label, text]) => (
                      <div key={label} className="px-7 py-6 sm:px-9 sm:py-7">
                        <dt className="text-[0.66rem] tracking-label text-ink-faint uppercase">
                          {label}
                        </dt>
                        <dd className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              </li>
            ))}
          </ul>
        </Section>

        {/* --- Services ---------------------------------------------------- */}
        <Section
          stop="services"
          intro="Five kinds of work, each with the deliverables you can expect and the stack we usually reach for."
        >
          <ul className="grid gap-4 sm:grid-cols-2">
            {services.map((service, i) => (
              <li
                key={service.id}
                className={
                  "relative flex flex-col rounded-2xl border border-edge bg-surface p-6 sm:p-7" +
                  (i === services.length - 1 && services.length % 2 === 1 ? " sm:col-span-2" : "")
                }
              >
                <AccentEdge color={service.accent} />
                <p className="font-mono text-[0.66rem]" style={{ color: service.accent }}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-lg font-medium text-ink">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{service.summary}</p>

                <h4 className="mt-6 text-[0.66rem] tracking-label text-ink-faint uppercase">
                  What you get
                </h4>
                <ul className="mt-2.5 space-y-1.5">
                  {service.deliverables.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-ink-muted">
                      <span
                        aria-hidden="true"
                        className="mt-[0.7em] h-px w-3 shrink-0"
                        style={{ backgroundColor: service.accent }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <Chips items={service.stack} accent={service.accent} />
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {/* --- Process ----------------------------------------------------- */}
        <Section
          stop="process"
          intro="Five checkpoints between the first conversation and a system your team runs without us."
        >
          <ol>
            {processSteps.map((step, i) => (
              <li key={step.index} className="relative grid grid-cols-[2.5rem_1fr] gap-5 pb-10 last:pb-0">
                {i < processSteps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-11 bottom-1 left-5 w-px bg-edge-strong"
                  />
                )}
                <span className="relative grid size-10 place-items-center rounded-full border border-edge-strong bg-void font-mono text-[0.7rem] text-warm">
                  {step.index}
                </span>
                <div className="pt-1.5">
                  <h3 className="text-lg font-medium text-ink">{step.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                    {step.description}
                  </p>
                  <p className="mt-4 inline-flex max-w-2xl flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-edge bg-surface px-4 py-2.5 text-[0.82rem] text-ink-muted">
                    <span className="text-[0.62rem] tracking-label text-ink-faint uppercase">
                      Output
                    </span>
                    {step.output}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* --- Contact ----------------------------------------------------- */}
        <Contact />
      </div>

      <footer className="mt-10 border-t border-edge">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p className="text-[0.68rem] tracking-label text-ink-faint uppercase">{SITE.legalName}</p>
          <div className="flex flex-wrap gap-6">
            {onEnterWorld && (
              <button
                type="button"
                onClick={onEnterWorld}
                className="text-[0.68rem] tracking-label text-ink-faint uppercase transition-colors hover:text-ink"
              >
                Drive the route in 3D
              </button>
            )}
            <a
              href="#top"
              className="text-[0.68rem] tracking-label text-ink-faint uppercase transition-colors hover:text-ink"
            >
              Back to top
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------

function TopBar({ onEnterWorld }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-edge/70 bg-void/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 sm:px-10">
        <a href="#top" className="text-[0.72rem] font-medium tracking-label text-ink uppercase">
          {SITE.name}
        </a>

        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="flex gap-7">
            {STOPS.map(({ id, anchor }) => (
              <li key={id}>
                <a
                  href={`#${anchor}`}
                  className="text-[0.66rem] tracking-label text-ink-faint uppercase transition-colors hover:text-ink"
                >
                  {id === "final" ? "Contact" : missionById(id).title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-5">
          {onEnterWorld && (
            <button
              type="button"
              onClick={onEnterWorld}
              className="hidden text-[0.66rem] tracking-label text-ink-faint uppercase transition-colors hover:text-ink sm:block"
            >
              3D world
            </button>
          )}
          <a
            href={`mailto:${CONTACT.email}`}
            className="rounded-full bg-ink px-4 py-2 text-[0.66rem] font-medium tracking-label text-void uppercase transition-colors hover:bg-white"
          >
            Start a project
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero({ onEnterWorld }: Props) {
  const facts = [
    [team.length, "engineers"],
    [projects.length, "case studies"],
    [services.length, "services"],
    [processSteps.length, "delivery steps"],
  ] as const;

  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      {/* A faint survey grid, fading out from the headline. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-edge-strong) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 75% 80% at 25% 30%, black 10%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 80% at 25% 30%, black 10%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-14 sm:px-10 sm:pt-28 sm:pb-20">
        <p className="flex items-center gap-3 text-[0.68rem] tracking-label text-ink-faint uppercase">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
          Engineering studio · {CONTACT.location}
        </p>
        <h1
          id="hero-heading"
          className="mt-7 max-w-4xl text-[clamp(2.6rem,8.5vw,6.2rem)] leading-[0.94] font-medium tracking-display text-balance text-ink"
        >
          {LANDING.headline}
        </h1>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
          {LANDING.subheading}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href={`mailto:${CONTACT.email}`}>Start a project</Button>
          {onEnterWorld && (
            <Button variant="ghost" onClick={onEnterWorld}>
              Open the interactive world
            </Button>
          )}
        </div>

        <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-edge bg-edge sm:grid-cols-4">
          {facts.map(([value, label]) => (
            <div key={label} className="bg-void px-5 py-4">
              <dt className="sr-only">{label}</dt>
              <dd>
                <span className="block font-mono text-2xl text-ink tabular-nums">{value}</span>
                <span className="mt-1 block text-[0.64rem] tracking-label text-ink-faint uppercase">
                  {label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** The road the 3D world drives, drawn flat, with a link per stop. */
function RouteMap() {
  return (
    <section aria-labelledby="route-heading" className="mx-auto max-w-6xl px-6 sm:px-10">
      <div className="rounded-3xl border border-edge bg-surface p-5 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="route-heading" className="text-[0.68rem] tracking-label text-ink uppercase">
            The route
          </h2>
          <p className="text-[0.66rem] tracking-label text-ink-faint uppercase">
            Six stops · the same road as the 3D world
          </p>
        </div>

        <svg
          viewBox={ROUTE_MAP_VIEWBOX}
          className="mt-6 h-auto w-full"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d={ROUTE_MAP_PATH}
            className="fill-none stroke-edge-strong"
            strokeWidth={11}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={ROUTE_MAP_PATH}
            className="fill-none stroke-raised"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={ROUTE_MAP_PATH}
            className="animate-route fill-none stroke-ink-faint"
            strokeWidth={0.9}
            strokeDasharray="4 5"
          />

          <circle cx={ROUTE_MAP_START.x} cy={ROUTE_MAP_START.y} r={3.5} className="fill-ink-faint" />

          {STOPS.map(({ id, accent }) => {
            const { x, y } = routeMapStop(id);
            return (
              <g key={id}>
                <circle cx={x} cy={y} r={15} style={{ fill: accent }} opacity={0.12} />
                <circle
                  cx={x}
                  cy={y}
                  r={9}
                  className="fill-void"
                  style={{ stroke: accent }}
                  strokeWidth={1.8}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-ink font-mono"
                  fontSize={7}
                >
                  {missionById(id).index}
                </text>
              </g>
            );
          })}
        </svg>

        <nav aria-label="Route stops" className="mt-6">
          <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-edge bg-edge sm:grid-cols-3 lg:grid-cols-6">
            {STOPS.map(({ id, anchor, accent }) => {
              const mission = missionById(id);
              return (
                <li key={id} className="bg-surface">
                  <a
                    href={`#${anchor}`}
                    className="group block h-full px-4 py-4 transition-colors hover:bg-raised"
                  >
                    <span className="font-mono text-[0.68rem]" style={{ color: accent }}>
                      {mission.index}
                    </span>
                    <span className="mt-1.5 block text-sm font-medium text-ink">{mission.title}</span>
                    <span className="mt-0.5 block text-[0.62rem] tracking-label text-ink-faint uppercase transition-colors group-hover:text-ink-muted">
                      {mission.district}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </section>
  );
}

function Contact() {
  const final = missionById("final");
  const { accent } = stop("final");

  return (
    <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-24 py-20 sm:py-28">
      <div
        className="relative overflow-hidden rounded-[2rem] border border-edge px-7 py-14 sm:px-14 sm:py-20"
        style={{
          background:
            "radial-gradient(90% 120% at 100% 0%, color-mix(in srgb, var(--color-accent) 16%, transparent), transparent 60%), var(--color-surface)",
        }}
      >
        <p className="flex items-center gap-3 text-[0.68rem] tracking-label uppercase" style={{ color: accent }}>
          <StopBadge index={final.index} accent={accent} />
          {final.district} · {final.title}
        </p>
        <h2
          id="contact-heading"
          className="mt-7 max-w-3xl text-[clamp(2.2rem,6vw,4.6rem)] leading-[0.98] font-medium tracking-display text-balance text-ink"
        >
          Got something worth building?
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted">
          Tell us what you have in mind. We will come back with a scope, an honest estimate and
          the first thing we would build.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
          <Button href={`mailto:${CONTACT.email}`}>Start a project</Button>
          <a
            href={`mailto:${CONTACT.email}`}
            className="text-base text-ink underline decoration-edge-strong underline-offset-[6px] transition-colors hover:decoration-ink"
          >
            {CONTACT.email}
          </a>
        </div>

        <p className="mt-12 flex flex-wrap gap-x-6 gap-y-2">
          <span className="text-[0.7rem] tracking-label text-ink-faint uppercase">
            {CONTACT.location}
          </span>
          {SOCIALS.map((social) => (
            <ExternalLink key={social.label} href={social.url}>
              {social.label}
            </ExternalLink>
          ))}
        </p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

/**
 * One stop on the route. On wide screens the stop marker rides down the left
 * while the section scrolls past it.
 */
function Section({ stop: id, intro, children }: { stop: StopId; intro: string; children: ReactNode }) {
  const mission = missionById(id);
  const { anchor, accent } = stop(id);

  return (
    <section
      id={anchor}
      aria-labelledby={`${anchor}-heading`}
      className="scroll-mt-24 border-b border-edge py-20 sm:py-28 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12"
    >
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="flex items-center gap-3 text-[0.66rem] tracking-label text-ink-faint uppercase">
          <StopBadge index={mission.index} accent={accent} />
          {mission.district}
        </p>
      </div>

      <div className="mt-6 lg:mt-0">
        <h2
          id={`${anchor}-heading`}
          className="text-3xl font-medium tracking-display text-ink sm:text-5xl"
        >
          {mission.title}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted">{intro}</p>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

function StopBadge({ index, accent }: { index: string; accent: string }) {
  return (
    <span
      className="grid size-9 shrink-0 place-items-center rounded-full border font-mono text-[0.7rem] tracking-normal"
      style={{ borderColor: accent, color: accent }}
    >
      {index}
    </span>
  );
}

/** A hairline in the item's accent across the top edge of a card. */
function AccentEdge({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-6 top-0 h-px sm:inset-x-7"
      style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
    />
  );
}

function Chips({ items, accent, className }: { items: string[]; accent?: string; className?: string }) {
  return (
    <ul className={"flex flex-wrap gap-1.5" + (className ? ` ${className}` : "")}>
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-edge px-2.5 py-1 text-[0.7rem] text-ink-muted"
          style={accent ? { borderColor: `${accent}55`, color: accent } : undefined}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function ExternalLink({ href, strong, children }: { href: string; strong?: boolean; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={
        "text-[0.7rem] tracking-label uppercase transition-colors hover:text-ink " +
        (strong ? "text-ink underline underline-offset-4" : "text-ink-faint")
      }
    >
      {children}
    </a>
  );
}
