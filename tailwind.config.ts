import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#060F1E",
          900: "#0A1B33",
          800: "#0E2648",
          700: "#15335C",
          600: "#1D4472",
        },
        gold: {
          400: "#E3BA6C",
          500: "#C79A44",
          600: "#A87B2E",
        },
        paper: "#F6F7F9",
        ink: "#0A1B33",
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        "chart-grid":
          "linear-gradient(rgba(199,154,68,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(199,154,68,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
    },
  },
  plugins: [],
};
export default config;
