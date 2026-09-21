import type { TeamMember } from "@/types";

/**
 * PLACEHOLDER CONTENT — replace with the real team before launch.
 *
 * Deliberately written without inflated claims: roles describe what each person
 * does, `experience` is a plain year count, and `achievements` describe work
 * that was actually shipped. Employment at a company is described as employment,
 * not as freelance client work.
 */
export const team: TeamMember[] = [
  {
    id: "member-01",
    name: "Team Member One",
    role: "Full-Stack Engineer",
    experience: "5 years",
    skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "AWS"],
    bio: "Builds product surfaces end to end, from schema design through to the interface. Works day to day on multi-tenant web applications and the APIs behind them.",
    achievements: [
      "Employed as a product engineer at a mid-size software company, working on a customer-facing billing platform.",
      "Led the migration of a monolithic Express service to a typed, modular Next.js application.",
      "Maintains the shared component library used across the studio's client work.",
    ],
    projects: ["project-01", "project-04"],
    socials: [
      { label: "GitHub", url: "https://github.com" },
      { label: "LinkedIn", url: "https://linkedin.com" },
    ],
    accent: "#7DA3FF",
  },
  {
    id: "member-02",
    name: "Team Member Two",
    role: "AI & Backend Engineer",
    experience: "4 years",
    skills: ["Python", "TypeScript", "LLM APIs", "Vector search", "FastAPI", "Docker"],
    bio: "Works on retrieval pipelines, evaluation harnesses and the unglamorous plumbing that makes model-backed features predictable in production.",
    achievements: [
      "Built an internal document-retrieval service now used by a support team of roughly twenty people.",
      "Set up evaluation and regression tracking for a production LLM feature before rollout.",
      "Contributed backend services during employment at an enterprise software vendor.",
    ],
    projects: ["project-02", "project-01"],
    socials: [
      { label: "GitHub", url: "https://github.com" },
      { label: "LinkedIn", url: "https://linkedin.com" },
    ],
    accent: "#8FE3C4",
  },
  {
    id: "member-03",
    name: "Team Member Three",
    role: "Web3 & Systems Engineer",
    experience: "4 years",
    skills: ["Solidity", "TypeScript", "Foundry", "ethers.js", "Rust", "The Graph"],
    bio: "Writes and reviews smart contracts, and the indexing and wallet-facing layers that sit around them. Prefers small contracts with tests over clever ones.",
    achievements: [
      "Shipped and verified ERC-20 and ERC-721 contracts on public testnets and mainnet for client projects.",
      "Built a subgraph-backed indexer serving on-chain activity to a trading dashboard.",
      "Wrote the internal review checklist the team uses before any contract deployment.",
    ],
    projects: ["project-03"],
    socials: [
      { label: "GitHub", url: "https://github.com" },
      { label: "LinkedIn", url: "https://linkedin.com" },
    ],
    accent: "#C9A7FF",
  },
  {
    id: "member-04",
    name: "Team Member Four",
    role: "UI/UX & Frontend Engineer",
    experience: "5 years",
    skills: ["React", "TypeScript", "Three.js", "GSAP", "Figma", "Accessibility"],
    bio: "Designs and implements interface systems, with a focus on motion that carries meaning and on interfaces that still work with a keyboard and a screen reader.",
    achievements: [
      "Designed and built the design system used across three of the studio's client products.",
      "Took a client dashboard from a failing accessibility audit to WCAG 2.1 AA conformance.",
      "Employed as a frontend engineer at a consumer product company before joining the studio.",
    ],
    projects: ["project-04", "project-02"],
    socials: [
      { label: "GitHub", url: "https://github.com" },
      { label: "Dribbble", url: "https://dribbble.com" },
    ],
    accent: "#FFC48F",
  },
];
