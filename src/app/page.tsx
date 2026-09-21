import { MissionExperience } from "@/components/MissionExperience";
import { StructuredData } from "@/components/StructuredData";

/**
 * The single route.
 *
 * `MissionExperience` is a client component, but everything it renders on the
 * server — the full static document — is in the initial HTML, so the page is
 * meaningful before any JavaScript runs.
 */
export default function Home() {
  return (
    <>
      <StructuredData />
      <MissionExperience />
    </>
  );
}
