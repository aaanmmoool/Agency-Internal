import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

/**
 * The experience is a single document; the mission sections are fragments of
 * it, so they are listed as anchors rather than separate URLs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
