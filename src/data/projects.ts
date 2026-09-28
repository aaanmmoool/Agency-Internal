import type { Project } from "@/types";

/**
 * The studio's shipped work. Every field is rendered somewhere, so keep the
 * shape when adding to it. Descriptions stick to what the code does.
 */
export const projects: Project[] = [
  {
    id: "edunex",
    index: "01",
    title: "Edunex",
    category: "School ERP",
    description:
      "A school management system in three parts: a mobile app for students and teachers, a web dashboard for the school office, and the API behind both.",
    problem:
      "The school needed one place for classes, students, teachers, fees, attendance, timetables and notices, reachable from a phone by students and teachers and from the web by the office.",
    solution:
      "An Expo React Native app with separate student and teacher logins by school code, a React admin dashboard for classes, fees, attendance and documents, and an Express + Prisma API on PostgreSQL with files in Cloudflare R2. Every record is scoped to a school, so the same system can serve more schools later.",
    technologies: ["React Native", "Expo", "React", "Express", "Prisma", "PostgreSQL", "Cloudflare R2"],
    contribution:
      "Our first freelance project. We built the API and database, the admin dashboard and the mobile app, and run its deployments on Render and Cloudflare Pages.",
    liveUrl: undefined,
    githubUrl: undefined,
    accent: "#7DA3FF",
  },
  {
    id: "deskx",
    index: "02",
    title: "DeskX",
    category: "Desktop Application",
    description:
      "An offline Windows desktop app, with a matching command-line tool, that strips sensitive data out of spreadsheets before they're shared.",
    problem:
      "Non-technical staff needed to share CSV, Excel and JSON files without leaking personal data, and without uploading those files to an online tool to clean them.",
    solution:
      "A PySide6 desktop app and a CLI over one processing engine. Users preview a file, pick columns and run a saved sanitising pipeline; results go to a new file with SHA-256 checks before and after, so the original is never touched. A locked-down fetcher can also pull tables from HTTPS pages.",
    technologies: ["Python", "PySide6", "pandas", "Typer", "pytest", "PyInstaller"],
    contribution:
      "We built the processing engine, the file adapters, the desktop interface and the CLI, plus the Windows packaging and installer.",
    liveUrl: undefined,
    githubUrl: undefined,
    accent: "#8FE3C4",
  },
  {
    id: "ethx-frontend",
    index: "03",
    title: "Ethical Xchange — 3D Marketplace",
    category: "Web3 Frontend",
    description:
      "The front end of Ethical Xchange, a marketplace where people control and sell access to their own data, with purchases settled in ETH on Ethereum.",
    problem:
      "Ethical Xchange is infrastructure for many marketplaces, not one. Prospects needed to see their own industry running on it rather than a generic demo.",
    solution:
      "A multi-tenant Next.js site with a Three.js hero scene. Each tenant, from a creator network to an AI data company, gets its own branding and marketplace variant from the same codebase, chosen per request.",
    technologies: ["Next.js", "React Three Fiber", "Three.js", "TypeScript", "Framer Motion", "Docker"],
    contribution:
      "We built the 3D landing experience, the tenant system and the dashboard screens, and containerised the app for deployment.",
    liveUrl: undefined,
    githubUrl: undefined,
    accent: "#C9A7FF",
  },
  {
    id: "ethx-contracts",
    index: "04",
    title: "Ethical Xchange — Contracts & API",
    category: "Smart Contracts & API",
    description:
      "The payment and delivery layer behind the same marketplace: Solidity contracts that settle purchases in ETH, and the API that ties wallets, consent and encrypted files together.",
    problem:
      "A data marketplace needs secure payment, secure delivery, provenance and an audit trail in one flow, without putting files or personal data on-chain.",
    solution:
      "An escrow contract and a file-instance sale contract with EIP-712 signed listings, pausing and reentrancy guards, covered by Foundry fuzz and invariant tests and run on Sepolia. An Express API handles Sign-In with Ethereum, wallet binding, consent and grants and encrypted file storage, and indexes sales from chain.",
    technologies: ["Solidity", "Foundry", "Ethereum", "viem", "Express", "TypeScript"],
    contribution:
      "We wrote and tested the contracts and built the API services around them.",
    liveUrl: undefined,
    githubUrl: undefined,
    accent: "#FFC48F",
  },
];

export const projectById = (id: string): Project | undefined =>
  projects.find((p) => p.id === id);
