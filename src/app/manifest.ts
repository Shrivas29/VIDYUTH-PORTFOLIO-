import type { MetadataRoute } from "next";

// Web app manifest: names the site on the mobile home screen and sets the
// theme/background so an installed shortcut matches the ink splash. Next
// serves this at /manifest.webmanifest and injects the <link> automatically.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vidyuth Nº12 — Karting to Formula 1",
    short_name: "Vidyuth Nº12",
    description:
      "Official site of Vidyuth, 12-year-old karting driver from Coimbatore racing toward Formula 1.",
    start_url: "/",
    display: "standalone",
    background_color: "#000016",
    theme_color: "#000016",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
