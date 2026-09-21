/**
 * Shared domain types for the mission experience.
 * Content lives in `src/data`, never inside components.
 */

export type MissionId =
  | "intro"
  | "team"
  | "experience"
  | "projects"
  | "services"
  | "process"
  | "final";

/** A mission occupies a contiguous slice of the journey timeline (0..1). */
export interface Mission {
  id: MissionId;
  /** Zero-padded display index, e.g. "01". "00" for the intro. */
  index: string;
  title: string;
  /** Short district name shown in the HUD. */
  district: string;
  /** Inclusive start of the mission on the global progress timeline. */
  start: number;
  /** Exclusive end of the mission on the global progress timeline. */
  end: number;
  /** XP awarded once the mission is entered. Purely cosmetic. */
  xp: number;
  /** Camera behaviour used while this mission is active. */
  camera: CameraMode;
}

export type CameraMode =
  | "cinematic"
  | "follow"
  | "destination"
  | "showcase"
  | "orbit";

export interface SocialLink {
  label: string;
  url: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  /** Human-readable experience summary, e.g. "5 years". */
  experience: string;
  skills: string[];
  bio: string;
  /** Notable work, phrased factually. */
  achievements: string[];
  /** Ids of projects in `projects.ts` this member contributed to. */
  projects: string[];
  socials: SocialLink[];
  /** Accent colour used for the member's marker in the 3D world. */
  accent: string;
}

export type ProjectCategory =
  | "SaaS Platform"
  | "AI Product"
  | "Web3 Platform"
  | "Real-Time Application";

export interface Project {
  id: string;
  /** Display index, e.g. "01". */
  index: string;
  title: string;
  category: ProjectCategory;
  description: string;
  problem: string;
  solution: string;
  technologies: string[];
  /** What this team specifically built. */
  contribution: string;
  /** Path under /public/images. Optional: a gradient placeholder is drawn if absent. */
  image?: string;
  liveUrl?: string;
  githubUrl?: string;
  accent: string;
}

export interface Service {
  id: string;
  title: string;
  summary: string;
  /** Concrete deliverables, kept short. */
  deliverables: string[];
  stack: string[];
  accent: string;
}

export interface ProcessStep {
  index: string;
  title: string;
  description: string;
  /** What the client actually receives at this step. */
  output: string;
}

export interface ExperienceLandmark {
  id: string;
  label: string;
  detail: string;
  accent: string;
  /** Position along the journey timeline where the landmark sits. */
  at: number;
}

/** Device capability tier, resolved once on mount. */
export type QualityTier = "high" | "medium" | "low";
