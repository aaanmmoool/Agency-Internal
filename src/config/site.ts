/**
 * Studio identity and SEO defaults.
 *
 * PLACEHOLDER: the studio name below is still a stand-in. The URL is the live
 * Vercel deployment — it is referenced by the metadata, the sitemap,
 * robots.txt and the structured data.
 */

export const SITE = {
  name: "Overland",
  /** Used in <title> and the Open Graph site name. */
  legalName: "Overland Engineering Studio",
  tagline: "We build things that ship.",
  description:
    "A small engineering team building modern digital products, SaaS platforms, AI experiences and Web3 applications.",
  /** No trailing slash. */
  url: "https://agency-internal-sooty.vercel.app",
  locale: "en_GB",
} as const;

export const CONTACT = {
  email: "anmolsinghtron123@gmail.com",
  location: "Remote",
} as const;

export const SOCIALS: { label: string; url: string }[] = [
  { label: "GitHub", url: "https://github.com/aaanmmoool" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/anmol-singh-09854b251/" },
];

/** The landing copy, kept here so the 3D and HTML routes stay in sync. */
export const LANDING = {
  headline: "WE BUILD THINGS THAT SHIP.",
  subheading:
    "A small engineering team building modern digital products, SaaS platforms, AI experiences and Web3 applications.",
  cta: "START THE MISSION",
  secondaryCta: "Read without the 3D world",
} as const;
