import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#faf7f2",
        ink: "#2b2620",
        // Gabinete Cerebral — paleta vintage
        parchment: "#F1E6C9",
        sepia: "#6B4A2F",
        moss: "#3E6259",
        terracotta: "#B5482D",
        brass: "#C99A45",
        oak: "#2B1D12",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ['"National Park"', "serif"],
        serif: ['"Libre Baskerville"', "Georgia", "serif"],
        stamp: ['"Special Elite"', "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
