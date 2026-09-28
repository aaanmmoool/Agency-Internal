import type { TeamMember } from "@/types";

/**
 * The two developers behind the studio.
 *
 * Written without inflated claims: roles describe what each person does, and
 * `achievements` describe work that was actually shipped. Employment at a
 * company is described as employment, not as client work.
 *
 * Anmol's entry is taken from his resume. TODO before launch: Manas's skills
 * and socials.
 */
export const team: TeamMember[] = [
  {
    id: "anmol-singh",
    name: "Anmol Singh",
    role: "Full-Stack Engineer",
    experience: "8+ months",
    skills: [
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Express",
      "MongoDB",
      "Redis",
      "AWS",
      "Docker",
      "Socket.IO",
      "Three.js",
      "Solidity",
    ],
    bio: "Full-stack engineer building cloud-native products with React, Node.js, TypeScript and AWS. Interned at a Europe-based startup and two product companies before taking on freelance work. B.Tech in Computer Science, VIT Bhopal.",
    achievements: [
      "Software engineering intern at Mea-tec Battery Intelligence, a Europe-based startup: built a React and TypeScript component library of 20+ components shared across three internal products, and integrated AI models into the core application.",
      "Software engineering intern at Qualimatrix: worked on an AI-powered hiring platform, including a real-time Socket.IO screening chatbot, Redis caching and services on AWS EC2, S3 and SES.",
      "Software engineering intern at Venturloop: built admin dashboard pages in React with React Router and React Query.",
      "Freelance: built Edunex, DeskX, and the 3D front end and smart contracts for the Ethical Xchange data marketplace.",
    ],
    projects: ["edunex", "deskx", "ethx-frontend", "ethx-contracts"],
    socials: [
      { label: "GitHub", url: "https://github.com/aaanmmoool" },
      { label: "LinkedIn", url: "https://www.linkedin.com/in/anmol-singh-09854b251/" },
      { label: "LeetCode", url: "https://leetcode.com/u/aaannmmool/" },
    ],
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
