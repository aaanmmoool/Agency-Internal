import type { Service } from "@/types";

export const services: Service[] = [
  {
    id: "full-stack",
    title: "Full-Stack Development",
    summary:
      "Complete product builds: data model, API, interface and the deployment pipeline that keeps them shipping.",
    deliverables: ["Architecture and schema design", "API and application code", "CI/CD and environments"],
    stack: ["TypeScript", "Next.js", "Node.js", "PostgreSQL"],
    accent: "#7DA3FF",
  },
  {
    id: "saas",
    title: "SaaS Development",
    summary:
      "Multi-tenant platforms with the parts that are tedious to retrofit: billing, roles, audit trails and onboarding.",
    deliverables: ["Tenancy and access control", "Billing and subscriptions", "Admin and support tooling"],
    stack: ["Next.js", "Prisma", "Stripe", "AWS"],
    accent: "#9AD4FF",
  },
  {
    id: "ai",
    title: "AI & Automation",
    summary:
      "Model-backed features with retrieval, evaluation and human review built in from the start rather than bolted on.",
    deliverables: ["Retrieval pipelines", "Evaluation and regression tracking", "Review and fallback flows"],
    stack: ["Python", "Claude API", "pgvector", "FastAPI"],
    accent: "#8FE3C4",
  },
  {
    id: "web3",
    title: "Web3 Development",
    summary:
      "Contracts, indexers and wallet-facing interfaces, written small and tested hard before anything is deployed.",
    deliverables: ["Contract development and tests", "Indexing and subgraphs", "Wallet-connected front ends"],
    stack: ["Solidity", "Foundry", "The Graph", "ethers.js"],
    accent: "#C9A7FF",
  },
  {
    id: "uiux",
    title: "UI/UX Engineering",
    summary:
      "Interface systems and motion design implemented in code, with accessibility treated as a requirement.",
    deliverables: ["Design systems", "Interaction and motion", "Accessibility conformance"],
    stack: ["React", "Three.js", "GSAP", "Figma"],
    accent: "#FFC48F",
  },
];
