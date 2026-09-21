/**
 * Studio identity and SEO defaults.
 *
 * PLACEHOLDER: the name, domain and contact details below are stand-ins.
 * Replace them before deploying — they are referenced by the metadata,
 * the sitemap, robots.txt and the structured data.
 */

export const SITE = {
  name: "Overland",
  /** Used in <title> and the Open Graph site name. */
  legalName: "Overland Engineering Studio",
  tagline: "We build things that ship.",
  description:
    "A small engineering team building modern digital products, SaaS platforms, AI experiences and Web3 applications.",
  /** No trailing slash. */
  url: "https://example.com",
  locale: "en_GB",
} as const;

export const CONTACT = {
  email: "hello@example.com",
  location: "Remote",
} as const;

export const SOCIALS: { label: string; url: string }[] = [
  { label: "GitHub", url: "https://github.com" },
  { label: "LinkedIn", url: "https://linkedin.com" },
];

/** The landing copy, kept here so the 3D and HTML routes stay in sync. */
export const LANDING = {
  headline: "WE BUILD THINGS THAT SHIP.",
  subheading:
    "A small engineering team building modern digital products, SaaS platforms, AI experiences and Web3 applications.",
  cta: "START THE MISSION",
  secondaryCta: "Read without the 3D world",
} as const;
