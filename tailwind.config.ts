import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          bg: "#e0e5ec",
          dark: "#b8bec7",
          light: "#ffffff",
          text: "#2d3436",
          muted: "#636e72",
        },
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
      },
      boxShadow: {
        neu: "9px 9px 16px #b8bec7, -9px -9px 16px #ffffff",
        "neu-sm": "5px 5px 10px #b8bec7, -5px -5px 10px #ffffff",
        "neu-xs": "3px 3px 6px #b8bec7, -3px -3px 6px #ffffff",
        "neu-inset":
          "inset 5px 5px 10px #b8bec7, inset -5px -5px 10px #ffffff",
        "neu-inset-sm":
          "inset 3px 3px 6px #b8bec7, inset -3px -3px 6px #ffffff",
        "neu-flat": "3px 3px 6px #b8bec7, -3px -3px 6px #ffffff",
        "neu-btn": "5px 5px 10px #b8bec7, -5px -5px 10px #ffffff",
        "neu-btn-pressed":
          "inset 3px 3px 6px #b8bec7, inset -3px -3px 6px #ffffff",
        "neu-brand":
          "5px 5px 10px rgba(37, 99, 235, 0.3), -5px -5px 10px #ffffff",
      },
      borderRadius: {
        neu: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
