import { CONTACT, SITE, SOCIALS } from "@/config/site";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { team } from "@/data/team";

/**
 * JSON-LD describing the studio, its people and its work.
 *
 * Rendered on the server so it is present without JavaScript. Mirrors the
 * static document exactly — nothing here is claimed that the page does not say.
 */
export function StructuredData() {
  const graph = [
    {
      "@type": "ProfessionalService",
      "@id": `${SITE.url}#organization`,
      name: SITE.legalName,
      alternateName: SITE.name,
      url: SITE.url,
      description: SITE.description,
      email: CONTACT.email,
      areaServed: CONTACT.location,
      sameAs: SOCIALS.map((s) => s.url),
      employee: team.map((member) => ({
        "@type": "Person",
        name: member.name,
        jobTitle: member.role,
        knowsAbout: member.skills,
      })),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Engineering services",
        itemListElement: services.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.title,
            description: service.summary,
          },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
      publisher: { "@id": `${SITE.url}#organization` },
    },
    {
      "@type": "ItemList",
      "@id": `${SITE.url}#projects`,
      name: "Selected projects",
      itemListElement: projects.map((project, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: project.title,
          description: project.description,
          about: project.category,
          keywords: project.technologies.join(", "),
          ...(project.liveUrl ? { url: project.liveUrl } : {}),
        },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Static, author-controlled data — no user input reaches this string.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
