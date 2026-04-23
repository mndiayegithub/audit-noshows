import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    { pattern: /(bg|text|border|ring)-(primaryDark|accentGreen|kpiVolume|kpiSignal|kpiTaux|kpiArgent)(-fg|-deep)?/ },
  ],
  theme: {
    extend: {
      colors: {
        primaryDark: "#064E3B",
        accentGreen: "#10B981",
        kpiVolume:   { DEFAULT: "#DFF3FF", fg: "#2563EB" },
        kpiSignal:   { DEFAULT: "#DCF4E6", fg: "#059669" },
        kpiTaux:     { DEFAULT: "#FCEACC", fg: "#EA580C" },
        kpiArgent:   { DEFAULT: "#ECCDF8", fg: "#9333EA", deep: "#6B21A8" },
      },
      fontFamily: {
        sans:  ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        cta: "0 12px 40px -16px rgba(6,78,59,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
