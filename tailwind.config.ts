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
          950: "rgb(var(--c-navy-950) / <alpha-value>)",
          900: "rgb(var(--c-navy-900) / <alpha-value>)",
          800: "rgb(var(--c-navy-800) / <alpha-value>)",
          700: "rgb(var(--c-navy-700) / <alpha-value>)",
          600: "rgb(var(--c-navy-600) / <alpha-value>)",
        },
        gold: {
          400: "rgb(var(--c-gold-400) / <alpha-value>)",
          500: "rgb(var(--c-gold-500) / <alpha-value>)",
          600: "rgb(var(--c-gold-600) / <alpha-value>)",
        },
        paper: "#F6F7F9",
        ink: "rgb(var(--c-navy-900) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Oswald", "sans-serif"],
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
