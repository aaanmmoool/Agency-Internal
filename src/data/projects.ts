import type { Project } from "@/types";

/**
 * PLACEHOLDER CONTENT — replace with real case studies before launch.
 * Every field is rendered somewhere, so keep the shape and swap the words.
 */
export const projects: Project[] = [
  {
    id: "project-01",
    index: "01",
    title: "Operations SaaS Platform",
    category: "SaaS Platform",
    description:
      "A multi-tenant operations dashboard for teams that coordinate field work across several sites.",
    problem:
      "Scheduling lived in spreadsheets duplicated per region. Nobody could see current capacity, and conflicting edits were resolved by phone call.",
    solution:
      "A single tenanted application with row-level access control, an audit trail on every change, and a conflict-aware scheduling view that reconciles concurrent edits.",
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "tRPC", "AWS"],
    contribution:
      "We designed the data model, built the application and the API, and handled the migration of existing spreadsheet data.",
    liveUrl: undefined,
    githubUrl: undefined,
    accent: "#7DA3FF",
  },
  {
    id: "project-02",
    index: "02",
    title: "Document Intelligence Product",
    category: "AI Product",
    description:
      "A retrieval and summarisation tool that answers questions against a customer's own document library.",
    problem:
      "Support staff were reading long PDFs to answer repeat questions. Answers varied between people and nothing was traceable back to a source.",
    solution:
      "A retrieval pipeline with chunk-level citations, an evaluation set that runs on every change, and a review queue for answers the model is unsure about.",
    technologies: ["Python", "FastAPI", "Claude API", "pgvector", "Next.js", "Docker"],
    contribution:
      "We built the ingestion and retrieval services, the evaluation harness, and the reviewer interface.",
    liveUrl: undefined,
    githubUrl: undefined,
    accent: "#8FE3C4",
  },
  {
    id: "project-03",
    index: "03",
    title: "On-Chain Asset Platform",
    category: "Web3 Platform",
    description:
      "A web application for issuing, transferring and tracking tokenised assets, with a read-only public explorer.",
    problem:
      "Issuance was manual and error-prone, and holders had no reliable view of their position without trusting an off-chain spreadsheet.",
    solution:
      "Audited, minimal contracts for issuance and transfer, a subgraph indexer for history, and a wallet-connected interface that reads state directly from chain.",
    technologies: ["Solidity", "Foundry", "The Graph", "ethers.js", "Next.js", "TypeScript"],
    contribution:
      "We wrote and tested the contracts, built the indexer and the front end, and ran the deployment process.",
    liveUrl: undefined,
    githubUrl: undefined,
    accent: "#C9A7FF",
  },
  {
    id: "project-04",
    index: "04",
    title: "Live Collaboration Workspace",
    category: "Real-Time Application",
    description:
      "A shared workspace where several people edit the same board at once and see each other's cursors and changes immediately.",
    problem:
      "The previous tool saved on a timer. Concurrent edits silently overwrote each other and users lost work often enough to stop trusting it.",
    solution:
      "A CRDT-backed document model over WebSockets, with presence, offline editing and reconnection that merges rather than overwrites.",
    technologies: ["TypeScript", "WebSockets", "Yjs", "Redis", "Node.js", "React"],
    contribution:
      "We rebuilt the document layer, implemented presence and reconnection, and load-tested the socket tier.",
    liveUrl: undefined,
    githubUrl: undefined,
    accent: "#FFC48F",
  },
];

export const projectById = (id: string): Project | undefined =>
  projects.find((p) => p.id === id);
