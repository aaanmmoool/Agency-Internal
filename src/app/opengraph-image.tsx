import { ImageResponse } from "next/og";
import { LANDING, SITE } from "@/config/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The social card, generated at build time.
 *
 * Rendering it here rather than shipping a PNG keeps the card in sync with the
 * copy in `config/site.ts` and avoids another binary asset in the repository.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0B0E18 0%, #06070B 55%, #0A1226 100%)",
          color: "#EEF1F7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 6, color: "#9AA3B8" }}>
          <span>{SITE.name.toUpperCase()}</span>
          <span>ENGINEERING STUDIO</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, lineHeight: 1.02, letterSpacing: -2, fontWeight: 600, maxWidth: 940 }}>
            {LANDING.headline}
          </div>
          <div style={{ marginTop: 28, fontSize: 28, lineHeight: 1.45, color: "#9AA3B8", maxWidth: 860 }}>
            {SITE.description}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 96, height: 3, background: "#7DA3FF" }} />
          <div style={{ fontSize: 20, letterSpacing: 4, color: "#656D80" }}>
            SAAS · AI · WEB3 · REAL-TIME
          </div>
        </div>
      </div>
    ),
    size,
  );
}
