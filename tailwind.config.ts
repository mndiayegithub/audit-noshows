import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    { pattern: /(bg|text|border|ring|placeholder|from|to|via)-(brand-dark|brand-darker|surface|gold|gold-light|med-blue|med-green)/ },
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hex-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='103.923' viewBox='0 0 60 103.923' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 103.923L0 86.602V51.961l30-17.32l30 17.32v34.641L30 103.923zM30 86.602l20-11.547V51.961L30 40.415L10 51.961v23.094L30 86.602zM30 34.641L0 17.32V-17.32l30-17.32l30 17.32v34.64L30 34.641z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")",
      },
      colors: {
        primary: "#1a73e8",
        background: "#f9fafb",
        // Identité PerfIAmatic
        "brand-dark": "#0A1628",   // Bleu de nuit (obligatoire)
        "brand-darker": "#060D18",
        surface: "#0D1F3C",        // Fond légèrement plus clair pour cards et témoignages
        gold: "#C9A84C",           // Doré accent
        "gold-light": "#DAB85A",   // Doré accent hover
        "med-blue": "#4FC3F7",     // Accent bleu ciel (médical)
        "med-green": "#4CAF50",    // Accent vert succès
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["DM Sans", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -2px rgba(0,0,0,0.15)",
        "card-hover": "0 20px 25px -5px rgba(0,0,0,0.25), 0 8px 10px -6px rgba(0,0,0,0.2)",
        "glow-gold": "0 0 20px rgba(201, 168, 76, 0.4)",
      },
      transitionDuration: {
        "250": "250ms",
      },
    },
  },
  plugins: [],
};

export default config;
