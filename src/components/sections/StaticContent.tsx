import { CONTACT, LANDING, SITE, SOCIALS } from "@/config/site";
import { experienceLandmarks, missions } from "@/data/missions";
import { processSteps } from "@/data/process";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { team } from "@/data/team";

interface Props {
  /** Rendered by the client when it can offer the interactive route. */
  onEnterWorld?: () => void;
}

/**
 * The complete site as ordinary HTML.
 *
 * This is what the server sends, what a crawler reads, and what anyone without
 * JavaScript or WebGL gets. Every word shown inside the 3D experience also
 * appears here — the world is an enhancement over this document, not a
 * replacement for it.
 */
export function StaticContent({ onEnterWorld }: Props) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-8">
      <header>
        <p className="text-[0.72rem] font-medium tracking-label text-ink uppercase">
          {SITE.name}
        </p>
        <h1 className="mt-10 text-[clamp(2rem,6vw,3.4rem)] leading-[1.02] font-medium tracking-display text-balance text-ink">
          {LANDING.headline}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted">
          {LANDING.subheading}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href={`mailto:${CONTACT.email}`}
            className="inline-flex items-center rounded-full bg-ink px-6 py-3 text-[0.8rem] font-medium tracking-label text-void uppercase transition-colors hover:bg-white"
          >
            Start a project
          </a>
          {onEnterWorld && (
            <button
              type="button"
              onClick={onEnterWorld}
              className="text-[0.72rem] tracking-label text-ink-faint uppercase transition-colors hover:text-ink"
            >
              Open the interactive world
            </button>
          )}
        </div>
      </header>

      <nav aria-label="Sections" className="mt-16 border-y border-edge py-4">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {missions
            .filter((m) => m.id !== "intro" && m.id !== "final")
            .map((mission) => (
              <li key={mission.id}>
                <a
                  href={`#${mission.id}`}
                  className="text-[0.7rem] tracking-label text-ink-faint uppercase transition-colors hover:text-ink"
                >
                  {mission.title}
                </a>
              </li>
            ))}
          <li>
            <a
              href="#contact"
              className="text-[0.7rem] tracking-label text-ink-faint uppercase transition-colors hover:text-ink"
            >
              Contact
            </a>
          </li>
        </ul>
      </nav>

      {/* --- Team ---------------------------------------------------------- */}
      <Section id="team" index="01" title="The Team">
        <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
          Four engineers. We take on a small number of projects at a time so the people
          you meet are the people who write the code.
        </p>
        <ul className="mt-8 space-y-10">
          {team.map((member) => (
            <li key={member.id}>
              <h3 className="text-lg font-medium text-ink">{member.name}</h3>
              <p className="mt-1 text-[0.74rem] tracking-label uppercase" style={{ color: member.accent }}>
                {member.role} · {member.experience}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">{member.bio}</p>

              <h4 className="mt-4 text-[0.68rem] tracking-label text-ink-faint uppercase">
                Selected work
              </h4>
              <ul className="mt-2 space-y-1.5">
                {member.achievements.map((item) => (
                  <li key={item} className="max-w-xl text-sm leading-relaxed text-ink-muted">
                    — {item}
                  </li>
                ))}
              </ul>

              <h4 className="mt-4 text-[0.68rem] tracking-label text-ink-faint uppercase">
                Skills
              </h4>
              <p className="mt-1 text-sm text-ink-muted">{member.skills.join(", ")}</p>

              {member.socials.length > 0 && (
                <p className="mt-3 flex gap-4">
                  {member.socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      rel="noreferrer noopener"
                      target="_blank"
                      className="text-[0.7rem] tracking-label text-ink-faint uppercase hover:text-ink"
                    >
                      {social.label}
                    </a>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {/* --- Experience ---------------------------------------------------- */}
      <Section id="experience" index="02" title="Experience">
        <dl className="space-y-6">
          {experienceLandmarks.map((landmark) => (
            <div key={landmark.id}>
              <dt
                className="text-[0.74rem] tracking-label uppercase"
                style={{ color: landmark.accent }}
              >
                {landmark.label}
              </dt>
              <dd className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                {landmark.detail}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* --- Projects ------------------------------------------------------ */}
      <Section id="projects" index="03" title="Projects">
        <ul className="space-y-14">
          {projects.map((project) => (
            <li key={project.id}>
              <p className="text-[0.7rem] tracking-label uppercase" style={{ color: project.accent }}>
                Project {project.index} · {project.category}
              </p>
              <h3 className="mt-2 text-xl font-medium tracking-display text-ink">
                {project.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
                {project.description}
              </p>

              <dl className="mt-5 space-y-4">
                <Definition label="Problem">{project.problem}</Definition>
                <Definition label="Solution">{project.solution}</Definition>
                <Definition label="Our contribution">{project.contribution}</Definition>
                <Definition label="Technology">{project.technologies.join(", ")}</Definition>
              </dl>

              {(project.liveUrl || project.githubUrl) && (
                <p className="mt-4 flex gap-4">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      rel="noreferrer noopener"
                      target="_blank"
                      className="text-[0.7rem] tracking-label text-ink uppercase underline underline-offset-4"
                    >
                      Live demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      rel="noreferrer noopener"
                      target="_blank"
                      className="text-[0.7rem] tracking-label text-ink-faint uppercase underline underline-offset-4"
                    >
                      Source
                    </a>
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Section>

      {/* --- Services ------------------------------------------------------ */}
      <Section id="services" index="04" title="Services">
        <ul className="space-y-8">
          {services.map((service) => (
            <li key={service.id}>
              <h3 className="text-base font-medium text-ink">{service.title}</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                {service.summary}
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                <span className="text-[0.68rem] tracking-label text-ink-faint uppercase">
                  Deliverables
                </span>{" "}
                — {service.deliverables.join(", ")}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                <span className="text-[0.68rem] tracking-label text-ink-faint uppercase">
                  Stack
                </span>{" "}
                — {service.stack.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* --- Process ------------------------------------------------------- */}
      <Section id="process" index="05" title="How We Work">
        <ol className="space-y-8">
          {processSteps.map((step) => (
            <li key={step.index}>
              <h3 className="text-base font-medium text-ink">
                <span className="mr-3 font-mono text-[0.78rem] text-ink-faint">{step.index}</span>
                {step.title}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                {step.description}
              </p>
              <p className="mt-2 text-sm text-ink-faint">
                <span className="text-[0.68rem] tracking-label uppercase">Output</span> —{" "}
                {step.output}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* --- Contact ------------------------------------------------------- */}
      <Section id="contact" index="06" title="Start A Project">
        <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
          Tell us what you have in mind. We will come back with a scope, an honest
          estimate and the first thing we would build.
        </p>
        <p className="mt-6">
          <a
            href={`mailto:${CONTACT.email}`}
            className="text-base text-ink underline underline-offset-4"
          >
            {CONTACT.email}
          </a>
        </p>
        <p className="mt-2 text-sm text-ink-faint">{CONTACT.location}</p>
        <p className="mt-6 flex gap-5">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.url}
              rel="noreferrer noopener"
              target="_blank"
              className="text-[0.7rem] tracking-label text-ink-faint uppercase hover:text-ink"
            >
              {social.label}
            </a>
          ))}
        </p>
      </Section>

      <footer className="mt-24 border-t border-edge pt-8">
        <p className="text-[0.68rem] tracking-label text-ink-faint uppercase">
          {SITE.legalName}
        </p>
      </footer>
    </div>
  );
}

function Section({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mt-20 scroll-mt-8">
      <p className="font-mono text-[0.7rem] text-ink-faint">{index}</p>
      <h2
        id={`${id}-heading`}
        className="mt-2 text-2xl font-medium tracking-display text-ink sm:text-3xl"
      >
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Definition({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.68rem] tracking-label text-ink-faint uppercase">{label}</dt>
      <dd className="mt-1 max-w-xl text-sm leading-relaxed text-ink-muted">{children}</dd>
    </div>
  );
}
