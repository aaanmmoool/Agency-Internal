import type { ProcessStep } from "@/types";

export const processSteps: ProcessStep[] = [
  {
    index: "01",
    title: "Discover",
    description:
      "We work out what the product actually has to do, who uses it, and which constraints are real rather than assumed.",
    output: "A written scope, a risk list, and an estimate we stand behind.",
  },
  {
    index: "02",
    title: "Plan",
    description:
      "Architecture, data model and delivery order. We sequence the work so the risky parts are proven first, not last.",
    output: "Technical plan, milestones and a working schedule.",
  },
  {
    index: "03",
    title: "Build",
    description:
      "Short iterations against a running deployment. You see the product in a usable state throughout, not at the end.",
    output: "Reviewable increments on a staging environment.",
  },
  {
    index: "04",
    title: "Test",
    description:
      "Automated tests on the paths that matter, plus load, accessibility and security checks appropriate to the product.",
    output: "Test suite, audit results and a fixed defect list.",
  },
  {
    index: "05",
    title: "Ship",
    description:
      "Production deployment with monitoring, rollback and a handover that lets your team run it without us.",
    output: "Live system, documentation and a support window.",
  },
];
