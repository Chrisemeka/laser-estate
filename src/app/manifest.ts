import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/constants";

/** PWA manifest — used when a user adds the site to their Android home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.short,
    description: "Prime real estate in Lagos — Ikoyi, VI, Banana Island, Lekki.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7F2",
    theme_color: "#141414",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
