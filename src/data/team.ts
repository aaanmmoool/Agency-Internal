import type { TeamMember } from "@/types";

/**
 * The two developers behind the studio.
 *
 * Written without inflated claims: roles describe what each person does, and
 * `achievements` describe work that was actually shipped. Employment at a
 * company is described as employment, not as client work.
 *
 * TODO before launch: Manas's skills and socials, and Anmol's years of
 * experience and startup details from his resume.
 */
export const team: TeamMember[] = [
  {
    id: "anmol-singh",
    name: "Anmol Singh",
    role: "Full-Stack & Web3 Engineer",
    experience: "Freelance",
    skills: ["TypeScript", "React", "React Native", "Node.js", "Three.js", "Solidity", "Python", "PostgreSQL"],
    bio: "Builds products end to end, from the database schema to the interface. Worked with a Europe-based startup before going freelance.",
    achievements: [
      "Built Edunex, a school ERP with a React Native app, an admin dashboard and an Express + Prisma API, and runs it in production.",
      "Built DeskX, an offline Windows app and command-line tool that strips sensitive data from spreadsheets before they're shared.",
      "Built the 3D front end and the smart contracts for the Ethical Xchange data marketplace.",
    ],
    projects: ["edunex", "deskx", "ethx-frontend", "ethx-contracts"],
    socials: [{ label: "GitHub", url: "https://github.com/aaanmmoool" }],
    accent: "#7DA3FF",
  },
  {
    id: "manas-singh",
    name: "Manas Singh",
    role: "Software Engineer",
    experience: "2 years",
    // TODO: real skills.
    skills: [],
    bio: "Around two years of engineering at FischerJordan and Highspot. Has worked alongside Anmol on every project in this portfolio.",
    achievements: [
      "Employed as an engineer at FischerJordan.",
      "Employed as an engineer at Highspot.",
      "Worked on Edunex, DeskX and both Ethical Xchange builds.",
    ],
    projects: ["edunex", "deskx", "ethx-frontend", "ethx-contracts"],
    socials: [],
    accent: "#8FE3C4",
  },
];
