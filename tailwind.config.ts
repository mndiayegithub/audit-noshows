import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    { pattern: /(bg|text|border|ring|placeholder|from|to|via)-(brand-dark|brand-darker|surface|gold|gold-light)/ },
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1a73e8",
        background: "#f9fafb",
        // Identité PerfIAmatic
        "brand-dark": "#0F172A",   // Bleu de nuit
        "brand-darker": "#020617",
        surface: "#1e293b",
        gold: "#CAA759",           // Orange grisé
        "gold-light": "#D4B869",   // Orange grisé (hover)
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -2px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
