import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    { pattern: /(bg|text|border|ring|placeholder|from|to|via)-(primary|accent|navy|danger|success|warning)/ },
  ],
  theme: {
    extend: {
      backgroundImage: {
        'plus-pattern': "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M9 9H0v2h9v9h2v-9h9V9h-9V0H9v9z'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      colors: {
        primary: "#4F46E5",       // Indigo — CTA principal, accents
        "primary-light": "#6366F1", // Hover, dégradés
        accent: "#7C3AED",        // Violet — gradient extrémité
        cyan: "#06B6D4",          // Highlights data, chiffres clés
        ink: "#07080F",           // Hero background, CTA section
        "ink-subtle": "#0E0F1C",  // Dark cards, dark sections
        danger: "#EF4444",
        success: "#10B981",
        warning: "#F59E0B",
        navy: "#0F172A",
        background: "#F8FAFC",
        surface: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        heading: ["Outfit", "DM Sans", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)",
        "card-hover": "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.05)",
        soft: "0 2px 8px -1px rgba(0,0,0,0.06), 0 4px 16px -2px rgba(0,0,0,0.04)",
        "soft-hover": "0 8px 24px -4px rgba(0,0,0,0.10), 0 4px 12px -2px rgba(0,0,0,0.06)",
      },
      animation: {
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
