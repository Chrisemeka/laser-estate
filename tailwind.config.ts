import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#141414",
          soft: "#2A2A2A",
          muted: "#5C5C5C",
          faint: "#8A8A8A",
        },
        ivory: {
          DEFAULT: "#FAF7F2",
          warm: "#F3EEE4",
          line: "#E8E2D5",
        },
        accent: {
          DEFAULT: "#C8102E",
          dark: "#9A0C24",
          soft: "#F5D6DC",
        },
        gold: {
          DEFAULT: "#B8935A",
          soft: "#E6D4B0",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.25em",
      },
      boxShadow: {
        soft: "0 2px 20px rgba(20,20,20,0.06)",
        elevated: "0 10px 40px rgba(20,20,20,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
